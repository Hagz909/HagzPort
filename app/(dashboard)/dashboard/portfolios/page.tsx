'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, MoreVertical, Globe, Pencil, FileText, Lock, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface Portfolio {
  id: string;
  username: string;
  displayName: string | null;
  isDefault: boolean;
  isPublished: boolean;
  _count: {
    projects: number;
    educations: number;
    contactMessages: number;
  };
}

export default function DashboardPortfoliosPage() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const fetchPortfolios = async () => {
    try {
      const res = await fetch('/api/dashboard/portfolios');
      if (res.ok) {
        const data = await res.json();
        setPortfolios(data);
      }
    } catch (error) {
      toast.error('Gagal memuat data portofolio');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const res = await fetch('/api/dashboard/portfolios', {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        toast.success('Portofolio berhasil dibuat!');
        router.push(`/dashboard/portfolios/${data.portfolio.id}/settings`);
      } else {
        toast.error('Gagal membuat portofolio baru');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (portfolioId: string, username: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus portofolio "${username}" secara permanen? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }
    
    try {
      const res = await fetch(`/api/dashboard/portfolios/${portfolioId}/settings`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        toast.success(`Portofolio "${username}" berhasil dihapus.`);
        fetchPortfolios();
      } else {
        const data = await res.json();
        toast.error(data.message || 'Gagal menghapus portofolio.');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat menghapus portofolio');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-sky-600 drop-shadow-md mb-1">Portofolio Saya</h2>
          <p className="text-sm text-zinc-400">{portfolios.length} portofolio aktif yang Anda kelola</p>
        </div>
        <button 
          onClick={handleCreate} 
          disabled={isCreating}
          className="relative group px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white text-sm font-semibold rounded-xl flex items-center justify-center overflow-hidden transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
          <Plus size={18} className="mr-2 relative z-10" />
          <span className="relative z-10">Buat Portofolio Baru</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolios.map((portfolio) => (
          <div key={portfolio.id} className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-6 flex flex-col shadow-lg relative overflow-hidden group hover:-translate-y-1.5 hover:shadow-[0_10px_40px_rgba(6,182,212,0.15)] transition-all duration-300">
            {/* Top glowing gradient line */}
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div>
                <h3 className="font-bold text-lg text-white tracking-wide flex items-center gap-2 mb-1">
                  {portfolio.displayName || 'Tanpa Nama'}
                  {portfolio.isDefault && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 px-2.5 py-0.5 rounded-full border border-cyan-500/30 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
                      Utama
                    </span>
                  )}
                </h3>
                <Link 
                  href={`/${portfolio.username}`} 
                  target="_blank" 
                  className="text-sm font-medium text-zinc-400 hover:text-cyan-400 transition-colors"
                >
                  /{portfolio.username}
                </Link>
              </div>
              <div className="flex items-center gap-1.5">
                {!portfolio.isDefault && (
                  <button 
                    onClick={() => handleDelete(portfolio.id, portfolio.username)}
                    className="text-red-400 hover:text-white hover:bg-red-500/20 p-1.5 rounded-lg border border-transparent hover:border-red-500/30 transition-all shadow-sm"
                    title="Hapus Portofolio"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
                <button className="text-zinc-500 hover:text-white transition-colors bg-zinc-800/50 hover:bg-zinc-700 p-1.5 rounded-lg">
                  <MoreVertical size={18} />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-8 relative z-10">
              <div className={`flex items-center text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border transition-all ${
                portfolio.isPublished 
                  ? 'bg-green-500/10 text-green-400 border-green-500/30 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]' 
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
              }`}>
                {portfolio.isPublished ? (
                  <><Globe size={12} className="mr-1.5" /> Publik</>
                ) : (
                  <><Lock size={12} className="mr-1.5" /> Draft</>
                )}
              </div>
              <div className="flex items-center text-xs font-medium text-zinc-400 bg-zinc-800/40 px-2.5 py-1 rounded-full border border-zinc-700/50">
                <FileText size={12} className="mr-1.5 text-zinc-300" />
                {portfolio._count.projects} proyek
              </div>
            </div>

            <div className="mt-auto flex gap-3 pt-4 border-t border-zinc-800/50 relative z-10">
              <Link 
                href={`/dashboard/portfolios/${portfolio.id}/hero`}
                className="flex-1 flex items-center justify-center text-xs font-semibold h-9 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-colors border border-zinc-700"
              >
                <Pencil size={14} className="mr-2 text-cyan-400" />
                Edit Data
              </Link>
              <Link 
                href={`/${portfolio.username}`}
                target="_blank"
                className="flex-1 flex items-center justify-center text-xs font-semibold h-9 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-xl border border-cyan-500/30 transition-all hover:shadow-[0_0_15px_rgba(6,182,212,0.2)]"
              >
                <Globe size={14} className="mr-2" />
                Lihat Web
              </Link>
            </div>
          </div>
        ))}

        {/* Empty state creation card */}
        <button 
          onClick={handleCreate}
          disabled={isCreating}
          className="rounded-2xl border-2 border-dashed border-zinc-700/70 hover:border-cyan-500/50 bg-zinc-900/20 hover:bg-cyan-500/5 flex flex-col items-center justify-center min-h-[220px] text-zinc-400 hover:text-cyan-400 transition-all duration-300 group shadow-inner"
        >
          <div className="bg-zinc-800/80 group-hover:bg-cyan-500/20 p-4 rounded-full mb-4 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]">
            <Plus size={28} className="text-zinc-500 group-hover:text-cyan-400" />
          </div>
          <span className="font-semibold tracking-wide">Buat Portofolio Baru</span>
          <span className="text-xs text-zinc-500 mt-2 font-medium opacity-0 group-hover:opacity-100 transition-opacity">Klik untuk menambah entitas</span>
        </button>
      </div>
    </div>
  );
}
