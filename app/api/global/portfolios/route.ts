import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const sort = searchParams.get('sort') || 'newest'; // newest | projects | experience

    const skip = (page - 1) * limit;

    // Build search filter
    const searchFilter = search
      ? {
          OR: [
            { fullName: { contains: search, mode: 'insensitive' as const } },
            { displayName: { contains: search, mode: 'insensitive' as const } },
            { tagline: { contains: search, mode: 'insensitive' as const } },
            { skills: { hasSome: [search] } },
          ],
        }
      : {};

    // Build sort order
    let orderBy: any = { globalPublishedAt: 'desc' };
    if (sort === 'projects') {
      orderBy = { projects: { _count: 'desc' } };
    } else if (sort === 'experience') {
      orderBy = { workExperiences: { _count: 'desc' } };
    }

    const where = {
      isGlobalPublished: true,
      isPublished: true,
      user: { isActive: true },
      ...searchFilter,
    };

    const [portfolios, total] = await Promise.all([
      prisma.portfolio.findMany({
        where,
        select: {
          id: true,
          username: true,
          displayName: true,
          fullName: true,
          tagline: true,
          profileImageUrl: true,
          skills: true,
          theme: true,
          globalPublishedAt: true,
          _count: {
            select: {
              projects: true,
              workExperiences: true,
              educations: true,
            },
          },
          user: {
            select: {
              name: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.portfolio.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      portfolios,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + portfolios.length < total,
      },
    });
  } catch (error) {
    console.error('[GLOBAL_PORTFOLIOS_GET_ERROR]', error);
    return NextResponse.json(
      { message: 'Gagal memuat portfolio global' },
      { status: 500 }
    );
  }
}
