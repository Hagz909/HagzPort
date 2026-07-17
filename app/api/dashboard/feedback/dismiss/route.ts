import { NextResponse } from 'next/server';
import { getRequiredSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getRequiredSession();
    
    await prisma.user.update({
      where: { id: session.user.id },
      data: { hasDismissedFeedback: true }
    });

    return NextResponse.json({ message: 'OK' });
  } catch (error: any) {
    console.error('Dismiss Feedback Error:', error);
    return NextResponse.json({ message: 'Terjadi kesalahan sistem' }, { status: 500 });
  }
}
