import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import SettingsClient from './SettingsClient';

export const metadata = {
  title: 'Pengaturan Akun | Portfolio CMS',
};

export default async function GlobalSettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      _count: {
        select: { portfolios: true }
      }
    }
  });

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Pengaturan Akun</h1>
        <p className="text-sm text-zinc-400">Kelola informasi profil dan preferensi notifikasi Anda.</p>
      </div>

      <SettingsClient 
        initialName={user.name}
        email={user.email}
        initialEmailNotification={user.emailNotification}
        createdAt={user.createdAt}
        totalPortfolios={user._count.portfolios}
      />
    </div>
  );
}
