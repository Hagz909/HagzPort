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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ portfolioId: string }> }
) {
  try {
    const { portfolioId } = await params;
    await validateOwnership(portfolioId);

    const experiences = await prisma.workExperience.findMany({
      where: { portfolioId },
      orderBy: [
        { startYear: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json(experiences);
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json({ message: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    console.error('GET /experience Error:', error);
    return NextResponse.json({ message: 'Terjadi kesalahan server', detail: error.message }, { status: 500 });
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
    const result = experienceSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: 'Validasi gagal', errors: result.error.issues },
        { status: 400 }
      );
    }

    const data = result.data;

    const experience = await prisma.workExperience.create({
      data: {
        portfolioId,
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
        title: 'Pengalaman Kerja Ditambahkan',
        message: `Pengguna ${session.user!.name || session.user!.email} menambahkan pengalaman kerja di "${data.companyName}" ke portofolionya.`,
        type: 'system'
      }));
      await prisma.notification.createMany({ data: adminNotifs });
    }

    return NextResponse.json({ success: true, experience }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json({ message: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    console.error('POST /experience Error:', error);
    return NextResponse.json({ message: 'Terjadi kesalahan server', detail: error.message }, { status: 500 });
  }
}
