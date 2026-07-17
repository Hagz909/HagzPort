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
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

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
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      className="space-y-8 p-1 md:p-4 max-w-6xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Header Section */}
      <motion.div variants={itemVariants} className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-2">
            Selamat Datang, <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-sky-600 drop-shadow-md">{session?.user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-sm md:text-base text-zinc-400 max-w-xl leading-relaxed prompt-light">
            Ini adalah <strong className="text-cyan-400 font-medium">Command Center</strong> Anda. Pantau aktivitas audiens, kelola proyek, dan tingkatkan visibilitas portofolio Anda secara real-time.
          </p>
        </div>
        <div className="flex gap-3">
          {stats?.defaultPortfolioId && (
            <Link 
              href={`/dashboard/portfolios/${stats.defaultPortfolioId}/settings`}
              className="px-4 py-2 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-cyan-500/50 rounded-xl text-sm font-medium text-white transition-all shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex items-center gap-2 group"
            >
              <Edit3 size={16} className="text-zinc-400 group-hover:text-cyan-400 transition-colors" />
              Edit Profil
            </Link>
          )}
          <Link 
            href="/dashboard/portfolios"
            className="btn-shimmer relative overflow-hidden px-4 py-2 bg-gradient-to-r from-cyan-600 to-sky-600 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] rounded-xl text-sm font-bold text-white transition-all shadow-lg flex items-center gap-2 group"
          >
            <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300" />
            <span className="relative z-10">Portofolio Baru</span>
          </Link>
        </div>
      </motion.div>

      {/* Stats Bento Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Portfolios */}
        <div className="card relative overflow-hidden p-6 backdrop-blur-xl border border-zinc-800/60 bg-gradient-to-br from-zinc-900/80 to-black/60 shadow-[0_8px_32px_rgba(0,0,0,0.4)] group hover:border-cyan-500/40 transition-colors duration-500">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all duration-500"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20">
              <Folder className="w-6 h-6 text-cyan-400" />
            </div>
            <TrendingUp className="w-5 h-5 text-zinc-600 group-hover:text-cyan-500/50 transition-colors" />
          </div>
          <div>
            <p className="text-zinc-500 text-sm font-medium mb-1">Total Portofolio</p>
            <h3 className="text-4xl font-black text-white tracking-tight">{stats?.totalPortfolios || 0}</h3>
          </div>
        </div>

        {/* Card 2: Projects */}
        <div className="card relative overflow-hidden p-6 backdrop-blur-xl border border-zinc-800/60 bg-gradient-to-br from-zinc-900/80 to-black/60 shadow-[0_8px_32px_rgba(0,0,0,0.4)] group hover:border-purple-500/40 transition-colors duration-500">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all duration-500"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20">
              <Layers className="w-6 h-6 text-purple-400" />
            </div>
            <Zap className="w-5 h-5 text-zinc-600 group-hover:text-purple-500/50 transition-colors" />
          </div>
          <div>
            <p className="text-zinc-500 text-sm font-medium mb-1">Total Proyek Publik</p>
            <h3 className="text-4xl font-black text-white tracking-tight">{stats?.totalProjects || 0}</h3>
          </div>
        </div>

        {/* Card 3: Messages */}
        <div className="card relative overflow-hidden p-6 backdrop-blur-xl border border-zinc-800/60 bg-gradient-to-br from-zinc-900/80 to-black/60 shadow-[0_8px_32px_rgba(0,0,0,0.4)] group hover:border-emerald-500/40 transition-colors duration-500">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all duration-500"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 relative">
              <MessageSquare className="w-6 h-6 text-emerald-400" />
              {(stats?.unreadMessages ?? 0) > 0 && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              )}
            </div>
            {(stats?.unreadMessages ?? 0) > 0 && (
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                {stats?.unreadMessages} Baru
              </span>
            )}
          </div>
          <div>
            <p className="text-zinc-500 text-sm font-medium mb-1">Pesan Masuk</p>
            <h3 className="text-4xl font-black text-white tracking-tight">{stats?.totalMessages || 0}</h3>
          </div>
        </div>

      </motion.div>

      {/* Profile Completion & Quick Links Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Completion Rate */}
        <div className="lg:col-span-2 card p-6 md:p-8 backdrop-blur-xl border border-zinc-800/60 bg-zinc-900/40 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                Kesiapan Portofolio Utama
              </h3>
              <p className="text-zinc-400 text-sm mt-1">Selesaikan profil Anda untuk meningkatkan kepercayaan rekruter.</p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                {stats?.completionRate || 0}%
              </span>
            </div>
          </div>

          <div className="relative h-4 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800 shadow-inner">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${stats?.completionRate || 0}%` }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-600 to-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.8)] relative"
            >
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4yKSIvPjwvc3ZnPg==')] opacity-50"></div>
            </motion.div>
          </div>

          <div className="mt-6 flex items-center gap-3 bg-cyan-500/5 border border-cyan-500/20 p-4 rounded-xl">
            <AlertCircle className="w-5 h-5 text-cyan-400 flex-shrink-0" />
            <p className="text-sm text-cyan-100/70">
              {(stats?.completionRate || 0) < 100 
                ? "Profil Anda belum sempurna. Tambahkan Biodata, Hero Image, dan minimal 1 Project untuk mencapai 100%." 
                : "Luar biasa! Portofolio Anda sudah lengkap dan siap memukau klien."}
            </p>
          </div>
        </div>

        {/* Live Preview Card */}
        <div className="card p-6 backdrop-blur-xl border border-zinc-800/60 bg-gradient-to-b from-zinc-900/60 to-zinc-950 shadow-xl flex flex-col justify-between group">
          <div>
            <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-4">Tautan Publik</h3>
            <div className="p-4 bg-black/40 border border-zinc-800 rounded-xl mb-4 group-hover:border-zinc-600 transition-colors">
              <p className="text-zinc-400 text-xs mb-1">URL Portofolio Anda</p>
              <a 
                href={stats?.defaultUsername ? `/${stats.defaultUsername}` : '#'}
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 text-sm font-medium hover:underline break-all"
              >
                hgzport.com/{stats?.defaultUsername || 'username'}
              </a>
            </div>
          </div>
          
          <a 
            href={stats?.defaultUsername ? `/${stats.defaultUsername}` : '#'}
            target="_blank"
            rel="noreferrer"
            className="w-full py-3 bg-white text-black text-sm font-bold text-center rounded-xl hover:bg-zinc-200 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.2)]"
          >
            Lihat Portofolio (Live)
          </a>
        </div>

      </motion.div>
    </motion.div>
  );
}
