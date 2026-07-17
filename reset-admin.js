require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');

const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function reset() {
  const users = await prisma.user.findMany({
    include: { portfolios: true }
  });
  console.log('Users:', JSON.stringify(users, null, 2));

  const adminPortfolio = await prisma.portfolio.findUnique({
    where: { username: 'admin' },
    include: { user: true }
  });
  
  if (adminPortfolio) {
    console.log('Portfolio admin is owned by:', adminPortfolio.user.email);
    const hash = await bcrypt.hash('Admin@12345', 12);
    await prisma.user.update({
      where: { id: adminPortfolio.user.id },
      data: { password: hash, role: 'ADMIN', isActive: true }
    });
    console.log('Password for ' + adminPortfolio.user.email + ' has been reset to Admin@12345');
  } else {
    console.log('No portfolio with username admin found.');
  }
}

reset().catch(console.error).finally(() => prisma.$disconnect());
