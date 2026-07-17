import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateOwnership } from '@/lib/auth-helpers';
import { z } from 'zod';

const projectSchema = z.object({
  title: z.string().min(1, 'Judul proyek wajib diisi').max(100),
  description: z.string().max(1000).nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  imagePublicId: z.string().nullable().optional(),
  techStack: z.array(z.string()).default([]),
  demoUrl: z.union([z.literal(''), z.string().url('URL tidak valid')]).nullable().optional(),
  repoUrl: z.union([z.literal(''), z.string().url('URL tidak valid')]).nullable().optional(),
  wokwiEmbedUrl: z.string().nullable().optional(),
  isFeatured: z.boolean().default(false),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ portfolioId: string; id: string }> }
) {
  try {
    const { portfolioId, id } = await params;
    const { session } = await validateOwnership(portfolioId);

    const body = await request.json();
    const result = projectSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: 'Validasi gagal', errors: result.error.issues },
        { status: 400 }
      );
    }

    const data = result.data;

    const existing = await prisma.project.findFirst({
      where: { id, portfolioId },
    });

    if (!existing) {
      return NextResponse.json({ message: 'Data tidak ditemukan' }, { status: 404 });
    }

    const updated = await prisma.project.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description || null,
        imageUrl: data.imageUrl || null,
        imagePublicId: data.imagePublicId || null,
        techStack: data.techStack,
        demoUrl: data.demoUrl || null,
        repoUrl: data.repoUrl || null,
        wokwiEmbedUrl: data.wokwiEmbedUrl || null,
        isFeatured: data.isFeatured,
      },
    });

    // Notifikasi Admin
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    if (admins.length > 0) {
      const adminNotifs = admins.map(admin => ({
        userId: admin.id,
        title: 'Proyek Diperbarui',
        message: `Pengguna ${session.user!.name || session.user!.email} memperbarui proyek "${updated.title}" di portofolionya.`,
        type: 'system'
      }));
      await prisma.notification.createMany({ data: adminNotifs });
    }

    return NextResponse.json({ success: true, project: updated });
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

    const existing = await prisma.project.findFirst({
      where: { id, portfolioId },
    });

    if (!existing) {
      return NextResponse.json({ message: 'Data tidak ditemukan' }, { status: 404 });
    }

    await prisma.project.delete({
      where: { id },
    });

    // Notifikasi Admin
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    if (admins.length > 0) {
      const adminNotifs = admins.map(admin => ({
        userId: admin.id,
        title: 'Proyek Dihapus',
        message: `Pengguna ${session.user!.name || session.user!.email} menghapus proyek "${existing.title}" dari portofolionya.`,
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
