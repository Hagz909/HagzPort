'use client';

import { motion } from 'framer-motion';
import { Code2 } from 'lucide-react';

interface SkillsSectionProps {
  skills: string[];
}

export function SkillsSection({ skills }: SkillsSectionProps) {
  if (!skills || skills.length === 0) return null;

  return (
    <section id="skills" className="py-24 bg-zinc-950 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary-500/5 blur-[150px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-semibold tracking-wide uppercase mb-4">
            <Code2 size={14} /> Teknologi & Alat
          </div>
          <h2 className="font-heading text-3xl md:text-5xl text-white tracking-tight">
            Keahlian <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-500">Teknis</span>
          </h2>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 md:gap-4 max-w-4xl mx-auto"
        >
          {skills.map((skill, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05, y: -2 }}
              className="px-6 py-2.5 bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 hover:bg-zinc-800/60 hover:border-primary-500/40 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_0_20px_color-mix(in_srgb,var(--color-primary-500)_20%,transparent)] transition-all duration-300 group"
            >
              <span className="text-zinc-300 group-hover:text-primary-300 font-medium tracking-wide">
                {skill}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
