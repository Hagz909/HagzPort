import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth-helpers';

export async function GET(request: Request) {
  try {
    await getAdminSession();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all'; // all | published | unpublished

    // Build filter
    const statusFilter =
      status === 'published'
        ? { isGlobalPublished: true }
        : status === 'unpublished'
        ? { isGlobalPublished: false, isPublished: true }
        : {};

    const searchFilter = search
      ? {
          OR: [
            { fullName: { contains: search, mode: 'insensitive' as const } },
            { username: { contains: search, mode: 'insensitive' as const } },
            { user: { name: { contains: search, mode: 'insensitive' as const } } },
            { user: { email: { contains: search, mode: 'insensitive' as const } } },
          ],
        }
      : {};

    const portfolios = await prisma.portfolio.findMany({
      where: {
        isPublished: true,
        ...statusFilter,
        ...searchFilter,
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        fullName: true,
        tagline: true,
        profileImageUrl: true,
        theme: true,
        isPublished: true,
        isGlobalPublished: true,
        globalPublishedAt: true,
        createdAt: true,
        _count: {
          select: {
            projects: true,
            workExperiences: true,
            contactMessages: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            isActive: true,
          },
        },
      },
      orderBy: { globalPublishedAt: { sort: 'desc', nulls: 'last' } },
    });

    // Statistik ringkasan
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [totalGlobal, newThisWeek, totalPublished] = await Promise.all([
      prisma.portfolio.count({ where: { isGlobalPublished: true } }),
      prisma.portfolio.count({
        where: { isGlobalPublished: true, globalPublishedAt: { gte: oneWeekAgo } },
      }),
      prisma.portfolio.count({ where: { isPublished: true } }),
    ]);

    return NextResponse.json({
      success: true,
      portfolios,
      stats: {
        totalGlobal,
        newThisWeek,
        totalPublished,
      },
    });
  } catch (error: any) {
    console.error('[ADMIN_GLOBAL_GET_ERROR]', error);
    return NextResponse.json(
      { message: error.message || 'Gagal memuat data global' },
      { status: error.message === 'Unauthorized' ? 401 : error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}
