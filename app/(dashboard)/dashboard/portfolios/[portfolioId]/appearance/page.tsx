'use client';

import { useState, useEffect, use } from 'react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { toast } from 'react-hot-toast';
import { Loader2, Save, Palette, Type } from 'lucide-react';
import { useRouter } from 'next/navigation';

const THEMES = [
  { id: 'cyan', name: 'Neon Cyan (Default)', primary: 'bg-cyan-500', secondary: 'bg-blue-600' },
  { id: 'emerald', name: 'Emerald Green', primary: 'bg-emerald-500', secondary: 'bg-teal-600' },
  { id: 'amethyst', name: 'Amethyst Purple', primary: 'bg-fuchsia-500', secondary: 'bg-violet-600' },
  { id: 'sunset', name: 'Sunset Orange', primary: 'bg-orange-500', secondary: 'bg-rose-600' },
  { id: 'sapphire', name: 'Sapphire Blue', primary: 'bg-blue-500', secondary: 'bg-cyan-500' },
  { id: 'ruby', name: 'Ruby Red', primary: 'bg-red-500', secondary: 'bg-orange-500' },
  { id: 'amber', name: 'Amber Gold', primary: 'bg-amber-500', secondary: 'bg-emerald-500' },
  { id: 'sakura', name: 'Sakura Pink', primary: 'bg-pink-500', secondary: 'bg-fuchsia-500' },
];

const FONTS = [
  { id: 'modern', name: 'Modern (Montenegrin & Google Sans)', class: 'font-sans' },
  { id: 'sans', name: 'Minimal Sans (Inter)', class: 'font-sans' },
  { id: 'serif', name: 'Classic Serif (Playfair)', class: 'font-serif' },
  { id: 'mono', name: 'Terminal Mono (JetBrains)', class: 'font-mono' },
];

export default function AppearancePage({ params }: { params: Promise<{ portfolioId: string }> }) {
  const { portfolioId } = use(params);
  const router = useRouter();
  
  const [theme, setTheme] = useState('cyan');
  const [font, setFont] = useState('modern');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const res = await fetch(`/api/dashboard/portfolios`);
        if (res.ok) {
          const data = await res.json();
          const p = data.find((x: any) => x.id === portfolioId);
          if (p) {
            if (p.theme) setTheme(p.theme);
            if (p.font) setFont(p.font);
          }
        }
      } catch (error) {
        toast.error('Gagal memuat pengaturan tampilan');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPortfolio();
  }, [portfolioId]);

  const onSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/dashboard/portfolios/${portfolioId}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme, font }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Gagal menyimpan tampilan');
      }
      
      toast.success('Pengaturan tampilan berhasil disimpan');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-zinc-900 rounded-lg"></div>
        <div className="card p-6 h-64 bg-zinc-900 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Tampilan & Personalisasi" 
        description="Sesuaikan warna tema dan gaya huruf portofolio Anda agar tampil beda."
      />

      <div className="card p-6">
        <div className="space-y-8">
          
          {/* Theme Selector */}
          <div>
            <h3 className="text-sm font-medium text-zinc-300 mb-4 flex items-center">
              <Palette size={16} className="mr-2 text-cyan-400" /> Tema Warna
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  disabled={isSaving}
                  className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                    theme === t.id 
                      ? 'border-cyan-500 bg-cyan-500/10' 
                      : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex -space-x-2 mb-3">
                    <div className={`w-8 h-8 rounded-full ${t.primary} ring-2 ring-zinc-950 shadow-lg z-10`}></div>
                    <div className={`w-8 h-8 rounded-full ${t.secondary} ring-2 ring-zinc-950 shadow-lg`}></div>
                  </div>
                  <span className="text-sm font-medium text-zinc-300">{t.name}</span>
                  {theme === t.id && (
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-500"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-zinc-800 pt-8">
            <h3 className="text-sm font-medium text-zinc-300 mb-4 flex items-center">
              <Type size={16} className="mr-2 text-cyan-400" /> Gaya Huruf (Tipografi)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {FONTS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFont(f.id)}
                  disabled={isSaving}
                  className={`relative flex items-center p-4 rounded-xl border-2 transition-all text-left ${
                    font === f.id 
                      ? 'border-cyan-500 bg-cyan-500/10' 
                      : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                  }`}
                >
                  <div className={`text-2xl font-bold mr-4 ${f.class}`}>Aa</div>
                  <div>
                    <span className="block text-sm font-medium text-zinc-200">{f.name}</span>
                    <span className="block text-xs text-zinc-500 mt-1">
                      {f.id === 'modern' ? 'Kesan berani dan mewah' : 
                       f.id === 'sans' ? 'Bersih dan profesional' : 
                       f.id === 'serif' ? 'Elegan dan klasik' : 'Teknikal dan terstruktur'}
                    </span>
                  </div>
                  {font === f.id && (
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-500"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-6 flex justify-end">
            <button
              onClick={onSave}
              disabled={isSaving}
              className="btn btn-primary"
            >
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isSaving ? 'Menyimpan...' : 'Simpan Tampilan'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
