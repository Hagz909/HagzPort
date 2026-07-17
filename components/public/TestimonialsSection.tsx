'use client';

import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import { AnimationWrapper } from '../ui/AnimationWrapper';

interface Testimonial {
  id: string;
  clientName: string;
  clientRole: string | null;
  quote: string;
}

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

export function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  if (testimonials.length === 0) return null;

  return (
    <section id="testimonials" className="relative py-24 border-t border-zinc-900/80 overflow-hidden">
      
      {/* Dynamic ambient color background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10 w-full">
        
        {/* Section Title Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto mb-16">
          <AnimationWrapper delay={0.1} direction="up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-semibold text-primary-400">
              <Quote size={12} className="text-primary-500" /> Testimonial Klien
            </div>
          </AnimationWrapper>

          <AnimationWrapper delay={0.2} direction="up">
            <h2 className="font-heading text-3xl sm:text-5xl text-white tracking-wide leading-tight">
              Apa Kata <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-400 via-primary-500 to-secondary-500">Klien & Partner Kerja</span>
            </h2>
          </AnimationWrapper>

          <AnimationWrapper delay={0.3} direction="up">
            <p className="font-sans text-zinc-400 text-sm sm:text-base leading-relaxed font-light">
              Feedback jujur dan rekomendasi profesional dari kolaborator, manajer proyek, atau klien yang pernah bekerja sama dengan saya.
            </p>
          </AnimationWrapper>
        </div>

        {/* Testimonials Masonry / Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((test, index) => (
            <AnimationWrapper key={test.id} delay={0.1 * (index % 3)} direction="up">
              <motion.div 
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative h-full flex flex-col justify-between p-6 sm:p-8 rounded-3xl bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/80 hover:border-primary-500/30 hover:shadow-[0_15px_40px_-15px_color-mix(in_srgb,var(--color-primary-500)_20%,transparent)] transition-all group duration-300"
              >
                {/* Accent glow on top card borders */}
                <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-primary-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <div className="space-y-6">
                  {/* Glowing quote icon */}
                  <div className="w-10 h-10 rounded-2xl bg-zinc-950 flex items-center justify-center text-primary-400 border border-zinc-900 group-hover:border-primary-500/20 transition-colors duration-300 shadow-md">
                    <Quote className="h-5 w-5 rotate-180 text-primary-400/80 fill-current" />
                  </div>

                  <p className="font-sans text-zinc-300 text-sm leading-relaxed italic font-light">
                    &ldquo;{test.quote}&rdquo;
                  </p>
                </div>

                <div className="flex items-center gap-4 mt-8 pt-6 border-t border-zinc-900">
                  <div className="w-10 h-10 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-400 font-black shadow-inner border border-primary-500/10">
                    {test.clientName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-sans text-zinc-200 font-bold text-sm leading-tight transition-colors duration-300 group-hover:text-primary-400">
                      {test.clientName}
                    </h4>
                    {test.clientRole && (
                      <span className="font-sans text-zinc-500 text-xs font-light block mt-1 leading-none">
                        {test.clientRole}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimationWrapper>
          ))}
        </div>

      </div>
    </section>
  );
}
