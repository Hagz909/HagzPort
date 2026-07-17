import { NextResponse } from 'next/server';
import { getRequiredSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getRequiredSession();
    const body = await req.json();

    const { portfolioId, title } = body;
    if (!portfolioId || !title) {
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
    }

    // Pastikan portfolio adalah milik user
    const portfolio = await prisma.portfolio.findFirst({
      where: {
        id: portfolioId,
        userId: session.user.id
      }
    });

    if (!portfolio) {
      return NextResponse.json({ message: 'Portfolio not found or unauthorized' }, { status: 404 });
    }

    // Buat data CV
    const generatedCv = await prisma.generatedCV.create({
      data: {
        portfolioId,
        title,
        publicUrl: `/cv/${portfolioId}` // Kita gunakan ID portfolio untuk rendering, atau ID dari CV itu sendiri
      }
    });

    // Update publicUrl agar mengarah ke ID unik CV tersebut
    const updatedCv = await prisma.generatedCV.update({
      where: { id: generatedCv.id },
      data: { publicUrl: `/cv/${generatedCv.id}` }
    });

    // TRIGGER NOTIFIKASI
    // 1. Notifikasi untuk User pencipta CV
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        title: 'CV Berhasil Dibuat',
        message: `CV PDF Anda ("${title}") berhasil di-generate dan siap diunduh.`,
        type: 'cv'
      }
    });

    // 2. Notifikasi untuk semua Admin
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    if (admins.length > 0) {
      const adminNotifications = admins.map(admin => ({
        userId: admin.id,
        title: 'Generate CV Baru',
        message: `User ${session.user.name} baru saja membuat dokumen CV.`,
        type: 'system'
      }));
      await prisma.notification.createMany({ data: adminNotifications });
    }

    return NextResponse.json({
      message: 'CV berhasil dibuat',
      cv: updatedCv
    });

  } catch (error) {
    console.error('CV Generation Error:', error);
    const err = error as Error;
    if (err.message === 'Unauthorized') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { message: `Terjadi kesalahan sistem: ${err.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}
