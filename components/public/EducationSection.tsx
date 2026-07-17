'use client';

import { motion } from 'framer-motion';
import { AnimationWrapper } from '../ui/AnimationWrapper';
import Image from 'next/image';
import { GraduationCap, Calendar, Clock, BookOpen, Layers } from 'lucide-react';
import { Education } from '@prisma/client';

interface EducationSectionProps {
  educations: Education[];
}

export function EducationSection({ educations }: EducationSectionProps) {
  if (!educations || educations.length === 0) return null;

  return (
    <section id="education" className="py-24 bg-transparent relative overflow-hidden scroll-mt-24">
      <div className="max-w-5xl mx-auto px-6">
        
        {/* Section Title */}
        <AnimationWrapper delay={0.1} direction="up">
          <h2 className="font-heading text-3xl sm:text-5xl text-white mb-20 flex items-center justify-center gap-4 text-center">
            <GraduationCap className="h-8 w-8 text-primary-400" />
            Riwayat Pendidikan
          </h2>
        </AnimationWrapper>

        {/* Cyberpunk circuit line timeline */}
        <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-[2px] before:bg-gradient-to-b before:from-transparent before:via-primary-500/35 before:to-transparent">
          
          {educations.map((edu, index) => (
            <AnimationWrapper key={edu.id} delay={0.2 + index * 0.1} direction="up">
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                
                {/* Glowing Node timeline point */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-zinc-950 bg-zinc-900 text-primary-400 group-hover:text-emerald-400 group-hover:border-primary-500/20 group-hover:shadow-[0_0_15px_color-mix(in_srgb,var(--color-primary-500)_20%,transparent)] shadow-md shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 transition-all duration-300 z-10">
                  <div className="w-2.5 h-2.5 rounded-full bg-current animate-pulse"></div>
                </div>
                
                {/* Content Card with Glassmorphism and Motion Hover */}
                <motion.div 
                  whileHover={{ y: -6 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-5 sm:p-6 shadow-[0_15px_30px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.03)] hover:border-primary-500/25 hover:shadow-[0_20px_45px_color-mix(in_srgb,var(--color-primary-500)_20%,transparent)] relative overflow-hidden group transition-colors duration-300"
                >
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary-500/30 to-transparent" />
                  
                  <div className="flex items-start gap-4 mb-4">
                    {edu.logoUrl ? (
                      <div className="w-12 h-12 rounded-xl bg-zinc-950 shrink-0 overflow-hidden border border-zinc-800/60 p-[2px] transition-transform duration-300 group-hover:scale-105">
                        <Image 
                          src={edu.logoUrl} 
                          alt={edu.institutionName} 
                          width={48} 
                          height={48} 
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-zinc-950 shrink-0 border border-zinc-800/60 flex items-center justify-center text-primary-400">
                        <GraduationCap className="h-5 w-5" />
                      </div>
                    )}
                    
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-white leading-snug tracking-wide group-hover:text-primary-400 transition-colors duration-300">{edu.institutionName}</h3>
                      {edu.degree && (
                        <p className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400 font-bold text-xs uppercase tracking-wider">{edu.degree}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Info badges layout */}
                  <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-4">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-950/60 border border-zinc-800/80 rounded-lg">
                      <Calendar className="h-3 w-3 text-primary-500" />
                      {edu.startYear || '?'} - {edu.endYear || 'Sekarang'}
                    </span>
                    {edu.currentSemester && (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-950/60 border border-zinc-800/80 rounded-lg">
                        <BookOpen className="h-3 w-3 text-primary-500" />
                        Sem. {edu.currentSemester}
                      </span>
                    )}
                    {edu.nim && (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-950/60 border border-zinc-800/80 rounded-lg">
                        <Layers className="h-3 w-3 text-primary-500" />
                        NIM: {edu.nim}
                      </span>
                    )}
                  </div>
                  
                  {edu.description && (
                    <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed font-light border-t border-zinc-900 pt-3 mt-3">
                      {edu.description}
                    </p>
                  )}
                </motion.div>
              </div>
            </AnimationWrapper>
          ))}
        </div>
      </div>
    </section>
  );
}
