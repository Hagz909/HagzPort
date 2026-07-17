import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRequiredSession } from '@/lib/auth-helpers';

export async function GET() {
  try {
    const session = await getRequiredSession();

    const portfolios = await prisma.portfolio.findMany({
      where: { userId: session.user!.id },
      include: {
        _count: {
          select: { projects: true, educations: true, contactMessages: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(portfolios);
  } catch (error) {
    const err = error as Error;
    if (err.message === 'Unauthorized') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { message: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const session = await getRequiredSession();
    
    // Generate temporary username
    const tempUsername = `portfolio-${Math.floor(10000 + Math.random() * 90000)}`;

    const portfolio = await prisma.portfolio.create({
      data: {
        userId: session.user!.id,
        username: tempUsername,
        displayName: 'Portofolio Baru',
        isDefault: false,
        isPublished: false,
      },
    });

    // 1. Notifikasi untuk User (terbatas)
    await prisma.notification.create({
      data: {
        userId: session.user!.id,
        title: 'Portofolio Ditambahkan',
        message: `Portofolio baru dengan username "${tempUsername}" berhasil dibuat.`,
        type: 'portfolio'
      }
    });

    // 2. Notifikasi untuk Admin (monitoring)
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    if (admins.length > 0) {
      const adminNotifications = admins.map(admin => ({
        userId: admin.id,
        title: 'Pembuatan Portofolio Baru',
        message: `Pengguna ${session.user!.name || session.user!.email} membuat portofolio baru dengan username "${tempUsername}".`,
        type: 'system'
      }));
      await prisma.notification.createMany({ data: adminNotifications });
    }

    return NextResponse.json({ success: true, portfolio }, { status: 201 });
  } catch (error) {
    console.error('Create Portfolio Error:', error);
    const err = error as Error;
    if (err.message === 'Unauthorized') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { message: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
