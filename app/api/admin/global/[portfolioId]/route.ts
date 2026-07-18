import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth-helpers';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ portfolioId: string }> }
) {
  try {
    const session = await getAdminSession();
    const { portfolioId } = await params;

    const body = await request.json();
    const { isGlobalPublished, reason } = body;

    if (typeof isGlobalPublished !== 'boolean') {
      return NextResponse.json(
        { message: 'Field isGlobalPublished (boolean) wajib disertakan' },
        { status: 400 }
      );
    }

    const portfolio = await prisma.portfolio.findUnique({
      where: { id: portfolioId },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    if (!portfolio) {
      return NextResponse.json({ message: 'Portfolio tidak ditemukan' }, { status: 404 });
    }

    const updated = await prisma.portfolio.update({
      where: { id: portfolioId },
      data: {
        isGlobalPublished,
        globalPublishedAt: isGlobalPublished ? (portfolio.globalPublishedAt || new Date()) : null,
      },
    });

    // Kirim notifikasi ke pemilik portfolio
    const action = isGlobalPublished ? 'diaktifkan kembali di' : 'dihapus dari';
    await prisma.notification.create({
      data: {
        userId: portfolio.userId,
        title: isGlobalPublished ? 'Portfolio Diaktifkan di Global' : 'Portfolio Dihapus dari Global',
        message: `Portfolio "${portfolio.displayName || portfolio.username}" Anda telah ${action} Global Showcase oleh Admin.${reason ? ` Alasan: ${reason}` : ''}`,
        type: 'system',
      },
    });

    return NextResponse.json({
      success: true,
      portfolio: {
        id: updated.id,
        isGlobalPublished: updated.isGlobalPublished,
        globalPublishedAt: updated.globalPublishedAt,
      },
    });
  } catch (error: any) {
    console.error('[ADMIN_GLOBAL_MANAGE_ERROR]', error);
    return NextResponse.json(
      { message: error.message || 'Gagal mengubah status global portfolio' },
      { status: error.message === 'Unauthorized' ? 401 : error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}
