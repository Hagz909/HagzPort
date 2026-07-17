import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function getRequiredSession() {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized'); // Use try/catch in route to handle this, or return null and let route handle
  }
  return session;
}

interface ExtendedUser {
  id: string;
  email: string;
  name?: string | null;
  role: string;
}

export async function getAdminSession() {
  const session = await getRequiredSession();
  const user = session.user as ExtendedUser;
  if (user.role !== 'ADMIN') {
    throw new Error('Forbidden');
  }
  return session;
}

export async function getUserPortfolio(portfolioId: string, userId: string) {
  const portfolio = await prisma.portfolio.findUnique({
    where: { id: portfolioId },
  });

  if (!portfolio) {
    throw new Error('Not Found');
  }

  if (portfolio.userId !== userId) {
    throw new Error('Forbidden');
  }

  return portfolio;
}

export async function validateOwnership(portfolioId: string) {
  const session = await getRequiredSession();
  const portfolio = await getUserPortfolio(portfolioId, session.user.id);
  return { session, portfolio };
}
