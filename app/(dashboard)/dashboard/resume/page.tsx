'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FileText, Loader2, Wand2, Download, ExternalLink } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function ResumeBuilderPage() {
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPortfolio, setSelectedPortfolio] = useState('');
  
  const router = useRouter();

  useEffect(() => {
    fetch('/api/dashboard/portfolios', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        // data is directly the array of portfolios returned by GET /api/dashboard/portfolios
        const portfolioList = Array.isArray(data) ? data : [];
        setPortfolios(portfolioList);
        if (portfolioList.length > 0) {
          const defaultPort = portfolioList.find((p: any) => p.isDefault) || portfolioList[0];
          setSelectedPortfolio(defaultPort.id);
        }
        setIsLoading(false);
      });
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPortfolio) return toast.error('Pilih portofolio terlebih dahulu');

    setIsGenerating(true);
    try {
      const portName = portfolios.find(p => p.id === selectedPortfolio)?.displayName || 'Resume';
      const res = await fetch('/api/dashboard/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          portfolioId: selectedPortfolio,
          title: `CV - ${portName}`
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Gagal generate CV');
      }

      toast.success('CV Berhasil Dibuat! Notifikasi telah dikirim ke Admin.');
      router.push('/dashboard/cv-terbuat?success=1');
      
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <FileText className="text-cyan-400" size={32} />
          Studio Resume
        </h1>
        <p className="text-zinc-400 mt-2">
          Ubah portofolio digital Anda menjadi dokumen CV (PDF/Cetak) profesional dengan satu klik.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-[1fr_1.5fr] md:grid-cols-2 gap-8 lg:gap-12 items-start">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6 bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-xl"
        >
          <h2 className="text-xl font-bold text-white mb-6 border-b border-zinc-800 pb-4">Generate CV Baru</h2>
          
          <form onSubmit={handleGenerate} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Pilih Sumber Data (Portofolio)</label>
              <select
                value={selectedPortfolio}
                onChange={(e) => setSelectedPortfolio(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow appearance-none"
                required
              >
                <option value="" disabled>-- Pilih Portofolio --</option>
                {portfolios.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.displayName || p.username} {p.isDefault ? '(Utama)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4 flex gap-3 text-sm text-cyan-100">
              <Wand2 className="w-5 h-5 flex-shrink-0 text-cyan-400" />
              <p>Sistem akan secara otomatis menyusun Biodata, Edukasi, dan Proyek dari portofolio ini ke dalam layout A4 siap cetak.</p>
            </div>

            <button
              type="submit"
              disabled={isGenerating || portfolios.length === 0}
              className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)]"
            >
              {isGenerating ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Menyusun CV Anda...</>
              ) : (
                <><Wand2 className="w-5 h-5 animate-pulse" /> Mulai Sihir & Generate Preview</>
              )}
            </button>
          </form>

        </motion.div>

        {/* Right side: 3D Live Preview */}
        <div className="flex justify-center items-center relative perspective-1000 min-h-[600px] w-full">
          {/* Ambient Glow */}
          <div className="absolute inset-0 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none scale-125"></div>

          <motion.div 
            initial={{ opacity: 0, rotateY: 15, rotateX: 5, z: -100 }}
            animate={{ 
              opacity: 1, 
              rotateY: [-4, 4, -4],
              rotateX: [2, -2, 2],
              y: [-8, 8, -8]
            }}
            transition={{ 
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-full max-w-[420px] aspect-[1/1.4] bg-white rounded-lg shadow-[0_40px_80px_rgba(0,0,0,0.8),0_0_50px_rgba(6,182,212,0.3)] relative overflow-hidden flex flex-col transform-style-preserve-3d"
          >
            {/* Light reflection effect */}
            <motion.div 
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
              className="absolute top-0 left-0 right-0 h-full w-[200%] bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-60 pointer-events-none transform -skew-x-12 z-20"
            />

            {/* Scanning Laser Animation during generation */}
            {isGenerating && (
              <div className="absolute inset-0 bg-cyan-500/5 z-20 pointer-events-none overflow-hidden">
                <div className="w-full h-1 bg-cyan-400 shadow-[0_0_15px_#06b6d4] absolute top-0 animate-scanline" />
              </div>
            )}
            
            {/* Header Mockup */}
            <div className="h-10 bg-zinc-900 w-full mb-4"></div>
            
            {/* Content Mockup */}
            <div className="flex-1 p-5 flex flex-col gap-4">
              <div className="flex gap-5 items-start border-b border-zinc-200 pb-4">
                <div className="w-16 h-16 rounded-full bg-zinc-200"></div>
                <div className="flex-1 space-y-2 mt-2">
                  <div className="h-4 bg-zinc-300 rounded w-3/4"></div>
                  <div className="h-3 bg-zinc-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-3 mt-2">
                <div className="h-3 bg-zinc-100 rounded w-full"></div>
                <div className="h-3 bg-zinc-100 rounded w-full"></div>
                <div className="h-3 bg-zinc-100 rounded w-5/6"></div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-auto pb-4">
                <div className="space-y-3">
                  <div className="h-3 bg-zinc-200 rounded w-1/2 mb-2"></div>
                  <div className="h-16 bg-zinc-100 rounded w-full"></div>
                  <div className="h-16 bg-zinc-100 rounded w-full"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-3 bg-zinc-200 rounded w-1/2 mb-2"></div>
                  <div className="h-16 bg-zinc-100 rounded w-full"></div>
                  <div className="h-16 bg-zinc-100 rounded w-full"></div>
                </div>
              </div>
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
}
