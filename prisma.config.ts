// prisma.config.ts — Prisma v7 configuration
// CATATAN: dotenv default hanya baca .env — kita eksplisit load .env.local
import { config } from 'dotenv'
config({ path: '.env.local' }) // ← wajib eksplisit, bukan 'dotenv/config'

import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'ts-node --compiler-options {"module":"CommonJS"} prisma/seed.ts',
  },
  datasource: {
    // Prisma CLI (migrate, db push) requires a direct connection to perform schema changes.
    url: process.env.DIRECT_URL!,
  },
})
