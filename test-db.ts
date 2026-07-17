import { config } from 'dotenv'; config({ path: '.env.local' }); import { prisma } from './lib/prisma'; async function main() { const p = await prisma.portfolio.findMany(); console.log(p); } main();
