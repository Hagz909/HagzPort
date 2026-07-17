import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateOwnership } from '@/lib/auth-helpers';
import { z } from 'zod';

const testimonialSchema = z.object({
  clientName: z.string().min(1, 'Nama klien wajib diisi').max(100, 'Nama klien terlalu panjang'),
  clientRole: z.string().max(100, 'Peran/Jabatan klien terlalu panjang').nullable().optional(),
  quote: z.string().min(5, 'Kutipan testimonial minimal 5 karakter').max(500, 'Kutipan testimonial terlalu panjang'),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ portfolioId: string }> }
) {
  try {
    const { portfolioId } = await params;
    // Validasi kepemilikan portfolio
    await validateOwnership(portfolioId);

    const testimonials = await prisma.testimonial.findMany({
      where: { portfolioId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, testimonials });
  } catch (error: any) {
    console.error('[TESTIMONIALS_GET_ERROR]', error);
    return NextResponse.json(
      { message: error.message || 'Gagal memuat testimoni klien' },
      { status: error.message === 'Unauthorized' ? 401 : error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ portfolioId: string }> }
) {
  try {
    const { portfolioId } = await params;
    const { session } = await validateOwnership(portfolioId);

    const body = await request.json();
    const result = testimonialSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: 'Validasi gagal', errors: result.error.issues },
        { status: 400 }
      );
    }

    const { clientName, clientRole, quote } = result.data;

    const testimonial = await prisma.testimonial.create({
      data: {
        portfolioId,
        clientName,
        clientRole: clientRole || null,
        quote,
      },
    });

    // Buat notifikasi log sistem untuk Admin
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    if (admins.length > 0) {
      const adminNotifications = admins.map(admin => ({
        userId: admin.id,
        title: 'Testimonial Klien Ditambahkan',
        message: `Pengguna ${session.user!.name || session.user!.email} menambahkan testimonial klien baru dari "${clientName}".`,
        type: 'system',
      }));
      await prisma.notification.createMany({ data: adminNotifications });
    }

    return NextResponse.json({ success: true, testimonial }, { status: 201 });
  } catch (error: any) {
    console.error('[TESTIMONIALS_POST_ERROR]', error);
    return NextResponse.json(
      { message: error.message || 'Gagal menyimpan testimonial' },
      { status: error.message === 'Unauthorized' ? 401 : error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}
