import { NextResponse } from 'next/server';
import { getRequiredSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await getRequiredSession();

    // Dapatkan semua portfolio milik user beserta relasinya
    const portfolios = await prisma.portfolio.findMany({
      where: { userId: session.user.id },
      include: {
        projects: true,
        contactMessages: true,
      },
    });

    if (!portfolios || portfolios.length === 0) {
      return NextResponse.json({
        totalPortfolios: 0,
        totalProjects: 0,
        totalMessages: 0,
        unreadMessages: 0,
        completionRate: 0,
        defaultUsername: null,
      });
    }

    // Kalkulasi Total
    const totalPortfolios = portfolios.length;
    let totalProjects = 0;
    let totalMessages = 0;
    let unreadMessages = 0;

    portfolios.forEach(p => {
      totalProjects += p.projects.length;
      totalMessages += p.contactMessages.length;
      unreadMessages += p.contactMessages.filter(m => !m.isRead).length;
    });

    // Kalkulasi Profil Completion dari Default Portfolio
    const defaultPortfolio = portfolios.find(p => p.isDefault) || portfolios[0];
    let completionScore = 20; // Dasar (karena portfolio sdh ada)
    
    if (defaultPortfolio.fullName) completionScore += 20;
    if (defaultPortfolio.bio || defaultPortfolio.tagline) completionScore += 20;
    if (defaultPortfolio.profileImageUrl) completionScore += 20;
    if (defaultPortfolio.projects.length > 0) completionScore += 20;

    return NextResponse.json({
      totalPortfolios,
      totalProjects,
      totalMessages,
      unreadMessages,
      completionRate: completionScore,
      defaultUsername: defaultPortfolio.username,
      defaultPortfolioId: defaultPortfolio.id,
    });
  } catch (error: any) {
    console.error('Overview Stats Error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { message: 'Terjadi kesalahan sistem' },
      { status: 500 }
    );
  }
}
