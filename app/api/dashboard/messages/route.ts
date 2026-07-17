import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRequiredSession } from '@/lib/auth-helpers';

export async function GET(request: Request) {
  try {
    const session = await getRequiredSession();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';

    // Cari ID semua portfolio milik user ini
    const userPortfolios = await prisma.portfolio.findMany({
      where: { userId: session.user.id },
      select: { id: true, username: true, displayName: true }
    });

    const portfolioIds = userPortfolios.map(p => p.id);

    // Filter status pesan
    const whereClause: any = { portfolioId: { in: portfolioIds } };
    if (status === 'unread') {
      whereClause.isRead = false;
    } else if (status === 'read') {
      whereClause.isRead = true;
    }

    const messages = await prisma.contactMessage.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        portfolio: {
          select: { username: true, displayName: true }
        }
      }
    });

    return NextResponse.json({ messages });
  } catch (error) {
    const err = error as Error;
    if (err.message === 'Unauthorized') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
