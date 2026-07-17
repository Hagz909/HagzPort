import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').max(50),
  email: z.string().email('Format email tidak valid'),
  password: z
    .string()
    .min(8, 'Password minimal 8 karakter')
    .regex(/[A-Z]/, 'Harus mengandung minimal 1 huruf besar')
    .regex(/[0-9]/, 'Harus mengandung minimal 1 angka'),
});

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { message: 'Validasi gagal', errors: result.error.issues },
        { status: 400 }
      );
    }

    const { name, email, password } = result.data;

    // Cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Email sudah terdaftar' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate initial slug
    let username = generateSlug(name);
    
    // Cek apakah username unik
    let usernameExists = await prisma.portfolio.findUnique({
      where: { username },
    });

    while (usernameExists) {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      username = `${generateSlug(name)}-${randomNum}`;
      usernameExists = await prisma.portfolio.findUnique({
        where: { username },
      });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'USER',
        isActive: true,
        emailNotification: true,
        portfolios: {
          create: {
            username,
            displayName: 'Portofolio Utama',
            isDefault: true,
            isPublished: false,
          },
        },
      },
    });

    return NextResponse.json(
      { success: true, message: 'Akun berhasil dibuat', user: { id: user.id, email: user.email } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
