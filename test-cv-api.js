const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const user = await prisma.user.findFirst();
    if (!user) return console.log('No user');

    const portfolio = await prisma.portfolio.findFirst({ where: { userId: user.id } });
    if (!portfolio) return console.log('No portfolio for user');

    const cv = await prisma.generatedCV.create({
      data: {
        portfolioId: portfolio.id,
        title: 'CV - Test',
        publicUrl: `/cv/${portfolio.id}`
      }
    });
    console.log('CV Created:', cv.id);

    const notif = await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'Test',
        message: 'Test',
        type: 'cv'
      }
    });
    console.log('Notif Created:', notif.id);

    console.log('All success');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}
test();
