// prisma/seed.ts
// Buat akun Admin pertama saat setup awal
// Jalankan: npx prisma db seed

import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Memulai seed database...')

  const adminPassword = await bcrypt.hash('Admin@12345', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@hgzport.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@hgzport.com',
      password: adminPassword,
      role: 'ADMIN',
      isActive: true,
      emailNotification: true,
      portfolios: {
        create: {
          username: 'admin',
          displayName: 'Admin Portfolio',
          isDefault: true,
          isPublished: false,
        },
      },
    },
  })

  console.log(`✅ Admin berhasil dibuat: ${admin.email}`)
  console.log(`📝 Login dengan:`)
  console.log(`   Email    : admin@hgzport.com`)
  console.log(`   Password : Admin@12345`)
  console.log(`⚠️  PENTING: Segera ganti password Admin setelah login pertama!`)
}

main()
  .catch((e) => {
    console.error('❌ Seed gagal:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
