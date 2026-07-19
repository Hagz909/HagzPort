'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Folder, 
  Layers, 
  MessageSquare, 
  Plus, 
  Edit3, 
  Zap, 
  TrendingUp,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';

interface OverviewStats {
  totalPortfolios: number;
  totalProjects: number;
  totalMessages: number;
  unreadMessages: number;
  completionRate: number;
  defaultUsername: string | null;
  defaultPortfolioId: string | null;
}

export default function DashboardOverviewPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/dashboard/overview');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-cyan-500 drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]" />
      </div>
    );
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      className="max-w-7xl mx-auto space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Page Header (Span Full) */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2">
            Halo, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 drop-shadow-md">{session?.user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-zinc-400 max-w-xl text-lg font-light">
            Selamat datang di <strong className="text-cyan-400 font-medium">Command Center</strong>. Kelola portofolio Anda dengan gaya tak tertandingi.
          </p>
        </div>
        <div className="flex gap-3">
          {stats?.defaultPortfolioId && (
            <Link 
              href={`/dashboard/portfolios/${stats.defaultPortfolioId}/settings`}
              className="px-4 py-2.5 glass-panel glass-panel-hover rounded-xl text-sm font-medium text-white flex items-center gap-2 group"
            >
              <Edit3 size={16} className="text-cyan-400 group-hover:scale-110 transition-transform" />
              Edit Profil
            </Link>
          )}
          <Link 
            href="/dashboard/portfolios"
            className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-600 hover:shadow-[0_0_20px_rgba(176,38,255,0.4)] rounded-xl text-sm font-bold text-white transition-all shadow-lg flex items-center gap-2 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300 relative z-10" />
            <span className="relative z-10">Portofolio Baru</span>
          </Link>
        </div>
      </motion.div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[minmax(180px,auto)]">
        
        {/* Bento Item 1: Main Welcome & Completion (Large) */}
        <motion.div variants={itemVariants} className="md:col-span-2 md:row-span-2 glass-panel p-8 rounded-3xl relative overflow-hidden group flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] group-hover:bg-cyan-500/20 transition-all duration-700" />
          
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Kesiapan Portofolio</h3>
            </div>
            
            <p className="text-zinc-400 text-sm mb-8 leading-relaxed max-w-sm relative z-10">
              Selesaikan profil Anda untuk meningkatkan visibilitas di mata rekruter dan klien potensial di seluruh dunia.
            </p>
          </div>

          <div className="relative z-10">
            <div className="flex justify-between items-end mb-3">
              <span className="text-sm font-medium text-zinc-300">Tingkat Penyelesaian</span>
              <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                {stats?.completionRate || 0}%
              </span>
            </div>
            
            <div className="relative h-3 bg-zinc-950/50 rounded-full overflow-hidden border border-white/5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${stats?.completionRate || 0}%` }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-500 to-purple-500 shadow-[0_0_15px_rgba(6,182,212,0.8)]"
              />
            </div>

            <div className="mt-6 flex items-start gap-3 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm">
              <AlertCircle className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-zinc-300 leading-relaxed">
                {(stats?.completionRate || 0) < 100 
                  ? "Profil Anda belum sempurna. Tambahkan Biodata, Hero Image, dan minimal 1 Project." 
                  : "Luar biasa! Portofolio Anda sudah 100% siap memukau dunia."}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Bento Item 2: Live Link (Medium) */}
        <motion.div variants={itemVariants} className="md:col-span-2 md:row-span-1 glass-panel p-6 rounded-3xl group flex flex-col justify-center relative overflow-hidden hover:border-cyan-500/30 transition-colors">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-purple-500/10 rounded-full blur-[60px]" />
          <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-widest mb-4">Akses Publik</h3>
          
          <div className="flex items-center justify-between gap-4 bg-zinc-950/50 border border-white/5 p-4 rounded-2xl relative z-10">
            <div className="truncate">
              <p className="text-zinc-500 text-xs mb-1">URL Portofolio Utama</p>
              <p className="text-cyan-400 text-base md:text-lg font-medium truncate">
                hagz-port.vercel.app/{stats?.defaultUsername || 'username'}
              </p>
            </div>
            <a 
              href={stats?.defaultUsername ? `/${stats.defaultUsername}` : '#'}
              target="_blank"
              rel="noreferrer"
              className="flex-shrink-0 w-12 h-12 bg-white text-black rounded-xl flex items-center justify-center hover:scale-105 hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              <ExternalLink size={20} />
            </a>
          </div>
        </motion.div>

        {/* Bento Item 3: Messages Stat (Small Square) */}
        <motion.div variants={itemVariants} className="md:col-span-1 md:row-span-1 glass-panel p-6 rounded-3xl group hover:border-purple-500/30 transition-colors flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-purple-500/20 blur-[40px] group-hover:bg-purple-500/30 transition-all" />
          <div className="flex justify-between items-start relative z-10">
            <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20 text-purple-400">
              <MessageSquare className="w-6 h-6" />
            </div>
            {(stats?.unreadMessages ?? 0) > 0 && (
              <span className="text-xs font-bold text-purple-300 bg-purple-500/20 px-2.5 py-1 rounded-full border border-purple-500/30 flex items-center gap-1.5 animate-pulse">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                {stats?.unreadMessages} Baru
              </span>
            )}
          </div>
          <div className="relative z-10">
            <h3 className="text-4xl font-black text-white mt-4">{stats?.totalMessages || 0}</h3>
            <p className="text-zinc-500 text-sm font-medium mt-1">Pesan Masuk</p>
          </div>
        </motion.div>

        {/* Bento Item 4: Projects Stat (Small Square) */}
        <motion.div variants={itemVariants} className="md:col-span-1 md:row-span-1 glass-panel p-6 rounded-3xl group hover:border-cyan-500/30 transition-colors flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-cyan-500/20 blur-[40px] group-hover:bg-cyan-500/30 transition-all" />
          <div className="flex justify-between items-start relative z-10">
            <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 text-cyan-400">
              <Layers className="w-6 h-6" />
            </div>
            <Zap className="w-5 h-5 text-zinc-600 group-hover:text-cyan-400/50 transition-colors" />
          </div>
          <div className="relative z-10">
            <h3 className="text-4xl font-black text-white mt-4">{stats?.totalProjects || 0}</h3>
            <p className="text-zinc-500 text-sm font-medium mt-1">Proyek Publik</p>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}
