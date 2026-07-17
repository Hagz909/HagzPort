require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');

const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function check() {
  const user = await prisma.user.findUnique({ where: { email: 'admin@portfoliocms.com' } });
  if (!user) return console.log('User not found');
  const valid = await bcrypt.compare('Admin@12345', user.password);
  console.log('Is valid:', valid);
}

check().catch(console.error).finally(() => prisma.$disconnect());
