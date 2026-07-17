import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Metadata } from 'next';
import Script from 'next/script';

export const revalidate = 60;

import { Navbar } from '@/components/public/Navbar';
import { HeroSection } from '@/components/public/HeroSection';
import { AboutSection } from '@/components/public/AboutSection';
import { EducationSection } from '@/components/public/EducationSection';
import { ProjectsSection } from '@/components/public/ProjectsSection';
import { ContactSection } from '@/components/public/ContactSection';
import { Footer } from '@/components/public/Footer';
import { ExperienceSection } from '@/components/public/ExperienceSection';
import { SkillsSection } from '@/components/public/SkillsSection';
import { ThemeInjector } from '@/components/public/ThemeInjector';

interface PublicPortfolioPageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PublicPortfolioPageProps): Promise<Metadata> {
  const { username } = await params;
  
  const portfolio = await prisma.portfolio.findUnique({
    where: { username },
    select: { 
      fullName: true, 
      username: true, 
      tagline: true, 
      bio: true, 
      profileImageUrl: true,
      isPublished: true,
      metaTitle: true,
      metaDescription: true,
      metaKeywords: true
    }
  });

  if (!portfolio || !portfolio.isPublished) {
    return { title: 'Tidak Ditemukan' };
  }

  const name = portfolio.fullName || portfolio.username;
  const title = portfolio.metaTitle || `${name} — Portofolio`;
  const description = portfolio.metaDescription || portfolio.tagline || (portfolio.bio ? portfolio.bio.slice(0, 160) : `Portofolio dari ${name}`);
  const keywords = portfolio.metaKeywords || undefined;

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      images: portfolio.profileImageUrl ? [portfolio.profileImageUrl] : [],
      type: 'website',
    },
  };
}

export default async function PublicPortfolioPage({ params }: PublicPortfolioPageProps) {
  const { username } = await params;

  const portfolio = await prisma.portfolio.findUnique({
    where: { username },
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

  if (!portfolio || !portfolio.isPublished) {
    notFound();
  }

  const ownerName = portfolio.fullName || portfolio.username;

  return (
    <>
      {portfolio.googleAnalyticsId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${portfolio.googleAnalyticsId}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${portfolio.googleAnalyticsId}');
            `}
          </Script>
        </>
      )}
      <ThemeInjector theme={portfolio.theme} font={portfolio.font} />
      <Navbar ownerName={ownerName} />
      
      <main>
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
        
        <ContactSection portfolioId={portfolio.id} />
      </main>

      <Footer 
        ownerName={ownerName} 
        username={portfolio.username}
        linkedinUrl={portfolio.linkedinUrl}
        githubUrl={portfolio.githubUrl}
      />
    </>
  );
}
