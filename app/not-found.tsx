'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileQuestion, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  const handleBack = () => {
    // Jika ada riwayat halaman, kembali. Jika tidak, ke dashboard.
    if (typeof window !== 'undefined' && window.history.length > 2) {
      router.back();
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md space-y-6">
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full"></div>
            <FileQuestion className="h-24 w-24 text-cyan-500 relative z-10" strokeWidth={1.5} />
          </div>
        </div>
        
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-50">
          404
        </h1>
        
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-zinc-200">
            Halaman Tidak Ditemukan
          </h2>
          <p className="text-zinc-400">
            Portfolio ini belum dipublikasikan, username tidak ditemukan, atau halaman telah dipindahkan.
          </p>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={handleBack}
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-zinc-800/80 backdrop-blur-sm border border-zinc-700/80 hover:bg-zinc-700 hover:border-cyan-500/50 text-white font-medium transition-all shadow-lg hover:shadow-[0_0_15px_rgba(6,182,212,0.2)] group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Kembali Sebelumnya
          </button>
          <Link 
            href="/" 
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 text-white font-medium transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] hover:-translate-y-0.5"
          >
            <Home className="w-4 h-4 mr-2" />
            Ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
