import { NextResponse } from 'next/server';
import { getRequiredSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getRequiredSession();
    const { rating, comment } = await req.json();

    if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json({ message: 'Rating tidak valid' }, { status: 400 });
    }

    // Cek jika sudah ada
    const existing = await prisma.userFeedback.findUnique({
      where: { userId: session.user.id }
    });

    if (existing) {
      return NextResponse.json({ message: 'Anda sudah pernah memberikan ulasan' }, { status: 400 });
    }

    // Buat feedback
    const feedback = await prisma.userFeedback.create({
      data: {
        userId: session.user.id,
        rating,
        comment
      }
    });

    // TRIGGER NOTIFIKASI ADMIN
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    if (admins.length > 0) {
      const adminNotifications = admins.map(admin => ({
        userId: admin.id,
        title: 'Feedback Pengguna Baru',
        message: `User ${session.user.name} memberikan rating ${rating} bintang untuk platform ini.`,
        type: 'system'
      }));
      await prisma.notification.createMany({ data: adminNotifications });
    }

    return NextResponse.json({ message: 'Terima kasih atas masukan Anda!' });
  } catch (error: any) {
    console.error('Submit Feedback Error:', error);
    return NextResponse.json({ message: 'Terjadi kesalahan sistem' }, { status: 500 });
  }
}
