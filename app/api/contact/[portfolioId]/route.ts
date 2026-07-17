import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 'dummy_key');

const contactSchema = z.object({
  senderName: z.string().min(2, "Nama minimal 2 karakter"),
  senderEmail: z.string().email("Format email tidak valid"),
  subject: z.string().optional(),
  message: z.string().min(10, "Pesan minimal 10 karakter").max(1000),
  honeypot: z.string().max(0, "Bot detected").optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ portfolioId: string }> }
) {
  try {
    const { portfolioId } = await params;
    
    // 1. Validasi Input
    const body = await request.json();
    const result = contactSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { message: 'Validasi form gagal', errors: result.error.issues },
        { status: 400 }
      );
    }
    
    // Honeypot check
    if (result.data.honeypot) {
      return NextResponse.json({ success: true, message: "Pesan terkirim!" }, { status: 200 }); // fake success for bots
    }
    
    const { senderName, senderEmail, subject, message } = result.data;
    
    // 2. Cek Portfolio Exist & isPublished
    const portfolio = await prisma.portfolio.findUnique({
      where: { id: portfolioId },
      include: { user: true }
    });
    
    if (!portfolio || !portfolio.isPublished) {
      return NextResponse.json({ message: 'Portfolio tidak ditemukan atau tidak publik' }, { status: 404 });
    }
    
    // 3. Sanitasi
    const cleanMessage = message.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const cleanSubject = subject?.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;");
    
    // 4. Catat IP Address (Basic)
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
    
    // 5. Simpan ke Database
    await prisma.contactMessage.create({
      data: {
        portfolioId,
        senderName,
        senderEmail,
        subject: cleanSubject,
        message: cleanMessage,
        ipAddress,
      }
    });

    // 5b. In-app notification untuk pemilik portofolio
    await prisma.notification.create({
      data: {
        userId: portfolio.userId,
        title: 'Pesan Masuk Baru',
        message: `Pesan baru dari ${senderName} (${senderEmail}) di portofolio "${portfolio.username}": "${cleanSubject || 'Tanpa Subjek'}".`,
        type: 'message'
      }
    });

    // 5c. In-app notification untuk admin (monitoring)
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    if (admins.length > 0) {
      const adminNotifs = admins.map(admin => ({
        userId: admin.id,
        title: 'Interaksi Pesan Publik',
        message: `Pesan baru diterima di portofolio "${portfolio.username}" dari ${senderName} (${senderEmail}).`,
        type: 'message'
      }));
      await prisma.notification.createMany({ data: adminNotifs });
    }
    
    // 6 & 7. Kirim Email Notifikasi (jika diaktifkan)
    if (portfolio.user.emailNotification && process.env.RESEND_API_KEY) {
      const messagePreview = cleanMessage.length > 200 ? cleanMessage.slice(0, 200) + '...' : cleanMessage;
      
      try {
        await resend.emails.send({
          from: 'HgzPort Notifikasi <onboarding@resend.dev>',
          to: portfolio.user.email,
          subject: `📨 Pesan baru di portofolio /${portfolio.username}`,
          html: `
            <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto;">
              <h2>Halo ${portfolio.fullName || portfolio.user.name},</h2>
              <p>Kamu mendapat pesan baru dari <strong>${senderName}</strong> (<a href="mailto:${senderEmail}">${senderEmail}</a>):</p>
              
              <div style="background-color: #f4f4f5; padding: 16px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Subjek:</strong> ${cleanSubject || 'Tidak ada subjek'}</p>
                <p><strong>Pesan:</strong><br/>${messagePreview.replace(/\n/g, '<br/>')}</p>
              </div>
              
              <a href="${process.env.NEXTAUTH_URL}/dashboard/portfolios/${portfolioId}/inbox" style="display: inline-block; background-color: #06b6d4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Lihat Pesan Lengkap di Dashboard →
              </a>
              
              <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 30px 0;" />
              <p style="color: #71717a; font-size: 12px;">HgzPort Builder | Kelola portofolio Anda dengan mudah.</p>
            </div>
          `
        });
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
        // Jangan block response karena email gagal
      }
    }
    
    // 8. Return success
    return NextResponse.json({ success: true, message: "Pesan berhasil dikirim!" }, { status: 200 });
    
  } catch (error) {
    console.error('Contact error:', error);
    return NextResponse.json({ message: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
