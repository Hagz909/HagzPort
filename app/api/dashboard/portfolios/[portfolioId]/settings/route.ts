import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateOwnership } from '@/lib/auth-helpers';
import { z } from 'zod';

const USERNAME_BLACKLIST = [
  'admin', 'api', 'dashboard', 'login', 'register', 'logout', 'settings',
  'profile', 'public', 'static', 'about', 'contact', 'home', 'index',
  'null', 'undefined'
];

const settingsSchema = z.object({
  displayName: z.string().max(100).nullable().optional(),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/, 'Hanya huruf, angka, strip, dan underscore').optional(),
  isPublished: z.boolean().optional(),
  isDefault: z.boolean().optional(),
  skills: z.array(z.string()).optional(),
  theme: z.string().optional(),
  font: z.string().optional(),
  metaTitle: z.string().max(150).nullable().optional(),
  metaDescription: z.string().max(300).nullable().optional(),
  metaKeywords: z.string().max(200).nullable().optional(),
  googleAnalyticsId: z.string().max(50).nullable().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ portfolioId: string }> }
) {
  try {
    const { portfolioId } = await params;
    const { portfolio, session } = await validateOwnership(portfolioId);

    const body = await request.json();
    const result = settingsSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: 'Validasi gagal', errors: result.error.issues },
        { status: 400 }
      );
    }

    const data = result.data;

    // Cek duplikasi username jika ada perubahan
    let setUsernameChangedAt = false;
    if (data.username && data.username !== portfolio.username) {
      if (USERNAME_BLACKLIST.includes(data.username.toLowerCase())) {
        return NextResponse.json({ message: 'Username ini tidak dapat digunakan (reserved)' }, { status: 400 });
      }

      const existing = await prisma.portfolio.findUnique({
        where: { username: data.username },
      });
      if (existing) {
        return NextResponse.json({ message: 'Username sudah digunakan' }, { status: 400 });
      }
      setUsernameChangedAt = true;
    }

    // Jika isDefault true, nonaktifkan isDefault di portfolio lain milik user
    if (data.isDefault) {
      await prisma.portfolio.updateMany({
        where: { userId: session.user!.id, id: { not: portfolio.id } },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.portfolio.update({
      where: { id: portfolio.id },
      data: {
        displayName: data.displayName !== undefined ? data.displayName : undefined,
        username: data.username !== undefined ? data.username : undefined,
        usernameChangedAt: setUsernameChangedAt ? new Date() : undefined,
        isPublished: data.isPublished !== undefined ? data.isPublished : undefined,
        isDefault: data.isDefault !== undefined ? data.isDefault : undefined,
        skills: data.skills !== undefined ? data.skills : undefined,
        theme: data.theme !== undefined ? data.theme : undefined,
        font: data.font !== undefined ? data.font : undefined,
        metaTitle: data.metaTitle !== undefined ? data.metaTitle : undefined,
        metaDescription: data.metaDescription !== undefined ? data.metaDescription : undefined,
        metaKeywords: data.metaKeywords !== undefined ? data.metaKeywords : undefined,
        googleAnalyticsId: data.googleAnalyticsId !== undefined ? data.googleAnalyticsId : undefined,
      },
    });

    // TRIGGER NOTIFIKASI SAAT PUBLISH ATAU UPDATE UMUM
    if (data.isPublished === true && portfolio.isPublished === false) {
      // 1. Notifikasi untuk User
      await prisma.notification.create({
        data: {
          userId: session.user!.id,
          title: 'Portofolio Live',
          message: `Selamat! Portofolio "${updated.displayName || updated.username}" Anda kini dapat diakses publik.`,
          type: 'portfolio'
        }
      });

      // 2. Notifikasi untuk Admin
      const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
      if (admins.length > 0) {
        const adminNotifications = admins.map(admin => ({
          userId: admin.id,
          title: 'Portofolio Publik Baru',
          message: `User ${session.user!.name} mempublikasikan portofolio "${updated.username}".`,
          type: 'system'
        }));
        await prisma.notification.createMany({ data: adminNotifications });
      }
    } else {
      // 3. Notifikasi umum untuk Admin (monitoring update pengaturan)
      // Kita abaikan jika perubahannya HANYA kosmetik (theme/font) agar tidak memenuhi database notifikasi admin.
      const isOnlyCosmetic = Object.keys(data).every(key => ['theme', 'font'].includes(key));
      
      if (!isOnlyCosmetic && Object.keys(data).length > 0) {
        const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
        if (admins.length > 0) {
          const adminNotifications = admins.map(admin => ({
            userId: admin.id,
            title: 'Pengaturan Portofolio Diperbarui',
            message: `Pengguna ${session.user!.name || session.user!.email} memperbarui pengaturan portofolionya ("${updated.displayName || updated.username}").`,
            type: 'system'
          }));
          await prisma.notification.createMany({ data: adminNotifications });
        }
      }
    }

    return NextResponse.json({ success: true, portfolio: updated });
  } catch (error) {
    console.error('[SETTINGS_PATCH_ERROR]', error);
    const err = error as Error;
    if (err.message === 'Unauthorized' || err.message === 'Forbidden') {
      return NextResponse.json({ message: err.message }, { status: err.message === 'Unauthorized' ? 401 : 403 });
    }
    return NextResponse.json({ message: 'Terjadi kesalahan server', details: err.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ portfolioId: string }> }
) {
  try {
    const { portfolioId } = await params;
    const { session, portfolio } = await validateOwnership(portfolioId);

    if (portfolio.isDefault) {
      return NextResponse.json({ message: 'Tidak dapat menghapus portofolio utama' }, { status: 400 });
    }

    await prisma.portfolio.delete({
      where: { id: portfolio.id },
    });

    // 1. Notifikasi untuk User (terbatas)
    await prisma.notification.create({
      data: {
        userId: session.user!.id,
        title: 'Portofolio Dihapus',
        message: `Portofolio dengan username "${portfolio.username}" telah dihapus secara permanen.`,
        type: 'portfolio'
      }
    });

    // 2. Notifikasi untuk Admin (monitoring)
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    if (admins.length > 0) {
      const adminNotifications = admins.map(admin => ({
        userId: admin.id,
        title: 'Penghapusan Portofolio',
        message: `Pengguna ${session.user!.name || session.user!.email} menghapus portofolinya yang bernama "${portfolio.displayName || portfolio.username}".`,
        type: 'system'
      }));
      await prisma.notification.createMany({ data: adminNotifications });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const err = error as Error;
    if (err.message === 'Unauthorized' || err.message === 'Forbidden') {
      return NextResponse.json({ message: err.message }, { status: err.message === 'Unauthorized' ? 401 : 403 });
    }
    return NextResponse.json({ message: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
