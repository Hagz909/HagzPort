import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateOwnership } from '@/lib/auth-helpers';
import { checkPortfolioCompleteness } from '@/lib/portfolio-completeness';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ portfolioId: string }> }
) {
  try {
    const { portfolioId } = await params;
    await validateOwnership(portfolioId);

    const result = await checkPortfolioCompleteness(portfolioId);

    const portfolio = await prisma.portfolio.findUnique({
      where: { id: portfolioId },
      select: { isGlobalPublished: true, globalPublishedAt: true },
    });

    return NextResponse.json({
      success: true,
      isGlobalPublished: portfolio?.isGlobalPublished || false,
      globalPublishedAt: portfolio?.globalPublishedAt || null,
      completeness: result,
    });
  } catch (error: any) {
    console.error('[GLOBAL_PUBLISH_GET_ERROR]', error);
    return NextResponse.json(
      { message: error.message || 'Gagal memuat status global' },
      { status: error.message === 'Unauthorized' ? 401 : error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ portfolioId: string }> }
) {
  try {
    const { portfolioId } = await params;
    const { session, portfolio } = await validateOwnership(portfolioId);

    const body = await request.json();
    const { isGlobalPublished } = body;

    if (typeof isGlobalPublished !== 'boolean') {
      return NextResponse.json(
        { message: 'Field isGlobalPublished (boolean) wajib disertakan' },
        { status: 400 }
      );
    }

    // Jika ingin publish ke global, cek kelengkapan data
    if (isGlobalPublished) {
      const completeness = await checkPortfolioCompleteness(portfolioId);

      if (!completeness.isComplete) {
        return NextResponse.json(
          {
            message: `Data portfolio belum lengkap (${completeness.percentage}%). Lengkapi terlebih dahulu sebelum publish ke Global.`,
            completeness,
          },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.portfolio.update({
      where: { id: portfolioId },
      data: {
        isGlobalPublished,
        globalPublishedAt: isGlobalPublished ? new Date() : null,
      },
    });

    // Trigger notifikasi ke Admin
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    if (admins.length > 0) {
      const action = isGlobalPublished ? 'mempublikasikan' : 'menarik';
      const adminNotifications = admins.map(admin => ({
        userId: admin.id,
        title: isGlobalPublished ? 'Portfolio Global Baru' : 'Portfolio Ditarik dari Global',
        message: `Pengguna ${session.user!.name || session.user!.email} ${action} portofolio "${portfolio.displayName || portfolio.username}" ${isGlobalPublished ? 'ke' : 'dari'} Global Showcase.`,
        type: 'system',
      }));
      await prisma.notification.createMany({ data: adminNotifications });
    }

    return NextResponse.json({
      success: true,
      portfolio: {
        isGlobalPublished: updated.isGlobalPublished,
        globalPublishedAt: updated.globalPublishedAt,
      },
    });
  } catch (error: any) {
    console.error('[GLOBAL_PUBLISH_PATCH_ERROR]', error);
    return NextResponse.json(
      { message: error.message || 'Gagal mengubah status global' },
      { status: error.message === 'Unauthorized' ? 401 : error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}
