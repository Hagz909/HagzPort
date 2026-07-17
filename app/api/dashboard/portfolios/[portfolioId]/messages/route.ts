import { NextResponse } from 'next/server';
import { getRequiredSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ portfolioId: string }> }
) {
  try {
    const session = await getRequiredSession();
    const { portfolioId } = await params;

    // Verify ownership
    const portfolio = await prisma.portfolio.findFirst({
      where: {
        id: portfolioId,
        userId: session.user!.id
      }
    });

    if (!portfolio) {
      return NextResponse.json({ message: 'Portfolio not found or unauthorized' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'all'; // 'unread', 'read', 'all'
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 10;
    const skip = (page - 1) * limit;

    const where: Prisma.ContactMessageWhereInput = {
      portfolioId,
      ...(status === 'unread' && { isRead: false }),
      ...(status === 'read' && { isRead: true }),
    };

    const [messages, total, unreadCount] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      prisma.contactMessage.count({ where }),
      prisma.contactMessage.count({
        where: { portfolioId, isRead: false }
      })
    ]);

    return NextResponse.json({
      messages,
      unreadCount,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit
      }
    });

  } catch (error: any) {
    console.error('Failed to fetch messages:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
