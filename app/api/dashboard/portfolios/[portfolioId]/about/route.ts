import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateOwnership } from '@/lib/auth-helpers';
import { z } from 'zod';

const aboutSchema = z.object({
  bio: z.string().max(1000).nullable().optional(),
  linkedinUrl: z.union([z.literal(''), z.string().url('URL tidak valid')]).nullable().optional(),
  githubUrl: z.union([z.literal(''), z.string().url('URL tidak valid')]).nullable().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ portfolioId: string }> }
) {
  try {
    const { portfolioId } = await params;
    const { portfolio } = await validateOwnership(portfolioId);

    return NextResponse.json({
      bio: portfolio.bio || '',
      linkedinUrl: portfolio.linkedinUrl || '',
      githubUrl: portfolio.githubUrl || '',
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json({ message: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    return NextResponse.json({ message: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ portfolioId: string }> }
) {
  try {
    const { portfolioId } = await params;
    const { session, portfolio } = await validateOwnership(portfolioId);

    const body = await request.json();
    const result = aboutSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: 'Validasi gagal', errors: result.error.issues },
        { status: 400 }
      );
    }

    const data = result.data;

    const updated = await prisma.portfolio.update({
      where: { id: portfolio.id },
      data: {
        bio: data.bio || null,
        linkedinUrl: data.linkedinUrl || null,
        githubUrl: data.githubUrl || null,
      },
    });

    // Notifikasi Admin (monitoring update konten)
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    if (admins.length > 0) {
      const adminNotifs = admins.map(admin => ({
        userId: admin.id,
        title: 'Pembaruan About Section',
        message: `Pengguna ${session.user!.name || session.user!.email} memperbarui about section portofolio "${portfolio.displayName || portfolio.username}".`,
        type: 'system'
      }));
      await prisma.notification.createMany({ data: adminNotifs });
    }

    return NextResponse.json({ success: true, portfolio: updated });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json({ message: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    return NextResponse.json({ message: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
