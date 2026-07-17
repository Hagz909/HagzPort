import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    await getAdminSession();

    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || '1d';

    // Determine date range
    const now = new Date();
    let since: Date;
    if (period === '1w') {
      since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === '1m') {
      since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else {
      since = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    const [
      totalUsers,
      totalPortfolios,
      totalProjects,
      unreadMessages,
      recentUsers,
      // Time-scoped counts from notifications
      portfolioUpdates,
      projectsAdded,
      messageInteractions
    ] = await Promise.all([
      prisma.user.count(),
      prisma.portfolio.count(),
      prisma.project.count(),
      prisma.contactMessage.count({ where: { isRead: false } }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true
        }
      }),
      // Count portfolio-related notifications in period
      prisma.notification.count({
        where: {
          createdAt: { gte: since },
          type: 'system',
          title: { in: ['Pembaruan Hero Section', 'Pembaruan About Section', 'Pembaruan Biodata', 'Pengaturan Portofolio Diperbarui', 'Portofolio Publik Baru', 'Pembuatan Portofolio Baru', 'Penghapusan Portofolio'] }
        }
      }),
      // Count project additions in period
      prisma.notification.count({
        where: {
          createdAt: { gte: since },
          type: 'system',
          title: { in: ['Proyek Ditambahkan', 'Pendidikan Ditambahkan', 'Proyek Diperbarui', 'Pendidikan Diperbarui', 'Proyek Dihapus', 'Pendidikan Dihapus', 'Pengalaman Kerja Ditambahkan', 'Pengalaman Kerja Diperbarui', 'Pengalaman Kerja Dihapus'] }
        }
      }),
      // Count message interactions in period
      prisma.notification.count({
        where: {
          createdAt: { gte: since },
          type: 'message'
        }
      })
    ]);

    // Active users = users who triggered any notification in the period
    const activeUserIds = await prisma.notification.findMany({
      where: {
        createdAt: { gte: since },
        type: 'system'
      },
      select: { userId: true },
      distinct: ['userId']
    });

    // Generate Graph Data
    const notificationsInPeriod = await prisma.notification.findMany({
      where: { createdAt: { gte: since }, type: 'system' },
      select: { createdAt: true }
    });

    const graphDataMap = new Map<string, number>();
    let curr = new Date(since);
    while (curr <= now) {
      const dateStr = curr.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
      graphDataMap.set(dateStr, 0);
      curr.setDate(curr.getDate() + 1);
    }

    notificationsInPeriod.forEach(n => {
      const dateStr = new Date(n.createdAt).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
      if (graphDataMap.has(dateStr)) {
        graphDataMap.set(dateStr, graphDataMap.get(dateStr)! + 1);
      }
    });

    const graphData = Array.from(graphDataMap.entries()).map(([date, count]) => ({
      date,
      aktivitas: count
    }));

    return NextResponse.json({
      totalUsers,
      totalPortfolios,
      totalProjects,
      unreadMessages,
      recentUsers,
      // Period-scoped stats
      periodStats: {
        activeUsers: activeUserIds.length,
        portfolioUpdates,
        projectsAdded,
        messageInteractions,
      },
      graphData
    });
  } catch (error) {
    const err = error as Error;
    console.error('Failed to fetch admin stats:', err);
    if (err.message === 'Unauthorized' || err.message === 'Forbidden') {
      return NextResponse.json({ message: err.message }, { status: err.message === 'Unauthorized' ? 401 : 403 });
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
