import { NextResponse } from 'next/server';
import { getRequiredSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await getRequiredSession();
    
    // Pastikan hanya ADMIN
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Akses ditolak' }, { status: 403 });
    }

    // Hitung total notifikasi untuk admin ini
    const count = await prisma.notification.count({
      where: { userId: session.user.id }
    });

    let visibleActivities;

    if (count >= 65) {
      // Ambil SEMUA aktivitas (notifikasi) untuk admin ini, urutkan dari terbaru
      const allActivities = await prisma.notification.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
      });

      // Batasi 15 untuk ditampilkan di UI
      visibleActivities = allActivities.slice(0, 15);
      
      // Aktivitas yang "tenggelam" (lebih dari 15)
      const sinkingActivities = allActivities.slice(15);

      // Ambil 50 data terlama dari yang tenggelam
      // sinkingActivities sudah diurutkan dari terbaru ke terlama
      // Jadi kita ambil 50 dari ujung array (paling lama)
      const itemsToBackup = sinkingActivities.slice(-50);
      
      const rangeStart = itemsToBackup[itemsToBackup.length - 1].createdAt; // Paling lama
      const rangeEnd = itemsToBackup[0].createdAt; // Paling baru di batch ini

      // Buat backup
      await prisma.activityBackup.create({
        data: {
          userId: session.user.id,
          rangeStart,
          rangeEnd,
          recordCount: itemsToBackup.length,
          data: itemsToBackup as any, // Menyimpan seluruh JSON
        }
      });

      // Hapus dari database utama agar tidak membebani
      const idsToDelete = itemsToBackup.map(item => item.id);
      await prisma.notification.deleteMany({
        where: {
          id: { in: idsToDelete }
        }
      });
      
      console.log(`[AUTO-ARCHIVE] 50 aktivitas admin ${session.user.id} berhasil dibackup.`);
    } else {
      // Jika di bawah threshold, ambil hanya 15 data teratas saja (Lebih cepat & hemat memori)
      visibleActivities = await prisma.notification.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        take: 15
      });
    }

    return NextResponse.json({ activities: visibleActivities });
  } catch (error: any) {
    console.error('Fetch Admin Activities Error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ message: 'Terjadi kesalahan sistem' }, { status: 500 });
  }
}
