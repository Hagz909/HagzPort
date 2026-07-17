'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { AnimationWrapper } from '../ui/AnimationWrapper';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ExternalLink, MonitorPlay, LayoutGrid } from 'lucide-react';

const WokwiModal = dynamic(() => import('./WokwiModal'), {
  ssr: false,
});
import { Github } from '../ui/Icons';
import { Project } from '@prisma/client';

interface ProjectsSectionProps {
  projects: Project[];
}

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  const [selectedWokwiUrl, setSelectedWokwiUrl] = useState<string | null>(null);

  if (!projects || projects.length === 0) return null;

  // Split projects: up to 3 featured, rest normal
  const featuredProjects = projects.filter(p => p.isFeatured).slice(0, 3);
  const normalProjects = projects.filter(p => !p.isFeatured);

  const renderProjectCard = (project: Project, isFeatured: boolean, index: number) => (
    <AnimationWrapper key={project.id} delay={0.1 * index} direction="up" className={isFeatured ? 'col-span-1 md:col-span-2 lg:col-span-3' : ''}>
      <motion.div 
        whileHover={{ y: -6 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className={`group relative bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/80 hover:border-primary-500/25 rounded-2xl overflow-hidden hover:shadow-[0_20px_45px_color-mix(in_srgb,var(--color-primary-500)_20%,transparent)] h-full flex flex-col transition-colors duration-300 ${isFeatured ? 'lg:flex-row' : ''}`}
      >
        {/* Shiny sweeping overlay hover effect */}
        <div className="absolute inset-0 w-1/3 h-full bg-gradient-to-r from-transparent via-primary-400/5 to-transparent -skew-x-12 translate-x-[-150%] group-hover:translate-x-[350%] transition-transform duration-1000 ease-out pointer-events-none z-10" />

        {/* Top subtle highlight line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary-500/20 to-transparent z-20" />

        {/* Thumbnail area */}
        <div className={`relative bg-zinc-950 shrink-0 overflow-hidden ${isFeatured ? 'lg:w-3/5 min-h-[300px]' : 'aspect-video'}`}>
          {project.imageUrl ? (
            <Image 
              src={project.imageUrl} 
              alt={project.title} 
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes={isFeatured ? "(max-width: 768px) 100vw, 60vw" : "(max-width: 768px) 100vw, 33vw"}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <LayoutGrid className="h-10 w-10 text-zinc-700" />
            </div>
          )}
          
          {isFeatured && (
            <div className="absolute top-4 left-4 z-10">
              <span className="px-3 py-1 bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-lg border border-primary-500/20">
                Unggulan
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-900/20 to-transparent opacity-60"></div>
        </div>

        {/* Content area */}
        <div className={`p-6 flex flex-col flex-1 ${isFeatured ? 'lg:w-2/5 justify-between' : 'justify-between'}`}>
          <div>
            <h3 className={`${isFeatured ? 'text-2xl md:text-3xl' : 'text-xl'} font-heading text-white mb-3 group-hover:text-primary-400 transition-colors tracking-wide`}>
              {project.title}
            </h3>
            
            <p className="text-zinc-400 text-sm leading-relaxed mb-6 font-light">
              {project.description}
            </p>
          </div>

          <div>
            {/* Tech stack badge list with micro-interactions */}
            <div className="flex flex-wrap gap-1.5 mb-6">
              {project.techStack.map((tech) => (
                <motion.span 
                  key={tech} 
                  whileHover={{ scale: 1.08, y: -1 }}
                  transition={{ type: "spring", stiffness: 350, damping: 12 }}
                  className="px-2.5 py-1 bg-zinc-950/60 border border-zinc-800/80 text-zinc-400 hover:text-white hover:border-primary-500/40 hover:bg-primary-500/5 hover:shadow-[0_0_10px_color-mix(in_srgb,var(--color-primary-500)_20%,transparent)] text-[10px] font-mono rounded-lg transition-colors cursor-default select-none"
                >
                  {tech}
                </motion.span>
              ))}
            </div>

            {/* Action buttons links */}
            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-zinc-800/50">
              {project.demoUrl && (
                <motion.a 
                  whileHover={{ scale: 1.05 }}
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-xs font-bold uppercase tracking-wider text-white hover:text-primary-400 transition-colors"
                >
                  <ExternalLink className="h-4 w-4 mr-1.5" /> Demo
                </motion.a>
              )}
              {project.repoUrl && (
                <motion.a 
                  whileHover={{ scale: 1.05 }}
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors"
                >
                  <Github className="h-4 w-4 mr-1.5" /> Repository
                </motion.a>
              )}
              {project.wokwiEmbedUrl && (
                <motion.button 
                  whileHover={{ scale: 1.04 }}
                  onClick={() => setSelectedWokwiUrl(project.wokwiEmbedUrl)}
                  className="flex items-center text-xs font-bold uppercase tracking-wider text-primary-400 hover:text-primary-300 transition-colors ml-auto bg-primary-500/10 hover:bg-primary-500/20 px-3.5 py-1.5 rounded-xl border border-primary-500/20 shadow-[inset_0_0_8px_color-mix(in_srgb,var(--color-primary-500)_20%,transparent)] transition-all"
                >
                  <MonitorPlay className="h-4 w-4 mr-1.5" /> IoT Simulasi
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimationWrapper>
  );

  return (
    <section id="projects" className="py-24 bg-transparent relative overflow-hidden scroll-mt-24">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Section Title */}
        <AnimationWrapper delay={0.1} direction="up">
          <h2 className="font-heading text-3xl sm:text-5xl text-white mb-20 flex items-center gap-4">
            <span className="w-8 h-1 bg-gradient-to-r from-primary-500 to-secondary-600 rounded-full block"></span>
            Proyek Saya
          </h2>
        </AnimationWrapper>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProjects.map((p, i) => renderProjectCard(p, true, i))}
          {normalProjects.map((p, i) => renderProjectCard(p, false, featuredProjects.length + i))}
        </div>
      </div>

      {/* Wokwi Simulation Modal */}
      {selectedWokwiUrl && (
        <WokwiModal 
          url={selectedWokwiUrl} 
          onClose={() => setSelectedWokwiUrl(null)} 
        />
      )}
    </section>
  );
}
