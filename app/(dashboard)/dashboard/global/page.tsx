'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Globe, ExternalLink, Briefcase, GraduationCap, Code2, Loader2, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { CustomSelect } from '@/components/ui/CustomSelect';

interface GlobalPortfolio {
  id: string;
  username: string;
  displayName: string | null;
  fullName: string | null;
  tagline: string | null;
  profileImageUrl: string | null;
  skills: string[];
  theme: string;
  globalPublishedAt: string;
  _count: {
    projects: number;
    workExperiences: number;
    educations: number;
  };
  user: {
    name: string;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

const THEME_COLORS: Record<string, string> = {
  cyan: '#06b6d4',
  emerald: '#10b981',
  amethyst: '#8b5cf6',
  sunset: '#f97316',
  sapphire: '#3b82f6',
  ruby: '#ef4444',
  amber: '#f59e0b',
  sakura: '#ec4899',
};

export default function GlobalPortfolioPage() {
  const [portfolios, setPortfolios] = useState<GlobalPortfolio[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  const fetchPortfolios = useCallback(async (page = 1, append = false) => {
    if (page === 1) setIsLoading(true);
    else setIsLoadingMore(true);

    try {
      const params = new URLSearchParams({
        search,
        sort,
        page: String(page),
        limit: '12',
      });

      const res = await fetch(`/api/global/portfolios?${params}`);
      if (res.ok) {
        const data = await res.json();
        if (append) {
          setPortfolios(prev => [...prev, ...data.portfolios]);
        } else {
          setPortfolios(data.portfolios);
        }
        setPagination(data.pagination);
      }
    } catch {
      // silent
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [search, sort]);

  useEffect(() => {
    if (debounceTimer) clearTimeout(debounceTimer);
    const timer = setTimeout(() => {
      fetchPortfolios(1, false);
    }, 300);
    setDebounceTimer(timer);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, sort]);

  const loadMore = () => {
    if (pagination?.hasMore) {
      fetchPortfolios(pagination.page + 1, true);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Portfolio Global"
        description="Jelajahi portofolio pengguna HgzPort yang telah dipublikasikan ke Global Showcase."
      />

      {/* Search & Sort Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari berdasarkan nama, tagline, atau skill..."
            className="w-full pl-10 pr-4 py-2.5 glass-panel rounded-xl text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500/50 focus:shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-all"
          />
        </div>
        <div className="w-48 flex-shrink-0 z-20">
          <CustomSelect
            value={sort}
            onChange={setSort}
            options={[
              { value: 'newest', label: 'Terbaru' },
              { value: 'projects', label: 'Proyek Terbanyak' },
              { value: 'experience', label: 'Paling Berpengalaman' },
            ]}
          />
        </div>
      </div>

      {/* Stats */}
      {pagination && !isLoading && (
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <Globe size={14} />
          <span>Menampilkan <strong className="text-zinc-300">{pagination.total}</strong> portofolio global</span>
        </div>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-72 glass-panel animate-pulse" />
          ))}
        </div>
      ) : portfolios.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6">
            <Globe className="w-10 h-10 text-zinc-600" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-300 mb-2">Belum Ada Portfolio Global</h3>
          <p className="text-sm text-zinc-500 max-w-md">
            {search
              ? `Tidak ditemukan portfolio yang cocok dengan "${search}". Coba kata kunci lain.`
              : 'Belum ada pengguna yang mempublikasikan portfolio ke Global Showcase. Jadilah yang pertama!'}
          </p>
        </motion.div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {portfolios.map((p, index) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: index % 12 * 0.05 }}
                >
                  <Link href={`/${p.username}`} target="_blank">
                    <div className="group relative glass-panel glass-panel-hover p-6 cursor-pointer h-full overflow-hidden flex flex-col justify-between">
                      {/* Theme Accent Dot & Glow */}
                      <div
                        className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full shadow-[0_0_8px_var(--dot-color)] z-10"
                        style={{ backgroundColor: THEME_COLORS[p.theme] || THEME_COLORS.cyan, '--dot-color': THEME_COLORS[p.theme] || THEME_COLORS.cyan } as React.CSSProperties}
                      />
                      <div 
                        className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-[40px] opacity-20 group-hover:opacity-40 transition-opacity z-0"
                        style={{ backgroundColor: THEME_COLORS[p.theme] || THEME_COLORS.cyan }}
                      />

                      <div className="relative z-10">
                        {/* Profile */}
                        <div className="flex items-center gap-4 mb-4">
                          <div
                            className="w-14 h-14 rounded-full overflow-hidden border-2 flex-shrink-0"
                            style={{ borderColor: THEME_COLORS[p.theme] || THEME_COLORS.cyan } as React.CSSProperties}
                          >
                            {p.profileImageUrl ? (
                              <Image
                                src={p.profileImageUrl}
                                alt={p.fullName || p.username}
                                width={56}
                                height={56}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-zinc-950 flex items-center justify-center text-lg font-bold text-zinc-400">
                                {(p.fullName || p.username).charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="overflow-hidden">
                            <h3 className="font-bold text-zinc-100 truncate group-hover:text-cyan-400 transition-colors">
                              {p.fullName || p.username}
                            </h3>
                            <p className="text-xs font-medium text-cyan-500/70 truncate">
                              @{p.username}
                            </p>
                          </div>
                        </div>

                        {/* Tagline */}
                        {p.tagline && (
                          <p className="text-sm text-zinc-400 mb-4 line-clamp-2 leading-relaxed">
                            {p.tagline}
                          </p>
                        )}

                        {/* Skills */}
                        {p.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {p.skills.slice(0, 4).map((skill, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 bg-black/40 border border-white/5 rounded-md text-[10px] uppercase tracking-wider font-semibold text-zinc-400 backdrop-blur-sm"
                              >
                                {skill}
                              </span>
                            ))}
                            {p.skills.length > 4 && (
                              <span className="px-2 py-0.5 bg-black/40 border border-white/5 rounded-md text-[10px] font-medium text-zinc-500 backdrop-blur-sm">
                                +{p.skills.length - 4}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="relative z-10 flex items-center gap-4 text-xs text-zinc-500 pt-3 border-t border-white/5">
                        <span className="flex items-center gap-1.5">
                          <Code2 size={12} className="text-cyan-500/70" /> {p._count.projects} Proyek
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Briefcase size={12} className="text-purple-500/70" /> {p._count.workExperiences} Pengalaman
                        </span>
                        <span className="ml-auto flex items-center gap-1 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                          Lihat <ExternalLink size={11} />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Load More */}
          {pagination?.hasMore && (
            <div className="flex justify-center pt-4">
              <button
                onClick={loadMore}
                disabled={isLoadingMore}
                className="flex items-center gap-2 px-6 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700 transition-all disabled:opacity-50"
              >
                {isLoadingMore ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
                {isLoadingMore ? 'Memuat...' : 'Muat Lebih Banyak'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
