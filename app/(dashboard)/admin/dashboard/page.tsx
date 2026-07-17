'use client';

import { useState, useEffect } from 'react';
import { Users, FolderGit2, FolderOpen, Mail, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { StatusBadge } from '@/components/admin/StatusBadge';
import Image from 'next/image';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';

interface DashboardStats {
  totalUsers: number;
  totalPortfolios: number;
  totalProjects: number;
  unreadMessages: number;
  recentUsers: any[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (!res.ok) throw new Error('Gagal memuat statistik admin');
      const data = await res.json();
      setStats(data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Pengguna',
      value: stats?.totalUsers || 0,
      icon: <Users className="w-6 h-6 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />,
      bg: 'bg-cyan-500/10',
      glow: 'bg-cyan-500',
      link: '/admin/users'
    },
    {
      title: 'Total Portofolio',
      value: stats?.totalPortfolios || 0,
      icon: <FolderOpen className="w-6 h-6 text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]" />,
      bg: 'bg-sky-500/10',
      glow: 'bg-sky-500',
      link: '/admin/users'
    },
    {
      title: 'Total Proyek',
      value: stats?.totalProjects || 0,
      icon: <FolderGit2 className="w-6 h-6 text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]" />,
      bg: 'bg-blue-500/10',
      glow: 'bg-blue-500',
      link: '/admin/users'
    },
    {
      title: 'Pesan Belum Dibaca',
      value: stats?.unreadMessages || 0,
      icon: <Mail className="w-6 h-6 text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]" />,
      bg: 'bg-indigo-500/10',
      glow: 'bg-indigo-500',
      link: '/admin/messages'
    },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-2">
        <h1 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-sky-600 drop-shadow-md mb-2">
          Admin Dashboard
        </h1>
        <p className="text-zinc-400">Ringkasan statistik dan aktivitas platform HAGZPORT.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <div key={i} className="group relative bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-6 shadow-lg hover:shadow-[0_8px_30px_rgba(6,182,212,0.15)] hover:-translate-y-1.5 hover:border-cyan-500/30 transition-all duration-300 overflow-hidden">
            <div className={`absolute -top-6 -right-6 w-32 h-32 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-300 rounded-full ${card.glow}`} />
            
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className={`p-3 rounded-xl border border-zinc-700/30 ${card.bg}`}>
                {card.icon}
              </div>
              <Link href={card.link} className="text-zinc-500 hover:text-cyan-400 transition-colors" title="Lihat detail">
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="relative z-10">
              <p className="text-sm font-medium text-zinc-400 mb-1">{card.title}</p>
              <h3 className="text-3xl font-bold text-white drop-shadow-md">
                <AnimatedCounter value={card.value} />
              </h3>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="flex justify-between items-center mb-6 relative z-10">
          <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            Pengguna Baru Mendaftar
          </h2>
          <Link href="/admin/users" className="text-sm font-medium text-cyan-500 hover:text-cyan-400 transition-colors">
            Lihat Semua
          </Link>
        </div>
        
        <div className="divide-y divide-zinc-800/50 relative z-10">
          {stats?.recentUsers?.length === 0 ? (
            <p className="py-8 text-center text-zinc-500">Belum ada pengguna terdaftar.</p>
          ) : (
            stats?.recentUsers?.map((user) => (
              <div key={user.id} className="py-4 flex items-center justify-between hover:bg-zinc-800/40 px-4 -mx-4 rounded-xl transition-colors group">
                <div className="flex items-center space-x-4">
                  {user.image ? (
                    <Image src={user.image} alt={user.name} width={40} height={40} className="rounded-full bg-zinc-800 object-cover border border-zinc-700 group-hover:border-cyan-500/50 transition-colors" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold border border-zinc-700 group-hover:border-cyan-500/50 group-hover:text-cyan-400 transition-colors shadow-inner">
                      {user.name?.charAt(0) || '?'}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-bold text-zinc-100">{user.name}</p>
                    <p className="text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-xs font-medium text-zinc-500">
                    {new Date(user.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <StatusBadge type="role" value={user.role} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
