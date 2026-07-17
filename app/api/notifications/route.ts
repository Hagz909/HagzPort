import { NextResponse } from 'next/server';
import { getRequiredSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

// Mengambil seluruh notifikasi milik user (termasuk Admin, berdasarkan userId)
export async function GET(req: Request) {
  try {
    const session = await getRequiredSession();
    
    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50 // Batasi 50 notifikasi terakhir
    });

    return NextResponse.json({ notifications });
  } catch (error: any) {
    console.error('Fetch Notifications Error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ message: 'Terjadi kesalahan sistem' }, { status: 500 });
  }
}

// Menandai notifikasi sebagai "Sudah dibaca" (isRead = true)
export async function PATCH(req: Request) {
  try {
    const session = await getRequiredSession();
    const body = await req.json();
    
    // Jika id tidak dikirimkan, tandai semua notifikasi milik user ini sebagai sudah dibaca
    if (!body.id) {
      await prisma.notification.updateMany({
        where: { userId: session.user.id, isRead: false },
        data: { isRead: true }
      });
    } else {
      // Jika id spesifik, update 1 baris
      await prisma.notification.updateMany({
        where: { id: body.id, userId: session.user.id },
        data: { isRead: true }
      });
    }

    return NextResponse.json({ message: 'Notifikasi berhasil diupdate' });
  } catch (error: any) {
    console.error('Update Notifications Error:', error);
    return NextResponse.json({ message: 'Terjadi kesalahan sistem' }, { status: 500 });
  }
}
