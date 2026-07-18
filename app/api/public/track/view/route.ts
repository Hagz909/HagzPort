import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { portfolioId } = body;

    if (!portfolioId) {
      return NextResponse.json({ message: 'Missing portfolioId' }, { status: 400 });
    }

    // Increment views
    await prisma.portfolio.update({
      where: { id: portfolioId },
      data: {
        views: { increment: 1 }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to track view:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
