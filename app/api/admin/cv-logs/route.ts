import { NextResponse } from 'next/server';
import { getRequiredSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await getRequiredSession();
    
    // Hanya ADMIN
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const cvLogs = await prisma.generatedCV.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        portfolio: {
          include: {
            user: {
              select: { name: true, email: true }
            }
          }
        }
      }
    });

    return NextResponse.json({ logs: cvLogs });
  } catch (error: any) {
    console.error('Fetch CV Logs Error:', error);
    return NextResponse.json({ message: 'Terjadi kesalahan' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getRequiredSession();
    
    // Hanya ADMIN
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ message: 'ID log tidak valid' }, { status: 400 });
    }

    // Ambil detail log untuk data notifikasi sistem
    const log = await prisma.generatedCV.findUnique({
      where: { id },
      include: {
        portfolio: {
          include: {
            user: { select: { name: true, email: true } }
          }
        }
      }
    });

    if (!log) {
      return NextResponse.json({ message: 'Log tidak ditemukan' }, { status: 404 });
    }

    // Hapus log dari database
    await prisma.generatedCV.delete({
      where: { id }
    });

    // Buat notifikasi audit admin (monitoring)
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    if (admins.length > 0) {
      const adminNotifications = admins.map(admin => ({
        userId: admin.id,
        title: 'Penghapusan Log CV',
        message: `Admin ${session.user.name || session.user.email} menghapus log generate CV "${log.title}" milik pengguna ${log.portfolio.user.name}.`,
        type: 'system'
      }));
      await prisma.notification.createMany({ data: adminNotifications });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete CV Log Error:', error);
    return NextResponse.json({ message: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
