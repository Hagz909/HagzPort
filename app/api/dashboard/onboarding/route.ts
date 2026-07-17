import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRequiredSession } from '@/lib/auth-helpers';
import { z } from 'zod';

const onboardingSchema = z.object({
  username: z
    .string()
    .min(3, 'Username minimal 3 karakter')
    .max(30, 'Username maksimal 30 karakter')
    .regex(/^[a-z0-9-]+$/, 'Hanya huruf kecil, angka, dan strip yang diperbolehkan'),
});

const blacklist = [
  'admin', 'api', 'dashboard', 'login', 'register', 'logout', 'settings',
  'profile', 'public', 'static', 'about', 'contact', 'home', 'index',
  'null', 'undefined'
];

export async function PATCH(request: Request) {
  try {
    const session = await getRequiredSession();
    const body = await request.json();

    const result = onboardingSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { message: 'Validasi gagal', errors: result.error.issues },
        { status: 400 }
      );
    }

    const { username } = result.data;

    if (blacklist.includes(username)) {
      return NextResponse.json(
        { message: 'Username tidak diizinkan' },
        { status: 400 }
      );
    }

    // Cek ketersediaan
    const existing = await prisma.portfolio.findUnique({
      where: { username },
    });

    if (existing && existing.userId !== session.user!.id) {
      return NextResponse.json(
        { message: 'Username sudah digunakan' },
        { status: 409 }
      );
    }

    // Update the user's default portfolio and mark usernameChangedAt
    const user = await prisma.user.findUnique({
      where: { id: session.user!.id },
      include: { portfolios: { where: { isDefault: true } } },
    });

    if (!user || user.portfolios.length === 0) {
      return NextResponse.json({ message: 'Portofolio default tidak ditemukan' }, { status: 404 });
    }

    await prisma.portfolio.update({
      where: { id: user.portfolios[0].id },
      data: { 
        username,
        usernameChangedAt: new Date()
      },
    });

    return NextResponse.json({ success: true, message: 'Username berhasil diatur' });
  } catch (error: any) {
    console.error('Onboarding Error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { message: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
