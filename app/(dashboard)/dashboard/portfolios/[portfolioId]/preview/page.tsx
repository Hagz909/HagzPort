/* eslint-disable @next/next/no-page-custom-font */
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getRequiredSession } from '@/lib/auth-helpers';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import Link from 'next/link';

// Import public components
import { HeroSection } from '@/components/public/HeroSection';
import { AboutSection } from '@/components/public/AboutSection';
import { EducationSection } from '@/components/public/EducationSection';
import { ProjectsSection } from '@/components/public/ProjectsSection';
import { ExperienceSection } from '@/components/public/ExperienceSection';
import { SkillsSection } from '@/components/public/SkillsSection';
import { ThemeInjector } from '@/components/public/ThemeInjector';
import PublicLayoutClient from '@/components/public/PublicLayoutClient';

export default async function PortfolioPreviewPage({
  params
}: {
  params: Promise<{ portfolioId: string }>;
}) {
  const session = await getRequiredSession();
  const { portfolioId } = await params;

  const portfolio = await prisma.portfolio.findUnique({
    where: { 
      id: portfolioId,
      userId: session.user!.id
    },
    include: {
      educations: {
        orderBy: { startYear: 'desc' }
      },
      workExperiences: {
        orderBy: { startYear: 'desc' }
      },
      projects: {
        orderBy: { order: 'asc' }
      }
    }
  });

  if (!portfolio) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-amber-500">Mode Pratinjau (Preview)</h3>
            <p className="text-xs text-amber-400/80 mt-1">
              Ini adalah tampilan bagaimana publik akan melihat portofolio Anda.
              {!portfolio.isPublished && " (Saat ini portofolio belum dipublikasikan)"}
            </p>
          </div>
        </div>
        <Link 
          href={`/${portfolio.username}`} 
          target="_blank"
          className="btn bg-amber-500 hover:bg-amber-600 text-zinc-950 border-none whitespace-nowrap flex-shrink-0 text-sm py-2 px-4"
        >
          Lihat URL Asli <ExternalLink size={14} className="ml-2" />
        </Link>
      </div>

      <div className="bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl relative">
        {/* Fake Browser Chrome */}
        <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-3 flex items-center gap-4">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div className="bg-zinc-950 rounded-md px-3 py-1 text-xs text-zinc-500 flex-1 font-mono text-center truncate">
            https://hgzport.com/{portfolio.username}
          </div>
        </div>
        
        {/* Preview Content */}
        <div className="h-[700px] overflow-y-auto relative">
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Google+Sans+Flex:opsz,wght,wdth,slnt@8..144,100..900,100,0&family=Montenegrin+Gothic+One&display=swap" rel="stylesheet" />
          
          {/* We wrap it in a div to simulate the public site body styling */}
          <div className="portfolio-theme bg-zinc-950 text-zinc-50 min-h-full font-sans">
            <ThemeInjector theme={portfolio.theme ?? undefined} font={portfolio.font ?? undefined} />
            <PublicLayoutClient>
              <HeroSection 
                portfolio={{
                  fullName: portfolio.fullName,
                  tagline: portfolio.tagline,
                  quote: portfolio.quote,
                  profileImageUrl: portfolio.profileImageUrl,
                  cvUrl: portfolio.cvUrl,
                  linkedinUrl: portfolio.linkedinUrl,
                  githubUrl: portfolio.githubUrl,
                }} 
              />
              
              <AboutSection 
                bio={portfolio.bio}
                linkedinUrl={portfolio.linkedinUrl}
                githubUrl={portfolio.githubUrl}
              />
              
              <ExperienceSection experiences={portfolio.workExperiences} />
              
              <EducationSection educations={portfolio.educations} />
              
              <SkillsSection skills={portfolio.skills} />
              
              <ProjectsSection projects={portfolio.projects} />
              
              {/* Note: Contact and Footer are omitted in preview to avoid confusion with real forms */}
              <div className="py-12 border-t border-zinc-800/50 text-center">
                <p className="text-zinc-500 text-sm">Bagian Kontak dan Footer disembunyikan dalam pratinjau ini.</p>
              </div>
            </PublicLayoutClient>
          </div>
        </div>
      </div>
    </div>
  );
}
