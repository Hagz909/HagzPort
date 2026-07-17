import { ReactNode } from 'react';
import PublicLayoutClient from '@/components/public/PublicLayoutClient';

export default function PublicPortfolioLayout({ children }: { children: ReactNode }) {
  return (
    <div className="portfolio-theme min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Google+Sans+Flex:opsz,wght,wdth,slnt@8..144,100..900,100,0&family=Montenegrin+Gothic+One&display=swap" rel="stylesheet" />
      <PublicLayoutClient>
        {children}
      </PublicLayoutClient>
    </div>
  );
}
