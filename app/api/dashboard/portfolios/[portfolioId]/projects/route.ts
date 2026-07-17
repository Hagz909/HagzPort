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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ portfolioId: string }> }
) {
  try {
    const { portfolioId } = await params;
    await validateOwnership(portfolioId);

    const projects = await prisma.project.findMany({
      where: { portfolioId },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(projects);
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json({ message: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    return NextResponse.json({ message: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ portfolioId: string }> }
) {
  try {
    const { portfolioId } = await params;
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

    // Get max order
    const lastProject = await prisma.project.findFirst({
      where: { portfolioId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });
    
    const newOrder = lastProject ? lastProject.order + 1 : 0;

    const project = await prisma.project.create({
      data: {
        portfolioId,
        title: data.title,
        description: data.description || null,
        imageUrl: data.imageUrl || null,
        imagePublicId: data.imagePublicId || null,
        techStack: data.techStack,
        demoUrl: data.demoUrl || null,
        repoUrl: data.repoUrl || null,
        wokwiEmbedUrl: data.wokwiEmbedUrl || null,
        isFeatured: data.isFeatured,
        order: newOrder,
      },
    });

    // Notifikasi Admin
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    if (admins.length > 0) {
      const adminNotifs = admins.map(admin => ({
        userId: admin.id,
        title: 'Proyek Ditambahkan',
        message: `Pengguna ${session.user!.name || session.user!.email} menambahkan proyek "${data.title}" ke portofolionya.`,
        type: 'system'
      }));
      await prisma.notification.createMany({ data: adminNotifs });
    }

    return NextResponse.json({ success: true, project }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json({ message: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    return NextResponse.json({ message: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
