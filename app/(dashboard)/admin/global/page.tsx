'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { motion } from 'framer-motion';
import { Globe, Search, ExternalLink, Users, TrendingUp, Calendar, Eye } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface GlobalPortfolio {
  id: string;
  username: string;
  displayName: string | null;
  fullName: string | null;
  tagline: string | null;
  profileImageUrl: string | null;
  theme: string;
  isGlobalPublished: boolean;
  globalPublishedAt: string | null;
  createdAt: string;
  _count: {
    projects: number;
    workExperiences: number;
    contactMessages: number;
  };
  user: {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
  };
}

interface Stats {
  totalGlobal: number;
  newThisWeek: number;
  totalPublished: number;
}

export default function AdminGlobalPage() {
  const [portfolios, setPortfolios] = useState<GlobalPortfolio[]>([]);
  const [stats, setStats] = useState<Stats>({ totalGlobal: 0, newThisWeek: 0, totalPublished: 0 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({ search, status });
        const res = await fetch(`/api/admin/global?${params}`);
        if (res.ok) {
          const data = await res.json();
          setPortfolios(data.portfolios);
          setStats(data.stats);
        }
      } catch {
        // silent
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchData, 300);
    return () => clearTimeout(timer);
  }, [search, status]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Lihat Global"
        description="Monitoring realtime portfolio yang terdaftar di Global Showcase."
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Global', value: stats.totalGlobal, icon: <Globe size={18} />, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
          { label: 'Baru Minggu Ini', value: stats.newThisWeek, icon: <TrendingUp size={18} />, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Total Dipublikasikan', value: stats.totalPublished, icon: <Users size={18} />, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`flex items-center gap-4 p-4 rounded-xl border ${stat.bg}`}
          >
            <div className={stat.color}>{stat.icon}</div>
            <div>
              <p className="text-2xl font-bold text-zinc-100">{stat.value}</p>
              <p className="text-xs text-zinc-500">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari berdasarkan nama, username, atau email..."
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/60 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-4 py-2.5 bg-zinc-900/60 border border-zinc-800 rounded-xl text-sm text-zinc-300 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 cursor-pointer"
        >
          <option value="all">Semua Status</option>
          <option value="published">Global Aktif</option>
          <option value="unpublished">Belum Global</option>
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-zinc-900/50 rounded-xl animate-pulse border border-zinc-800/50" />
          ))}
        </div>
      ) : portfolios.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Globe className="w-12 h-12 text-zinc-600 mb-4" />
          <p className="text-zinc-400">Tidak ada portfolio yang ditemukan.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
                <th className="text-left py-3 px-4">Pengguna</th>
                <th className="text-left py-3 px-4 hidden md:table-cell">Username</th>
                <th className="text-center py-3 px-4 hidden lg:table-cell">Proyek</th>
                <th className="text-center py-3 px-4 hidden lg:table-cell">Pesan</th>
                <th className="text-center py-3 px-4">Status Global</th>
                <th className="text-left py-3 px-4 hidden md:table-cell">Tanggal Global</th>
                <th className="text-center py-3 px-4">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {portfolios.map((p, index) => (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="hover:bg-zinc-900/40 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-zinc-800">
                        {p.profileImageUrl ? (
                          <Image src={p.profileImageUrl} alt="" width={32} height={32} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs font-bold text-zinc-400">
                            {(p.fullName || p.username).charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-zinc-200 truncate max-w-[160px]">{p.fullName || p.user.name}</p>
                        <p className="text-xs text-zinc-500 truncate max-w-[160px]">{p.user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell">
                    <span className="text-zinc-400">@{p.username}</span>
                  </td>
                  <td className="py-3 px-4 text-center hidden lg:table-cell text-zinc-400">{p._count.projects}</td>
                  <td className="py-3 px-4 text-center hidden lg:table-cell text-zinc-400">{p._count.contactMessages}</td>
                  <td className="py-3 px-4 text-center">
                    {p.isGlobalPublished ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-500 text-xs font-medium">
                        Nonaktif
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell text-zinc-500 text-xs">
                    {p.globalPublishedAt
                      ? new Date(p.globalPublishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                      : '—'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Link
                      href={`/${p.username}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors"
                    >
                      <Eye size={12} /> Lihat
                    </Link>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
