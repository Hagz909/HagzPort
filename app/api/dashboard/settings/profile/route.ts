import { NextResponse } from 'next/server';
import { getRequiredSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function PATCH(req: Request) {
  try {
    const session = await getRequiredSession();
    const body = await req.json();
    const { name, password } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ message: 'Name is required' }, { status: 400 });
    }

    const updateData: any = { name };

    if (password && typeof password === 'string' && password.length >= 8) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user!.id },
      data: updateData
    });

    return NextResponse.json({ message: 'Profile updated successfully', user: { name: updatedUser.name } });
  } catch (error: any) {
    console.error('Failed to update profile:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
