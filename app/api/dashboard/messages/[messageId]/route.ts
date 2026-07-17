import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRequiredSession } from '@/lib/auth-helpers';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const session = await getRequiredSession();
    const { messageId } = await params;

    // Verify ownership
    const message = await prisma.contactMessage.findUnique({
      where: { id: messageId },
      include: { portfolio: true }
    });

    if (!message) {
      return NextResponse.json({ message: 'Pesan tidak ditemukan' }, { status: 404 });
    }

    if (message.portfolio.userId !== session.user.id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    await prisma.contactMessage.delete({
      where: { id: messageId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const err = error as Error;
    if (err.message === 'Unauthorized') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
