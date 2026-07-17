'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ArrowRight, Download, Eye, Sparkles } from 'lucide-react';
import { Github, Linkedin } from '../ui/Icons';
import { AnimationWrapper } from '../ui/AnimationWrapper';

interface HeroSectionProps {
  portfolio: {
    fullName: string | null;
    tagline: string | null;
    quote: string | null;
    profileImageUrl: string | null;
    cvUrl: string | null;
    linkedinUrl: string | null;
    githubUrl: string | null;
  };
}

export function HeroSection({ portfolio }: HeroSectionProps) {
  const { fullName, tagline, quote, profileImageUrl, cvUrl, linkedinUrl, githubUrl } = portfolio;

  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    
    // Max rotation 12 degrees
    const factorX = -(y / (box.height / 2)) * 12;
    const factorY = (x / (box.width / 2)) * 12;

    setRotateX(factorX);
    setRotateY(factorY);
  };

  const handleCardMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  // Fallback quote if none is set
  const displayQuote = quote || "kode yang indah berawal dari npm run dev. ⚡";

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center pt-28 pb-20 overflow-hidden">
      
      {/* Background soft ambient gradient */}
      <div className="absolute inset-0 bg-radial-gradient from-primary-500/5 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Profile Info & Text */}
          <div className="lg:col-span-7 space-y-6 text-left flex flex-col justify-center">
            
            {/* Quote Badge Capsule - Elegant, luxurious & interactive */}
            <AnimationWrapper delay={0.1} direction="up">
              <motion.div 
                whileHover={{ scale: 1.03, y: -2 }}
                transition={{ type: "spring", stiffness: 350, damping: 15 }}
                className="inline-flex items-center gap-3.5 px-4.5 py-2.5 rounded-2xl bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 hover:border-primary-500/35 hover:shadow-[0_10px_30px_-5px_color-mix(in_srgb,var(--color-primary-500)_20%,transparent),inset_0_1px_0_rgba(255,255,255,0.03)] w-fit max-w-full cursor-default select-none relative group overflow-hidden transition-all duration-300"
              >
                {/* Shiny sweeping overlay hover effect */}
                <div className="absolute inset-0 w-1/3 h-full bg-gradient-to-r from-transparent via-primary-400/5 to-transparent -skew-x-12 translate-x-[-150%] group-hover:translate-x-[350%] transition-transform duration-1000 ease-out pointer-events-none" />

                {profileImageUrl ? (
                  <div className="w-6.5 h-6.5 rounded-full overflow-hidden shrink-0 border border-zinc-700/80 group-hover:border-primary-500/50 group-hover:scale-105 transition-all duration-300 shadow-inner">
                    <Image 
                      src={profileImageUrl} 
                      alt={fullName || 'Avatar'} 
                      width={26} 
                      height={26} 
                      className="object-cover w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="w-6.5 h-6.5 rounded-full bg-zinc-800 shrink-0 flex items-center justify-center text-[10px] font-bold text-primary-400 border border-zinc-700 group-hover:border-primary-500/50 group-hover:scale-105 transition-all duration-300">
                    {fullName?.charAt(0).toUpperCase() || '?'}
                  </div>
                )}
                
                <span className="text-zinc-300 text-xs sm:text-sm font-light tracking-wide truncate pr-1">
                  <span className="text-primary-400 font-bold font-serif mr-0.5">&ldquo;</span>
                  {displayQuote}
                  <span className="text-primary-400 font-bold font-serif ml-0.5">&rdquo;</span>
                </span>

                {/* Pulsing neon status dot */}
                <span className="relative flex h-1.5 w-1.5 shrink-0 ml-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary-500"></span>
                </span>
              </motion.div>
            </AnimationWrapper>

            {/* Main Full Name Header with Montenegrin Gothic One & Hover spring interaction */}
            <AnimationWrapper delay={0.2} direction="up">
              <motion.h1 
                whileHover={{ scale: 1.015, x: 6 }}
                transition={{ type: "spring", stiffness: 200, damping: 12 }}
                className="font-heading text-5xl sm:text-6xl lg:text-7xl text-white leading-[1.1] tracking-wide mb-3 cursor-default select-none hover:text-primary-400 transition-colors duration-300 hover:drop-shadow-[0_0_12px_color-mix(in_srgb,var(--color-primary-500)_20%,transparent)]"
              >
                {fullName || 'Tanpa Nama'}
              </motion.h1>
            </AnimationWrapper>

            {/* Tagline / Subtitle description with Google Sans Flex & luxurious interactive bracket */}
            <AnimationWrapper delay={0.3} direction="up">
              <motion.div 
                whileHover={{ x: 6 }}
                transition={{ type: "spring", stiffness: 250, damping: 15 }}
                className="border-l-2 border-zinc-800/80 hover:border-primary-500/60 pl-4.5 py-1 transition-colors duration-500 max-w-xl group/tagline cursor-default"
              >
                <p className="font-sans text-zinc-400 group-hover/tagline:text-zinc-200 text-sm sm:text-base leading-relaxed transition-colors duration-500">
                  {tagline || 'Selamat datang di halaman portofolio digital profesional saya. Mari berkolaborasi untuk membangun produk luar biasa.'}
                </p>
              </motion.div>
            </AnimationWrapper>

            {/* Action Buttons Row */}
            <AnimationWrapper delay={0.4} direction="up">
              <div className="flex flex-wrap items-center gap-4 pt-4">
                
                {/* Download CV (Cyan Glow) */}
                {cvUrl ? (
                  <a 
                    href={cvUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3.5 bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_color-mix(in_srgb,var(--color-primary-500)_20%,transparent)] hover:shadow-[0_0_25px_color-mix(in_srgb,var(--color-primary-500)_20%,transparent)] cursor-pointer"
                  >
                    Download CV <Download className="h-4 w-4" />
                  </a>
                ) : (
                  <div 
                    className="inline-flex items-center gap-2 px-6 py-3.5 bg-zinc-900/40 border border-zinc-800 text-zinc-500 text-xs font-bold uppercase tracking-wider rounded-xl cursor-not-allowed select-none"
                    title="CV tidak tersedia"
                  >
                    CV Tidak Tersedia <Download className="h-4 w-4" />
                  </div>
                )}

                {/* Lihat Proyek (Blue Glow) */}
                <a 
                  href="#projects" 
                  onClick={(e) => {
                    e.preventDefault();
                    document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-secondary-600 hover:bg-secondary-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_color-mix(in_srgb,var(--color-secondary-500)_20%,transparent)] hover:shadow-[0_0_25px_color-mix(in_srgb,var(--color-secondary-500)_20%,transparent)] cursor-pointer"
                >
                  Lihat Proyek <Eye className="h-4 w-4" />
                </a>

                {/* Social media profile connectors */}
                {(linkedinUrl || githubUrl) && (
                  <div className="flex items-center gap-3 pl-4 border-l border-zinc-800/80 h-10">
                    {linkedinUrl && (
                      <a 
                        href={linkedinUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center p-3 rounded-xl bg-zinc-900/60 backdrop-blur-md border border-zinc-800 hover:border-primary-500/40 hover:bg-zinc-800 hover:text-primary-400 text-zinc-400 transition-all hover:scale-110 shadow-sm"
                        aria-label="LinkedIn Profile"
                      >
                        <Linkedin className="h-4 w-4" />
                      </a>
                    )}
                    
                    {githubUrl && (
                      <a 
                        href={githubUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center p-3 rounded-xl bg-zinc-900/60 backdrop-blur-md border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 hover:text-white text-zinc-400 transition-all hover:scale-110 shadow-sm"
                        aria-label="GitHub Profile"
                      >
                        <Github className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </AnimationWrapper>
          </div>

          {/* Right Column: Large Profile Portrait Card with 3D Tilt Interaction */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end perspective-1000">
            <AnimationWrapper delay={0.3} direction="right" className="w-full flex justify-center lg:justify-end transform-style-preserve-3d">
              
              {/* Outer Glowing Border Box - motion.div with mouse-move 3D rotation */}
              <motion.div 
                animate={{ rotateX, rotateY }}
                transition={{ type: "spring", stiffness: 150, damping: 15 }}
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
                className="relative w-full max-w-[320px] lg:max-w-none lg:w-[340px] lg:h-[425px] aspect-[4/5] rounded-3xl p-[3px] bg-gradient-to-tr from-primary-500/40 via-secondary-500/20 to-transparent shadow-[0_25px_60px_color-mix(in_srgb,var(--color-primary-500)_20%,transparent)] overflow-hidden group transform-style-preserve-3d cursor-pointer"
              >
                
                {/* Background ambient blur color orb behind the card */}
                <div 
                  className="absolute -inset-4 bg-primary-500/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0" 
                  style={{ transform: 'translateZ(-15px)' }}
                />
                
                <div className="w-full h-full rounded-[22px] bg-zinc-950 overflow-hidden relative z-10 p-[1px] transform-style-preserve-3d">
                  {profileImageUrl ? (
                    <div className="w-full h-full relative" style={{ transform: 'translateZ(30px)' }}>
                      <Image 
                        src={profileImageUrl} 
                        alt={fullName || 'Foto Profil'} 
                        fill
                        className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 40vw"
                        priority
                      />
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center text-6xl font-black text-zinc-700" style={{ transform: 'translateZ(30px)' }}>
                      {fullName?.charAt(0).toUpperCase() || '?'}
                    </div>
                  )}
                  {/* Fine vignette overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-85 z-20 pointer-events-none" style={{ transform: 'translateZ(40px)' }} />
                </div>
              </motion.div>
            </AnimationWrapper>
          </div>

        </div>
      </div>
      
    </section>
  );
}
