import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const { type } = data;

    // 1. UPDATE PROFILE
    if (type === 'profile') {
      const { name } = data;
      if (!name || name.trim() === '') {
        return NextResponse.json({ error: 'Nama tidak boleh kosong' }, { status: 400 });
      }

      await prisma.user.update({
        where: { id: session.user.id },
        data: { name: name.trim() },
      });

      return NextResponse.json({ message: 'Profil berhasil diperbarui' });
    }

    // 2. UPDATE PASSWORD
    if (type === 'password') {
      const { currentPassword, newPassword } = data;
      if (!currentPassword || !newPassword) {
        return NextResponse.json({ error: 'Data password tidak lengkap' }, { status: 400 });
      }
      if (newPassword.length < 6) {
        return NextResponse.json({ error: 'Password baru minimal 6 karakter' }, { status: 400 });
      }

      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
      });

      if (!user) {
        return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return NextResponse.json({ error: 'Password saat ini salah' }, { status: 400 });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);
      await prisma.user.update({
        where: { id: session.user.id },
        data: { password: hashedPassword },
      });

      return NextResponse.json({ message: 'Password berhasil diperbarui' });
    }

    return NextResponse.json({ error: 'Tipe operasi tidak valid' }, { status: 400 });

  } catch (error: any) {
    console.error('Settings API Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
