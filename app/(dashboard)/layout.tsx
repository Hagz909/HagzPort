import { auth, signOut } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardLayoutClient from '@/components/dashboard/DashboardLayoutClient';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const handleSignOut = async () => {
    'use server';
    try {
      await signOut();
    } catch (error: any) {
      // Next.js uses error.digest to mark its internal redirect exceptions
      if (error?.digest?.startsWith('NEXT_REDIRECT')) {
        throw error;
      }
      // If the error is not a redirect (e.g., session already destroyed), force a manual redirect
    }
    redirect('/login');
  };

  return (
    <DashboardLayoutClient user={session.user} onSignOut={handleSignOut}>
      {children}
    </DashboardLayoutClient>
  );
}
