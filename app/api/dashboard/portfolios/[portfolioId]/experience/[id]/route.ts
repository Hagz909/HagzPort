import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateOwnership } from '@/lib/auth-helpers';
import { z } from 'zod';

const experienceSchema = z.object({
  companyName: z.string().min(1, 'Nama Perusahaan wajib diisi').max(100),
  position: z.string().min(1, 'Posisi/Jabatan wajib diisi').max(100),
  startYear: z.number().nullable().optional(),
  endYear: z.number().nullable().optional(),
  description: z.string().max(2000).nullable().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ portfolioId: string; id: string }> }
) {
  try {
    const { portfolioId, id } = await params;
    const { session } = await validateOwnership(portfolioId);

    const body = await request.json();
    const result = experienceSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: 'Validasi gagal', errors: result.error.issues },
        { status: 400 }
      );
    }

    const data = result.data;

    // Pastikan data milik portfolio ini
    const existing = await prisma.workExperience.findUnique({ where: { id } });
    if (!existing || existing.portfolioId !== portfolioId) {
      return NextResponse.json({ message: 'Data tidak ditemukan' }, { status: 404 });
    }

    const experience = await prisma.workExperience.update({
      where: { id },
      data: {
        companyName: data.companyName,
        position: data.position,
        startYear: data.startYear || null,
        endYear: data.endYear || null,
        description: data.description || null,
      },
    });

    // Notifikasi Admin
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    if (admins.length > 0) {
      const adminNotifs = admins.map(admin => ({
        userId: admin.id,
        title: 'Pengalaman Kerja Diperbarui',
        message: `Pengguna ${session.user!.name || session.user!.email} memperbarui pengalaman kerja "${data.companyName}" di portofolionya.`,
        type: 'system'
      }));
      await prisma.notification.createMany({ data: adminNotifs });
    }

    return NextResponse.json({ success: true, experience });
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

    const existing = await prisma.workExperience.findUnique({ where: { id } });
    if (!existing || existing.portfolioId !== portfolioId) {
      return NextResponse.json({ message: 'Data tidak ditemukan' }, { status: 404 });
    }

    await prisma.workExperience.delete({
      where: { id },
    });

    // Notifikasi Admin
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    if (admins.length > 0) {
      const adminNotifs = admins.map(admin => ({
        userId: admin.id,
        title: 'Pengalaman Kerja Dihapus',
        message: `Pengguna ${session.user!.name || session.user!.email} menghapus pengalaman kerja "${existing.companyName}" dari portofolionya.`,
        type: 'system'
      }));
      await prisma.notification.createMany({ data: adminNotifs });
    }

    return NextResponse.json({ success: true, message: 'Berhasil dihapus' });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json({ message: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    return NextResponse.json({ message: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
