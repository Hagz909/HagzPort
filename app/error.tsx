'use client';

import { useEffect } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 bg-red-500/10 border-2 border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
          <AlertTriangle size={32} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: '"Prompt", sans-serif' }}>
          Terjadi Kesalahan
        </h2>
        <p className="text-zinc-400 mb-8 leading-relaxed">
          Maaf, sistem mengalami kendala saat memproses permintaan Anda. Silakan coba muat ulang halaman.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="w-full flex items-center justify-center py-3 px-4 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-xl transition-all active:scale-95"
          >
            <RotateCcw size={18} className="mr-2" />
            Coba Lagi
          </button>
          <Link
            href="/"
            className="w-full flex items-center justify-center py-3 px-4 bg-transparent border border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800 text-zinc-300 font-medium rounded-xl transition-all active:scale-95"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
