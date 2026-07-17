import { getRequiredSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { PortfolioSidebar } from '@/components/dashboard/PortfolioSidebar';

export default async function PortfolioLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ portfolioId: string }>;
}) {
  const session = await getRequiredSession();
  const { portfolioId } = await params;

  const portfolio = await prisma.portfolio.findUnique({
    where: { id: portfolioId },
  });

  if (!portfolio || portfolio.userId !== session?.user?.id) {
    notFound();
  }

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)] -m-6"> {/* Negative margin to offset parent layout padding */}
      <PortfolioSidebar 
        portfolioId={portfolio.id}
        portfolioName={portfolio.displayName || portfolio.username}
        username={portfolio.username}
        isPublished={portfolio.isPublished}
      />
      <div className="flex-1 overflow-auto p-6 md:p-8 relative">
        {/* Ambient Background Glow for Editors */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-[20%] left-[50%] w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-sky-600/10 rounded-full blur-[100px]"></div>
        </div>

        <div className="mx-auto max-w-4xl relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
}
