import { NextResponse } from 'next/server';
import { getRequiredSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ portfolioId: string; messageId: string }> }
) {
  try {
    const session = await getRequiredSession();
    const { portfolioId, messageId } = await params;

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

    const message = await prisma.contactMessage.findFirst({
      where: {
        id: messageId,
        portfolioId
      }
    });

    if (!message) {
      return NextResponse.json({ message: 'Message not found' }, { status: 404 });
    }

    await prisma.contactMessage.delete({
      where: { id: messageId }
    });

    return NextResponse.json({ message: 'Message deleted successfully' });

  } catch (error: any) {
    console.error('Failed to delete message:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
