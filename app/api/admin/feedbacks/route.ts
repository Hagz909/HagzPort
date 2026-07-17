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

    const feedbacks = await prisma.userFeedback.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true, portfolios: { select: { username: true } } } }
      }
    });

    return NextResponse.json({ feedbacks });
  } catch (error: any) {
    console.error('Fetch Admin Feedbacks Error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ message: 'Terjadi kesalahan sistem' }, { status: 500 });
  }
}
