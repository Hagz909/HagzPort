'use client';

import { useState, useEffect } from 'react';
import { PieChart, Users, FolderEdit, FolderPlus, MessageSquare, Loader2, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'react-hot-toast';

interface PeriodStats {
  activeUsers: number;
  portfolioUpdates: number;
  projectsAdded: number;
  messageInteractions: number;
}

interface StatsData {
  totalUsers: number;
  totalPortfolios: number;
  totalProjects: number;
  unreadMessages: number;
  periodStats: PeriodStats;
  graphData: any[];
}

const CircularProgress = ({ value, max, icon: Icon, color, stroke, glow, title }: any) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  const percentage = Math.min(100, Math.max(0, max > 0 ? (animatedValue / max) * 100 : 0));
  
  const circumference = 251.2;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  useEffect(() => {
    setAnimatedValue(0);
    const timeout = setTimeout(() => {
      setAnimatedValue(value);
    }, 50);
    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <div className="flex flex-col items-center justify-center bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
      <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-10 group-hover:opacity-30 transition-opacity duration-700 rounded-full bg-current ${color}`} />
      
      <div className="relative w-36 h-36 mb-5">
        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
          <circle cx="50" cy="50" r="40" className="stroke-zinc-800/50" strokeWidth="8" fill="none" />
          <circle 
            cx="50" cy="50" r="40" 
            className={`${stroke} transition-all duration-[1500ms] ease-out ${glow}`} 
            strokeWidth="8" 
            fill="none" 
            strokeDasharray={circumference} 
            strokeDashoffset={strokeDashoffset} 
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon className={`w-5 h-5 mb-1 ${color} ${glow}`} />
          <span className="text-2xl font-bold text-white drop-shadow-md">
            {animatedValue}
          </span>
        </div>
      </div>
      
      <h3 className="text-sm font-semibold text-zinc-300 text-center">{title}</h3>
      <p className="text-xs text-zinc-600 mt-1 font-medium">Total Keseluruhan: {max}</p>
    </div>
  );
};

const periods = [
  { key: '1d', label: '1 Hari' },
  { key: '1w', label: '1 Minggu' },
  { key: '1m', label: '1 Bulan' },
] as const;

export default function StatisticsPage() {
  const [period, setPeriod] = useState<string>('1d');
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async (p: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/stats?period=${p}`);
      if (!res.ok) throw new Error('Gagal memuat statistik');
      const data = await res.json();
      setStats(data);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(period);
  }, [period]);

  const chartData = stats ? [
    {
      title: 'Pengguna Aktif',
      value: stats.periodStats.activeUsers,
      max: stats.totalUsers,
      icon: Users,
      color: 'text-emerald-400',
      glow: 'drop-shadow-[0_0_12px_rgba(52,211,153,0.8)]',
      stroke: 'stroke-emerald-400'
    },
    {
      title: 'Pembaruan Portofolio',
      value: stats.periodStats.portfolioUpdates,
      max: stats.totalPortfolios,
      icon: FolderEdit,
      color: 'text-cyan-400',
      glow: 'drop-shadow-[0_0_12px_rgba(34,211,238,0.8)]',
      stroke: 'stroke-cyan-400'
    },
    {
      title: 'Proyek Ditambahkan',
      value: stats.periodStats.projectsAdded,
      max: stats.totalProjects,
      icon: FolderPlus,
      color: 'text-indigo-400',
      glow: 'drop-shadow-[0_0_12px_rgba(129,140,248,0.8)]',
      stroke: 'stroke-indigo-400'
    },
    {
      title: 'Interaksi Pesan',
      value: stats.periodStats.messageInteractions,
      max: stats.unreadMessages + stats.periodStats.messageInteractions,
      icon: MessageSquare,
      color: 'text-rose-400',
      glow: 'drop-shadow-[0_0_12px_rgba(251,113,133,0.8)]',
      stroke: 'stroke-rose-400'
    },
  ] : [];

  const periodLabel = periods.find(p => p.key === period)?.label || period;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
              <PieChart className="w-6 h-6 text-cyan-400" />
            </div>
            <h1 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-sky-600 drop-shadow-md">Statistik Aktivitas</h1>
          </div>
          <p className="text-sm text-zinc-400">Ringkasan visual pergerakan dan aktivitas real-time pengguna HAGZPORT.</p>
        </div>
        
        {/* Filter Waktu */}
        <div className="flex bg-zinc-950/60 backdrop-blur-md border border-zinc-800 p-1.5 rounded-xl shadow-inner">
          {periods.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                period === p.key
                  ? 'bg-zinc-800/80 text-white shadow-md border border-zinc-700/50'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50 border border-transparent'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {chartData.map((stat, idx) => (
              <CircularProgress key={idx} {...stat} />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-center">
              <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-cyan-500/5 blur-[80px] rounded-full pointer-events-none" />
              <h3 className="text-lg font-bold text-white mb-4 relative z-10 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-cyan-400" />
                Wawasan ({periodLabel})
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed relative z-10 flex-1">
                {stats && stats.periodStats.portfolioUpdates > 0 ? (
                  <>
                    Terdapat <span className="text-cyan-400 font-medium">{stats.periodStats.portfolioUpdates} pembaruan portofolio</span>, 
                    {' '}<span className="text-indigo-400 font-medium">{stats.periodStats.projectsAdded} penambahan proyek</span>, 
                    dan <span className="text-rose-400 font-medium">{stats.periodStats.messageInteractions} pesan masuk</span> dari 
                    {' '}<span className="text-emerald-400 font-medium">{stats.periodStats.activeUsers} pengguna aktif</span>.
                  </>
                ) : (
                  <>Belum ada aktivitas dalam {periodLabel.toLowerCase()} terakhir.</>
                )}
              </p>
            </div>

            <div className="lg:col-span-2 bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-6 shadow-xl relative">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                Tren Aktivitas Sistem
              </h3>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats?.graphData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAktivitas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis dataKey="date" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff' }}
                      itemStyle={{ color: '#22d3ee', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="aktivitas" name="Aktivitas" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorAktivitas)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
