'use client';

import { motion } from 'framer-motion';
import { Briefcase } from 'lucide-react';

interface Experience {
  id: string;
  companyName: string;
  position: string;
  startYear: number | null;
  endYear: number | null;
  description: string | null;
}

interface ExperienceSectionProps {
  experiences: Experience[];
}

export function ExperienceSection({ experiences }: ExperienceSectionProps) {
  if (!experiences || experiences.length === 0) return null;

  return (
    <section id="experience" className="py-24 bg-zinc-950 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 -right-64 w-[500px] h-[500px] rounded-full bg-primary-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -left-64 w-[400px] h-[400px] rounded-full bg-secondary-600/5 blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-semibold tracking-wide uppercase mb-4">
            <Briefcase size={14} /> Riwayat Karir
          </div>
          <h2 className="font-heading text-3xl md:text-5xl text-white tracking-tight">
            Pengalaman <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-500">Kerja</span>
          </h2>
        </motion.div>

        <div className="relative border-l border-zinc-800 ml-4 md:ml-8 space-y-12">
          {experiences.map((exp, index) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative pl-8 md:pl-12"
            >
              {/* Timeline dot */}
              <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-primary-500 shadow-[0_0_10px_#06b6d4] ring-4 ring-zinc-950" />
              
              <div className="group">
                <div className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-4 mb-2">
                  <h3 className="text-xl font-bold text-white group-hover:text-primary-400 transition-colors">
                    {exp.position}
                  </h3>
                  <span className="text-primary-500 font-semibold text-sm hidden md:inline">•</span>
                  <span className="text-zinc-400 font-medium">
                    {exp.companyName}
                  </span>
                </div>
                
                <div className="inline-block px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-500 mb-4">
                  {exp.startYear || '?'} — {exp.endYear || 'Sekarang'}
                </div>

                {exp.description && (
                  <p className="text-zinc-400 text-sm md:text-base leading-relaxed font-light whitespace-pre-wrap">
                    {exp.description}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
