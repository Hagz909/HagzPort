import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateOwnership } from '@/lib/auth-helpers';
import { z } from 'zod';

const testimonialUpdateSchema = z.object({
  clientName: z.string().min(1, 'Nama klien wajib diisi').max(100, 'Nama klien terlalu panjang').optional(),
  clientRole: z.string().max(100, 'Peran/Jabatan klien terlalu panjang').nullable().optional(),
  quote: z.string().min(5, 'Kutipan testimonial minimal 5 karakter').max(500, 'Kutipan testimonial terlalu panjang').optional(),
});

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ portfolioId: string; id: string }> }
) {
  try {
    const { portfolioId, id } = await params;
    const { session } = await validateOwnership(portfolioId);

    // Pastikan testimonial tersebut milik portfolio terkait
    const existing = await prisma.testimonial.findUnique({
      where: { id },
    });

    if (!existing || existing.portfolioId !== portfolioId) {
      return NextResponse.json({ message: 'Testimonial tidak ditemukan' }, { status: 404 });
    }

    await prisma.testimonial.delete({
      where: { id },
    });

    // Buat notifikasi log sistem untuk Admin
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    if (admins.length > 0) {
      const adminNotifications = admins.map(admin => ({
        userId: admin.id,
        title: 'Testimonial Klien Dihapus',
        message: `Pengguna ${session.user!.name || session.user!.email} menghapus testimonial klien dari "${existing.clientName}".`,
        type: 'system',
      }));
      await prisma.notification.createMany({ data: adminNotifications });
    }

    return NextResponse.json({ success: true, message: 'Testimonial berhasil dihapus' });
  } catch (error: any) {
    console.error('[TESTIMONIALS_DELETE_ERROR]', error);
    return NextResponse.json(
      { message: error.message || 'Gagal menghapus testimonial' },
      { status: error.message === 'Unauthorized' ? 401 : error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ portfolioId: string; id: string }> }
) {
  try {
    const { portfolioId, id } = await params;
    const { session } = await validateOwnership(portfolioId);

    const body = await request.json();
    const result = testimonialUpdateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: 'Validasi gagal', errors: result.error.issues },
        { status: 400 }
      );
    }

    // Pastikan testimonial tersebut milik portfolio terkait
    const existing = await prisma.testimonial.findUnique({
      where: { id },
    });

    if (!existing || existing.portfolioId !== portfolioId) {
      return NextResponse.json({ message: 'Testimonial tidak ditemukan' }, { status: 404 });
    }

    const data = result.data;

    const updated = await prisma.testimonial.update({
      where: { id },
      data: {
        clientName: data.clientName !== undefined ? data.clientName : undefined,
        clientRole: data.clientRole !== undefined ? data.clientRole : undefined,
        quote: data.quote !== undefined ? data.quote : undefined,
      },
    });

    // Buat notifikasi log sistem untuk Admin
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    if (admins.length > 0) {
      const adminNotifications = admins.map(admin => ({
        userId: admin.id,
        title: 'Testimonial Klien Diperbarui',
        message: `Pengguna ${session.user!.name || session.user!.email} memperbarui testimonial klien "${updated.clientName}".`,
        type: 'system',
      }));
      await prisma.notification.createMany({ data: adminNotifications });
    }

    return NextResponse.json({ success: true, testimonial: updated });
  } catch (error: any) {
    console.error('[TESTIMONIALS_PATCH_ERROR]', error);
    return NextResponse.json(
      { message: error.message || 'Gagal memperbarui testimonial' },
      { status: error.message === 'Unauthorized' ? 401 : error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}
