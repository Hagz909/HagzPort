import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateOwnership } from '@/lib/auth-helpers';
import { z } from 'zod';

const heroSchema = z.object({
  tagline: z.string().max(100).nullable().optional(),
  quote: z.string().max(200).nullable().optional(),
  profileImageUrl: z.string().nullable().optional(),
  profileImagePublicId: z.string().nullable().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ portfolioId: string }> }
) {
  try {
    const { portfolioId } = await params;
    const { portfolio } = await validateOwnership(portfolioId);

    return NextResponse.json({
      tagline: portfolio.tagline || '',
      quote: portfolio.quote || '',
      profileImageUrl: portfolio.profileImageUrl || '',
      profileImagePublicId: portfolio.profileImagePublicId || '',
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
    const result = heroSchema.safeParse(body);

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
        tagline: data.tagline || null,
        quote: data.quote || null,
        profileImageUrl: data.profileImageUrl || null,
        profileImagePublicId: data.profileImagePublicId || null,
      },
    });

    // Notifikasi Admin (monitoring update konten)
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    if (admins.length > 0) {
      const adminNotifs = admins.map(admin => ({
        userId: admin.id,
        title: 'Pembaruan Hero Section',
        message: `Pengguna ${session.user!.name || session.user!.email} memperbarui hero section portofolio "${portfolio.displayName || portfolio.username}".`,
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
