import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRequiredSession } from '@/lib/auth-helpers';
import { z } from 'zod';

const checkSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-z0-9-]+$/),
});

export async function POST(request: Request) {
  try {
    const session = await getRequiredSession();
    const body = await request.json();

    const result = checkSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ available: false }, { status: 400 });
    }

    const { username } = result.data;

    const existing = await prisma.portfolio.findUnique({
      where: { username },
    });

    if (existing && existing.userId !== session.user!.id) {
      return NextResponse.json({ available: false });
    }

    return NextResponse.json({ available: true });
  } catch (error) {
    return NextResponse.json({ available: false }, { status: 500 });
  }
}
