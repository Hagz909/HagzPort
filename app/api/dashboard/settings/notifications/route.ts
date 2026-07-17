import { NextResponse } from 'next/server';
import { getRequiredSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request) {
  try {
    const session = await getRequiredSession();
    const body = await req.json();
    const { emailNotification } = body;

    if (typeof emailNotification !== 'boolean') {
      return NextResponse.json({ message: 'Invalid payload' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user!.id },
      data: { emailNotification }
    });

    return NextResponse.json({ message: 'Notification settings updated', emailNotification: updatedUser.emailNotification });
  } catch (error: any) {
    console.error('Failed to update notifications:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
