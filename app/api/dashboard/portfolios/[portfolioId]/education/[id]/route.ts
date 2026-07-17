import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateOwnership } from '@/lib/auth-helpers';
import { z } from 'zod';

const educationSchema = z.object({
  institutionName: z.string().min(1, 'Nama Institusi wajib diisi').max(100),
  degree: z.string().max(100).nullable().optional(),
  nim: z.string().max(50).nullable().optional(),
  currentSemester: z.number().min(1).max(14).nullable().optional(),
  startYear: z.number().nullable().optional(),
  endYear: z.number().nullable().optional(),
  logoUrl: z.string().nullable().optional(),
  logoPublicId: z.string().nullable().optional(),
  description: z.string().max(1000).nullable().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ portfolioId: string; id: string }> }
) {
  try {
    const { portfolioId, id } = await params;
    const { session } = await validateOwnership(portfolioId);

    const body = await request.json();
    const result = educationSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: 'Validasi gagal', errors: result.error.issues },
        { status: 400 }
      );
    }

    const data = result.data;

    // Pastikan data education ini milik portfolio yang bersangkutan
    const existing = await prisma.education.findFirst({
      where: { id, portfolioId },
    });

    if (!existing) {
      return NextResponse.json({ message: 'Data tidak ditemukan' }, { status: 404 });
    }

    const updated = await prisma.education.update({
      where: { id },
      data: {
        institutionName: data.institutionName,
        degree: data.degree || null,
        nim: data.nim || null,
        currentSemester: data.currentSemester || null,
        startYear: data.startYear || null,
        endYear: data.endYear || null,
        logoUrl: data.logoUrl || null,
        logoPublicId: data.logoPublicId || null,
        description: data.description || null,
      },
    });

    // Notifikasi Admin
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    if (admins.length > 0) {
      const adminNotifs = admins.map(admin => ({
        userId: admin.id,
        title: 'Pendidikan Diperbarui',
        message: `Pengguna ${session.user!.name || session.user!.email} memperbarui pendidikan "${updated.institutionName}" di portofolionya.`,
        type: 'system'
      }));
      await prisma.notification.createMany({ data: adminNotifs });
    }

    return NextResponse.json({ success: true, education: updated });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json({ message: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    return NextResponse.json({ message: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ portfolioId: string; id: string }> }
) {
  try {
    const { portfolioId, id } = await params;
    const { session } = await validateOwnership(portfolioId);

    const existing = await prisma.education.findFirst({
      where: { id, portfolioId },
    });

    if (!existing) {
      return NextResponse.json({ message: 'Data tidak ditemukan' }, { status: 404 });
    }

    await prisma.education.delete({
      where: { id },
    });

    // Notifikasi Admin
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    if (admins.length > 0) {
      const adminNotifs = admins.map(admin => ({
        userId: admin.id,
        title: 'Pendidikan Dihapus',
        message: `Pengguna ${session.user!.name || session.user!.email} menghapus pendidikan "${existing.institutionName}" dari portofolionya.`,
        type: 'system'
      }));
      await prisma.notification.createMany({ data: adminNotifs });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json({ message: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    return NextResponse.json({ message: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
