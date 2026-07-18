'use client';

import { useState, useEffect, use } from 'react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { toast } from 'react-hot-toast';
import { Loader2, Save, AlertTriangle, Globe, CheckCircle } from 'lucide-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';

const settingsSchema = z.object({
  displayName: z.string().max(100).optional().or(z.literal('')),
  username: z.string().min(3, 'Username minimal 3 karakter').max(30).regex(/^[a-zA-Z0-9_-]+$/, 'Hanya huruf, angka, strip, dan underscore'),
  isPublished: z.boolean(),
  isDefault: z.boolean(),
  metaTitle: z.string().max(150, 'Maksimal 150 karakter').optional().or(z.literal('')),
  metaDescription: z.string().max(300, 'Maksimal 300 karakter').optional().or(z.literal('')),
  metaKeywords: z.string().max(200, 'Maksimal 200 karakter').optional().or(z.literal('')),
  googleAnalyticsId: z.string().max(50, 'Maksimal 50 karakter').optional().or(z.literal('')),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function SettingsPage({ params }: { params: Promise<{ portfolioId: string }> }) {
  const { portfolioId } = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDefaultInit, setIsDefaultInit] = useState(false);
  const [usernameChangedAt, setUsernameChangedAt] = useState<string | null>(null);

  // Global Publish State
  const [isGlobalPublished, setIsGlobalPublished] = useState(false);
  const [isTogglingGlobal, setIsTogglingGlobal] = useState(false);
  const [completeness, setCompleteness] = useState<{ isComplete: boolean; percentage: number; missing: string[] } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      displayName: '',
      username: '',
      isPublished: false,
      isDefault: false,
      metaTitle: '',
      metaDescription: '',
      metaKeywords: '',
      googleAnalyticsId: '',
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/dashboard/portfolios/${portfolioId}/settings`);
        // We actually don't have a GET for /settings.
        // Wait, I can fetch from /api/dashboard/portfolios API or we can just fetch the portfolio list and find it.
        // Or create GET /api/dashboard/portfolios/[portfolioId]
      } catch (error) {
        toast.error('Gagal memuat pengaturan');
      } finally {
        setIsLoading(false);
      }
    };
    // fetchData();
    // Since I forgot to create GET endpoint for settings, let's fetch from the general portfolios endpoint
    const fetchGeneral = async () => {
      try {
        const res = await fetch(`/api/dashboard/portfolios`);
        if (res.ok) {
          const data = await res.json();
          const p = data.find((x: any) => x.id === portfolioId);
          if (p) {
            setIsDefaultInit(p.isDefault);
            setUsernameChangedAt(p.usernameChangedAt || null);
            reset({
              displayName: p.displayName || '',
              username: p.username || '',
              isPublished: p.isPublished || false,
              isDefault: p.isDefault || false,
              metaTitle: p.metaTitle || '',
              metaDescription: p.metaDescription || '',
              metaKeywords: p.metaKeywords || '',
              googleAnalyticsId: p.googleAnalyticsId || '',
            });
          }
        }
      } catch (error) {
        toast.error('Gagal memuat');
      } finally {
        setIsLoading(false);
      }
    };
    fetchGeneral();

    // Fetch Global Publish Status & Completeness
    const fetchGlobalStatus = async () => {
      try {
        const res = await fetch(`/api/dashboard/portfolios/${portfolioId}/global-publish`);
        if (res.ok) {
          const data = await res.json();
          setIsGlobalPublished(data.isGlobalPublished);
          setCompleteness(data.completeness);
        }
      } catch {}
    };
    fetchGlobalStatus();
  }, [portfolioId, reset]);

  const onSubmit = async (data: SettingsFormValues) => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/dashboard/portfolios/${portfolioId}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Gagal menyimpan data');
      }
      
      toast.success('Pengaturan berhasil disimpan');
      setIsDefaultInit(data.isDefault);
      reset(data); // Reset isDirty state
      router.refresh(); // Refresh layout to update sidebar name
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (isDefaultInit) {
      toast.error('Portofolio utama tidak dapat dihapus');
      return;
    }

    const portfolioName = watch('displayName') || watch('username') || 'Portofolio ini';
    const userInput = window.prompt(`Peringatan: Penghapusan ini bersifat permanen. Ketik "${portfolioName}" untuk mengonfirmasi penghapusan:`);
    
    if (userInput !== portfolioName) {
      if (userInput !== null) {
        toast.error('Nama portofolio tidak cocok. Penghapusan dibatalkan.');
      }
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/dashboard/portfolios/${portfolioId}/settings`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Gagal menghapus portofolio');
      
      toast.success('Portofolio berhasil dihapus');
      router.push('/dashboard/portfolios');
    } catch (error) {
      toast.error('Terjadi kesalahan saat menghapus');
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-zinc-900 rounded-lg"></div>
        <div className="card p-6 space-y-4">
          <div className="h-10 bg-zinc-800 rounded w-full"></div>
          <div className="h-10 bg-zinc-800 rounded w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Pengaturan Portofolio" 
        description="Atur nama tampilan, tautan URL, dan status publikasi portofolio Anda."
      />

      <div className="card p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300">
                Nama Portofolio (Tampilan Internal)
              </label>
              <input
                type="text"
                {...register('displayName')}
                className={`input-field mt-1 ${errors.displayName ? 'border-red-500' : ''}`}
                placeholder="Cth: Portofolio IT"
              />
              <p className="text-xs text-zinc-500 mt-1">Hanya untuk memudahkan Anda mengenali portofolio ini.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 flex items-center justify-between">
                <span>Username / URL Publik <span className="text-red-400">*</span></span>
                {usernameChangedAt && (
                  <span className="text-xs text-amber-500 font-medium">Sudah Pernah Diubah</span>
                )}
              </label>
              
              {usernameChangedAt && (
                <div className="mt-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-400 leading-relaxed">
                    <strong>Perhatian:</strong> Anda sudah mengubah username ini sebelumnya pada {new Date(usernameChangedAt).toLocaleDateString('id-ID')}. 
                    Mengubahnya lagi akan membuat URL lama tidak berfungsi. Pastikan Anda memberi tahu semua orang yang memiliki link lama.
                  </p>
                </div>
              )}

              <div className="flex mt-2">
                <span className={`inline-flex items-center px-3 rounded-l-md border border-r-0 ${usernameChangedAt ? 'border-amber-500/30 bg-amber-500/5 text-amber-500/70' : 'border-zinc-700 bg-zinc-800 text-zinc-400'} sm:text-sm`}>
                  hgzport.com/
                </span>
                <input
                  type="text"
                  {...register('username')}
                  className={`flex-1 block w-full min-w-0 rounded-none rounded-r-md border bg-zinc-900 px-3 py-2 text-sm text-zinc-50 focus:outline-none focus:ring-1 ${usernameChangedAt ? 'border-amber-500/30 focus:border-amber-500 focus:ring-amber-500' : 'border-zinc-700 focus:border-cyan-500 focus:ring-cyan-500'} ${errors.username ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="username"
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-sm text-red-400">{errors.username.message}</p>
              )}
            </div>
          </div>

          {/* SEO & Google Analytics Section */}
          <div className="border-t border-zinc-800 pt-6 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-zinc-300">Pengaturan SEO (Search Engine Optimization)</h3>
              <p className="text-xs text-zinc-500 mt-1">Mengoptimalkan portofolio Anda agar mudah ditemukan di Google.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-zinc-300">
                  Meta Title (Judul Google)
                </label>
                <input
                  type="text"
                  {...register('metaTitle')}
                  className={`input-field mt-1 ${errors.metaTitle ? 'border-red-500' : ''}`}
                  placeholder="Cth: Muhammad Ilham | Senior IoT Engineer & Web Developer"
                />
                {errors.metaTitle && (
                  <p className="mt-1 text-sm text-red-400">{errors.metaTitle.message}</p>
                )}
                <p className="text-xs text-zinc-500 mt-1">Judul yang akan ditampilkan di tab browser dan hasil pencarian Google.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300">
                  Meta Keywords
                </label>
                <input
                  type="text"
                  {...register('metaKeywords')}
                  className={`input-field mt-1 ${errors.metaKeywords ? 'border-red-500' : ''}`}
                  placeholder="Cth: IoT, Web Developer, React, Portofolio"
                />
                {errors.metaKeywords && (
                  <p className="mt-1 text-sm text-red-400">{errors.metaKeywords.message}</p>
                )}
                <p className="text-xs text-zinc-500 mt-1">Kata kunci yang dipisahkan dengan koma.</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-zinc-300">
                  Meta Description (Deskripsi Google)
                </label>
                <textarea
                  {...register('metaDescription')}
                  className={`input-field mt-1 h-20 resize-none ${errors.metaDescription ? 'border-red-500' : ''}`}
                  placeholder="Cth: Portofolio profesional Ilham Musyaffa. Berpengalaman 5 tahun dalam pembuatan sistem IoT dan pengembangan web full-stack."
                />
                {errors.metaDescription && (
                  <p className="mt-1 text-sm text-red-400">{errors.metaDescription.message}</p>
                )}
                <p className="text-xs text-zinc-500 mt-1">Deskripsi singkat di bawah judul pencarian Google. Disarankan maksimal 160 karakter.</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-zinc-300">
                  Google Analytics Tracking ID (Measurement ID)
                </label>
                <input
                  type="text"
                  {...register('googleAnalyticsId')}
                  className={`input-field mt-1 ${errors.googleAnalyticsId ? 'border-red-500' : ''}`}
                  placeholder="Cth: G-XXXXXXXXXX"
                />
                {errors.googleAnalyticsId && (
                  <p className="mt-1 text-sm text-red-400">{errors.googleAnalyticsId.message}</p>
                )}
                <p className="text-xs text-zinc-500 mt-1">Masukkan ID pengukuran Google Analytics 4 Anda untuk memantau kunjungan secara langsung.</p>
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-800 pt-6 space-y-4">
            <h3 className="text-sm font-semibold text-zinc-300">Status & Visibilitas</h3>
            
            <div className="flex items-center gap-3 bg-zinc-900/50 p-4 rounded-lg border border-zinc-800">
              <input 
                type="checkbox" 
                id="isPublished"
                {...register('isPublished')}
                className="w-5 h-5 rounded border-zinc-700 bg-zinc-800 text-cyan-500 focus:ring-cyan-500/20"
              />
              <div>
                <label htmlFor="isPublished" className="font-medium text-zinc-50 cursor-pointer block">
                  Publikasikan Portofolio
                </label>
                <p className="text-sm text-zinc-400">Jika dimatikan, portofolio Anda tidak akan bisa diakses oleh publik.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-zinc-900/50 p-4 rounded-lg border border-zinc-800">
              <input 
                type="checkbox" 
                id="isDefault"
                {...register('isDefault')}
                disabled={isDefaultInit} // Tidak bisa mematikan default diri sendiri
                className="w-5 h-5 rounded border-zinc-700 bg-zinc-800 text-cyan-500 focus:ring-cyan-500/20 disabled:opacity-50"
              />
              <div>
                <label htmlFor="isDefault" className={`font-medium text-zinc-50 block ${!isDefaultInit ? 'cursor-pointer' : ''}`}>
                  Jadikan Portofolio Utama
                </label>
                <p className="text-sm text-zinc-400">Portofolio utama akan ditampilkan ketika pengunjung mengakses halaman profil utama Anda. Hanya 1 portofolio yang dapat menjadi utama.</p>
              </div>
            </div>
          </div>

          {/* Global Showcase Section */}
          <div className="border-t border-zinc-800 pt-6 space-y-4">
            <h3 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
              <Globe size={14} className="text-cyan-400" />
              Global Showcase
            </h3>

            {completeness && (
              <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800 space-y-3">
                {/* Progress Bar */}
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-zinc-400">Kelengkapan Data</span>
                  <span className={`font-bold ${completeness.isComplete ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {completeness.percentage}%
                  </span>
                </div>
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${completeness.isComplete ? 'bg-gradient-to-r from-emerald-500 to-cyan-500' : 'bg-gradient-to-r from-amber-500 to-orange-500'}`}
                    style={{ width: `${completeness.percentage}%` }}
                  />
                </div>

                {/* Missing Items */}
                {completeness.missing.length > 0 && (
                  <div className="space-y-1 mt-2">
                    <p className="text-xs text-zinc-500">Yang perlu dilengkapi:</p>
                    {completeness.missing.map((item, i) => (
                      <p key={i} className="text-xs text-amber-400/80 flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-amber-500" />
                        {item}
                      </p>
                    ))}
                  </div>
                )}

                {/* Toggle */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={async () => {
                      setIsTogglingGlobal(true);
                      try {
                        const res = await fetch(`/api/dashboard/portfolios/${portfolioId}/global-publish`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ isGlobalPublished: !isGlobalPublished }),
                        });
                        const data = await res.json();
                        if (!res.ok) throw new Error(data.message);
                        setIsGlobalPublished(data.portfolio.isGlobalPublished);
                        toast.success(data.portfolio.isGlobalPublished ? 'Portfolio dipublikasikan ke Global Showcase!' : 'Portfolio ditarik dari Global Showcase.');
                        // Refresh completeness
                        const statusRes = await fetch(`/api/dashboard/portfolios/${portfolioId}/global-publish`);
                        if (statusRes.ok) {
                          const statusData = await statusRes.json();
                          setCompleteness(statusData.completeness);
                        }
                      } catch (error: any) {
                        toast.error(error.message);
                      } finally {
                        setIsTogglingGlobal(false);
                      }
                    }}
                    disabled={isTogglingGlobal || (!isGlobalPublished && !completeness.isComplete)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
                      isGlobalPublished ? 'bg-cyan-500' : 'bg-zinc-700'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform duration-200 ${
                      isGlobalPublished ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                  <div>
                    <span className="font-medium text-zinc-50 text-sm block">
                      {isGlobalPublished ? 'Terdaftar di Global Showcase' : 'Publish ke Global Showcase'}
                    </span>
                    <span className="text-xs text-zinc-400">
                      {isGlobalPublished
                        ? 'Portfolio Anda tampil di halaman Global untuk dilihat semua pengguna.'
                        : completeness.isComplete
                        ? 'Klik untuk menampilkan portfolio Anda di halaman Global.'
                        : 'Lengkapi data terlebih dahulu untuk mengaktifkan fitur ini.'}
                    </span>
                  </div>
                  {isTogglingGlobal && <Loader2 className="w-4 h-4 animate-spin text-cyan-400 ml-auto" />}
                  {isGlobalPublished && !isTogglingGlobal && <CheckCircle className="w-4 h-4 text-emerald-400 ml-auto" />}
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSaving || !isDirty}
              className="btn btn-primary"
            >
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </button>
          </div>
        </form>
      </div>

      <div className="card p-6 border-red-900/50 bg-red-950/10">
        <h3 className="text-lg font-semibold text-red-400 flex items-center mb-2">
          <AlertTriangle className="mr-2 h-5 w-5" /> Danger Zone
        </h3>
        <p className="text-sm text-zinc-400 mb-4">
          Tindakan ini tidak dapat dibatalkan. Menghapus portofolio akan menghapus semua data pendidikan, proyek, gambar, dan pesan masuk yang terkait.
        </p>
        <button
          onClick={handleDelete}
          disabled={isDeleting || isDefaultInit}
          className="btn bg-red-500 text-white hover:bg-red-600 border-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isDeleting ? 'Menghapus...' : 'Hapus Portofolio Permanen'}
        </button>
        {isDefaultInit && (
          <p className="text-xs text-red-400 mt-2">
            Anda tidak dapat menghapus portofolio yang sedang dijadikan Utama. Ubah portofolio utama Anda terlebih dahulu.
          </p>
        )}
      </div>
    </div>
  );
}
