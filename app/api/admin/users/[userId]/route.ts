import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await getAdminSession();
    const { userId } = await params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        portfolios: {
          include: {
            _count: {
              select: { projects: true, educations: true, contactMessages: true }
            }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error: any) {
    console.error('Failed to get user:', error);
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json({ message: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getAdminSession();
    const { userId } = await params;

    // Prevent admin from deleting themselves
    if (session.user!.id === userId) {
      return NextResponse.json(
        { message: 'Anda tidak dapat menghapus akun Anda sendiri' },
        { status: 400 }
      );
    }

    // Prisma cascade delete will automatically remove Portfolios, Projects, etc.
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    console.error('Failed to delete user:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json({ message: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
