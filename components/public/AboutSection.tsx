'use client';

import { motion } from 'framer-motion';
import { AnimationWrapper } from '../ui/AnimationWrapper';
import { Code2, ExternalLink, User } from 'lucide-react';
import { Github, Linkedin } from '../ui/Icons';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
});

interface AboutSectionProps {
  bio: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
}

export function AboutSection({ bio, linkedinUrl, githubUrl }: AboutSectionProps) {
  if (!bio && !linkedinUrl && !githubUrl) return null;

  // Extract dummy tech skills for the section
  const techSkills = ['JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js', 'Tailwind CSS', 'Prisma', 'PostgreSQL'];

  return (
    <section id="about" className="py-24 bg-transparent relative overflow-hidden scroll-mt-24">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Section Title */}
        <AnimationWrapper delay={0.1} direction="up">
          <h2 className="font-heading text-3xl sm:text-5xl text-white mb-12 flex items-center gap-4">
            <span className="w-8 h-1 bg-gradient-to-r from-primary-500 to-secondary-600 rounded-full block"></span>
            Tentang Saya
          </h2>
        </AnimationWrapper>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Bio Text Column using Glassmorphism and Motion Hover */}
          <div className="lg:col-span-2">
            <AnimationWrapper delay={0.2} direction="left">
              <motion.div 
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-6 sm:p-8 shadow-[0_15px_30px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.03)] relative overflow-hidden group hover:border-primary-500/25 hover:shadow-[0_20px_45px_color-mix(in_srgb,var(--color-primary-500)_20%,transparent)] transition-all duration-300"
              >
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary-500/35 to-transparent" />
                
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center text-primary-400 border border-primary-500/20 shadow-[inset_0_0_8px_color-mix(in_srgb,var(--color-primary-500)_20%,transparent)]">
                    <User size={16} />
                  </div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Profil Singkat</h3>
                </div>

                <div className={`${poppins.className} space-y-4 text-zinc-300 text-sm sm:text-base leading-relaxed font-light`}>
                  {bio ? (
                    bio.split('\n').map((paragraph, idx) => (
                      <p key={idx}>
                        {paragraph}
                      </p>
                    ))
                  ) : (
                    <p className="text-zinc-400 italic">Belum ada informasi biografi.</p>
                  )}
                </div>
              </motion.div>
            </AnimationWrapper>
          </div>

          {/* Quick Links & Skills Column */}
          <div className="space-y-6">
            
            {/* Social Links Card */}
            <AnimationWrapper delay={0.3} direction="right">
              <motion.div 
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-6 shadow-[0_15px_30px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.03)] relative overflow-hidden group hover:border-primary-500/25 hover:shadow-[0_20px_45px_color-mix(in_srgb,var(--color-primary-500)_20%,transparent)] transition-all duration-300"
              >
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary-500/35 to-transparent" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-4">Temukan Saya di</h3>
                <div className="space-y-2">
                  {linkedinUrl && (
                    <a 
                      href={linkedinUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center text-zinc-400 hover:text-primary-400 transition-all duration-300 group/link p-3 rounded-xl hover:bg-zinc-950/40 border border-transparent hover:border-zinc-800/80 hover:translate-x-1"
                    >
                      <Linkedin className="h-4 w-4 mr-3 group-hover/link:scale-110 transition-transform" />
                      <span className="text-sm font-medium">LinkedIn Profile</span>
                      <ExternalLink className="h-3 w-3 ml-auto opacity-0 group-hover/link:opacity-100 transition-opacity" />
                    </a>
                  )}
                  {githubUrl && (
                    <a 
                      href={githubUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center text-zinc-400 hover:text-white transition-all duration-300 group/link p-3 rounded-xl hover:bg-zinc-950/40 border border-transparent hover:border-zinc-800/80 hover:translate-x-1"
                    >
                      <Github className="h-4 w-4 mr-3 group-hover/link:scale-110 transition-transform" />
                      <span className="text-sm font-medium">GitHub Profile</span>
                      <ExternalLink className="h-3 w-3 ml-auto opacity-0 group-hover/link:opacity-100 transition-opacity" />
                    </a>
                  )}
                </div>
              </motion.div>
            </AnimationWrapper>

            {/* Tech Skills Card */}
            <AnimationWrapper delay={0.4} direction="right">
              <motion.div 
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-6 shadow-[0_15px_30px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.03)] relative overflow-hidden group hover:border-emerald-500/25 hover:shadow-[0_20px_45px_rgba(16,185,129,0.08)] transition-all duration-300"
              >
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/35 to-transparent" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-4 flex items-center">
                  <Code2 className="h-4 w-4 mr-2 text-primary-400" />
                  Keahlian Utama
                </h3>
                <div className="flex flex-wrap gap-2">
                  {techSkills.map((skill) => (
                    <motion.span 
                      key={skill}
                      whileHover={{ scale: 1.08, y: -2 }}
                      transition={{ type: "spring", stiffness: 350, damping: 12 }}
                      className="px-3 py-1.5 bg-zinc-950/60 border border-zinc-800/60 rounded-xl text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:text-white hover:border-primary-500/40 hover:bg-gradient-to-tr hover:from-primary-500/10 hover:to-secondary-500/10 hover:shadow-[0_0_15px_color-mix(in_srgb,var(--color-primary-500)_20%,transparent)] transition-all cursor-default select-none"
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            </AnimationWrapper>
          </div>
        </div>
      </div>
    </section>
  );
}
