'use client';

import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PublicLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  const containerRef = useRef<HTMLDivElement>(null);

  const isAdmin = session?.user?.role === 'ADMIN';
  const dashboardLink = isAdmin ? '/admin/dashboard' : '/dashboard/portfolios';
  const buttonText = isAdmin ? 'Kembali ke Admin' : 'Kelola Portofolio';

  // Dynamic cursor-tracking gradient background logic
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    containerRef.current.style.setProperty('--mouse-x', `${x}px`);
    containerRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen bg-zinc-950 overflow-x-hidden transition-all duration-300"
      style={{
        backgroundImage: `
          radial-gradient(circle 800px at var(--mouse-x, 50%) var(--mouse-y, 50%), color-mix(in srgb, var(--color-primary-500) 7%, transparent), transparent 45%),
          linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 24px 24px, 24px 24px',
        backgroundPosition: '0 0, 0 0, 0 0',
      }}
    >
      
      {/* Background Ambient Glowing Orbs */}
      <div className="absolute top-[5%] left-[-10%] w-[450px] h-[450px] rounded-full bg-primary-500/5 blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-[10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[130px] pointer-events-none animate-pulse" style={{ animationDuration: '10s' }} />
      <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-secondary-500/3 blur-[110px] pointer-events-none" />

      {/* Radial overlay to vignette the background */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-zinc-950/80 to-zinc-950 pointer-events-none z-0" />

      {/* Main Content Area */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Floating Glassmorphism Back Button for Authenticated Users (hidden in preview mode) */}
      <AnimatePresence>
        {session?.user && !pathname.includes('/preview') && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 200, damping: 20 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Link 
              href={dashboardLink}
              className="flex items-center gap-2.5 px-5 py-3 bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-full shadow-[0_15px_35px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.03)] hover:shadow-[0_0_20px_color-mix(in_srgb,var(--color-primary-500)_20%,transparent)] hover:border-primary-500/40 transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="bg-primary-500/10 p-1.5 rounded-full border border-primary-500/20 group-hover:bg-primary-500/20 transition-all duration-300">
                <ArrowLeft className="w-4 h-4 text-primary-400" />
              </div>
              <span className="text-sm font-bold text-zinc-300 group-hover:text-white tracking-wide pr-1 transition-colors">
                {buttonText}
              </span>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
