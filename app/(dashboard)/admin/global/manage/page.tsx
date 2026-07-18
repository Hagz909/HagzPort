'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Search, ToggleLeft, ToggleRight, ExternalLink, AlertTriangle, Eye, X, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';

interface GlobalPortfolio {
  id: string;
  username: string;
  displayName: string | null;
  fullName: string | null;
  profileImageUrl: string | null;
  theme: string;
  isGlobalPublished: boolean;
  globalPublishedAt: string | null;
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

export default function AdminGlobalManagePage() {
  const [portfolios, setPortfolios] = useState<GlobalPortfolio[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [modalPortfolio, setModalPortfolio] = useState<GlobalPortfolio | null>(null);
  const [reason, setReason] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({ search, status: 'all' });
        const res = await fetch(`/api/admin/global?${params}`);
        if (res.ok) {
          const data = await res.json();
          setPortfolios(data.portfolios);
        }
      } catch {
        // silent
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchData, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleToggle = async (portfolio: GlobalPortfolio) => {
    if (portfolio.isGlobalPublished) {
      // Show modal for reason when force-unpublishing
      setModalPortfolio(portfolio);
      setReason('');
      return;
    }

    // Re-enable directly
    await executeToggle(portfolio.id, true, '');
  };

  const executeToggle = async (portfolioId: string, isGlobalPublished: boolean, reasonText: string) => {
    setTogglingId(portfolioId);
    try {
      const res = await fetch(`/api/admin/global/${portfolioId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isGlobalPublished, reason: reasonText }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }

      setPortfolios(prev =>
        prev.map(p =>
          p.id === portfolioId
            ? { ...p, isGlobalPublished, globalPublishedAt: isGlobalPublished ? p.globalPublishedAt : null }
            : p
        )
      );

      toast.success(isGlobalPublished ? 'Portfolio diaktifkan kembali di Global' : 'Portfolio dihapus dari Global');
      setModalPortfolio(null);
    } catch (error: any) {
      toast.error(error.message || 'Gagal mengubah status');
    } finally {
      setTogglingId(null);
    }
  };

  const confirmUnpublish = () => {
    if (modalPortfolio) {
      executeToggle(modalPortfolio.id, false, reason);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Kelola Global"
        description="Moderasi portfolio di Global Showcase. Anda dapat menonaktifkan portfolio yang melanggar ketentuan."
      />

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari berdasarkan nama, username, atau email..."
          className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/60 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
        />
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-zinc-900/50 rounded-xl animate-pulse border border-zinc-800/50" />
          ))}
        </div>
      ) : portfolios.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Shield className="w-12 h-12 text-zinc-600 mb-4" />
          <p className="text-zinc-400">Tidak ada portfolio untuk dikelola.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {portfolios.map((p, index) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="flex items-center gap-4 p-4 bg-zinc-900/40 border border-zinc-800/50 rounded-xl hover:bg-zinc-800/30 transition-all"
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-zinc-800">
                {p.profileImageUrl ? (
                  <Image src={p.profileImageUrl} alt="" width={40} height={40} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm font-bold text-zinc-400">
                    {(p.fullName || p.username).charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-zinc-200 truncate">{p.fullName || p.user.name}</p>
                  {!p.user.isActive && (
                    <span className="px-1.5 py-0.5 bg-red-500/10 border border-red-500/20 rounded text-[10px] text-red-400 font-medium">Nonaktif</span>
                  )}
                </div>
                <p className="text-xs text-zinc-500 truncate">@{p.username} · {p.user.email}</p>
              </div>

              {/* Status Badge */}
              <div className="hidden sm:block">
                {p.isGlobalPublished ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Global Aktif
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-500 text-xs font-medium">
                    Tidak Global
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link
                  href={`/${p.username}`}
                  target="_blank"
                  className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors"
                  title="Lihat Portfolio"
                >
                  <Eye size={14} />
                </Link>
                <button
                  onClick={() => handleToggle(p)}
                  disabled={togglingId === p.id}
                  className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                    p.isGlobalPublished
                      ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400'
                      : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400'
                  }`}
                  title={p.isGlobalPublished ? 'Hapus dari Global' : 'Aktifkan di Global'}
                >
                  {togglingId === p.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : p.isGlobalPublished ? (
                    <ToggleRight size={14} />
                  ) : (
                    <ToggleLeft size={14} />
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Unpublish Confirmation Modal */}
      <AnimatePresence>
        {modalPortfolio && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
              onClick={() => setModalPortfolio(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-md mx-auto bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-red-400">
                  <AlertTriangle size={18} />
                  <h3 className="font-semibold">Hapus dari Global Showcase</h3>
                </div>
                <button onClick={() => setModalPortfolio(null)} className="text-zinc-500 hover:text-zinc-300">
                  <X size={18} />
                </button>
              </div>

              <p className="text-sm text-zinc-400 mb-4">
                Anda akan menghapus portfolio <strong className="text-zinc-200">&quot;{modalPortfolio.displayName || modalPortfolio.username}&quot;</strong> milik <strong className="text-zinc-200">{modalPortfolio.user.name}</strong> dari Global Showcase.
                Pengguna akan menerima notifikasi tentang tindakan ini.
              </p>

              <div className="mb-4">
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Alasan (opsional)</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Contoh: Konten tidak sesuai ketentuan..."
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-red-500/50 resize-none h-20"
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setModalPortfolio(null)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 text-sm hover:bg-zinc-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={confirmUnpublish}
                  disabled={togglingId === modalPortfolio.id}
                  className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {togglingId === modalPortfolio.id && <Loader2 size={14} className="animate-spin" />}
                  Hapus dari Global
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
