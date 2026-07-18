import { NextResponse } from 'next/server';
import { getRequiredSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getRequiredSession();

    const cvLogs = await prisma.generatedCV.findMany({
      where: {
        portfolio: {
          userId: session.user.id
        }
      },
      include: {
        portfolio: {
          select: {
            username: true,
            displayName: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(cvLogs);
  } catch (error: any) {
    console.error('Fetch CV Logs Error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ message: 'Terjadi kesalahan internal server' }, { status: 500 });
  }
}
