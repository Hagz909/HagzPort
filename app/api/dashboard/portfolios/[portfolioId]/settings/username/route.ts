import { NextResponse } from 'next/server';
import { getRequiredSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

const USERNAME_REGEX = /^[a-z0-9-]{3,30}$/;
const USERNAME_BLACKLIST = [
  'admin', 'api', 'dashboard', 'login', 'register', 'logout', 'settings',
  'profile', 'public', 'static', 'about', 'contact', 'home', 'index',
  'null', 'undefined'
];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ portfolioId: string }> }
) {
  try {
    const session = await getRequiredSession();
    const { portfolioId } = await params;
    const body = await req.json();
    const { username } = body;

    if (!username || typeof username !== 'string') {
      return NextResponse.json({ message: 'Username tidak valid' }, { status: 400 });
    }

    const cleanUsername = username.toLowerCase().trim();

    if (!USERNAME_REGEX.test(cleanUsername)) {
      return NextResponse.json({ message: 'Format username tidak valid (hanya a-z, 0-9, dan strip)' }, { status: 400 });
    }

    if (USERNAME_BLACKLIST.includes(cleanUsername)) {
      return NextResponse.json({ message: 'Username ini tidak dapat digunakan (reserved)' }, { status: 400 });
    }

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

    // If username is same, do nothing
    if (portfolio.username === cleanUsername) {
      return NextResponse.json({ message: 'Username sama dengan sebelumnya' });
    }

    // Check uniqueness
    const existing = await prisma.portfolio.findUnique({
      where: { username: cleanUsername }
    });

    if (existing) {
      return NextResponse.json({ message: 'Username sudah digunakan oleh pengguna lain' }, { status: 400 });
    }

    // Update username and set usernameChangedAt
    const updatedPortfolio = await prisma.portfolio.update({
      where: { id: portfolioId },
      data: {
        username: cleanUsername,
        usernameChangedAt: new Date()
      }
    });

    return NextResponse.json({ 
      message: 'Username berhasil diperbarui',
      username: updatedPortfolio.username 
    });

  } catch (error: any) {
    console.error('Failed to update username:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
