import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    await getAdminSession();
    const { messageId } = await params;

    const message = await prisma.contactMessage.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      return NextResponse.json({ message: 'Message not found' }, { status: 404 });
    }

    const updatedMessage = await prisma.contactMessage.update({
      where: { id: messageId },
      data: { isRead: !message.isRead },
    });

    return NextResponse.json(updatedMessage);
  } catch (error: any) {
    console.error('Failed to toggle message read status:', error);
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json({ message: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
