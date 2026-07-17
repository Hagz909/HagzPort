import { NextResponse } from 'next/server';
import { getRequiredSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await getRequiredSession();
    
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { feedback: true }
    });

    if (!user) {
      return NextResponse.json({ shouldShow: false });
    }

    // Tampilkan pop-up HANYA JIKA user belum memberikan ulasan DAN belum pernah men-dismiss
    const shouldShow = !user.feedback && !user.hasDismissedFeedback;

    return NextResponse.json({ shouldShow });
  } catch (error: any) {
    console.error('Fetch Feedback Status Error:', error);
    return NextResponse.json({ shouldShow: false }, { status: 500 });
  }
}
