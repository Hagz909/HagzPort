import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(req: Request) {
  try {
    await getAdminSession();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const isRead = searchParams.get('isRead');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where: Prisma.ContactMessageWhereInput = {
      ...(search && {
        OR: [
          { senderName: { contains: search, mode: 'insensitive' } },
          { senderEmail: { contains: search, mode: 'insensitive' } },
          { subject: { contains: search, mode: 'insensitive' } },
          { message: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(isRead && { isRead: isRead === 'true' }),
    };

    const [messages, total] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        take: limit,
        skip,
        orderBy: { createdAt: 'desc' },
        include: {
          portfolio: {
            select: {
              username: true,
              user: {
                select: { name: true, email: true }
              }
            }
          }
        }
      }),
      prisma.contactMessage.count({ where })
    ]);

    return NextResponse.json({
      messages,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit
      }
    });
  } catch (error: any) {
    console.error('Failed to fetch admin messages:', error);
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json({ message: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
