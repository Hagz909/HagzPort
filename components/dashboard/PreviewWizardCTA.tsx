'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Globe, Wand2, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface PreviewWizardCTAProps {
  portfolioId: string;
  isPublished: boolean;
}

export function PreviewWizardCTA({ portfolioId, isPublished }: PreviewWizardCTAProps) {
  const router = useRouter();
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublishAndContinue = async () => {
    if (!isPublished) {
      setIsPublishing(true);
      try {
        const res = await fetch(`/api/dashboard/portfolios/${portfolioId}/settings`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isPublished: true }),
        });
        
        if (!res.ok) throw new Error('Gagal mempublikasikan portofolio');
        toast.success('Portofolio berhasil dipublikasikan!');
      } catch (error) {
        toast.error('Terjadi kesalahan saat mempublikasikan');
        setIsPublishing(false);
        return;
      }
    }
    
    // Redirect to Generate CV (Studio Resume)
    router.push('/dashboard/resume');
  };

  return (
    <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-[0_0_30px_rgba(6,182,212,0.15)] relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-cyan-500/0 -translate-x-full group-hover:animate-shimmer pointer-events-none" />
      
      <div className="flex-1 text-center sm:text-left z-10">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center justify-center sm:justify-start gap-2">
          <span className="text-2xl">🎉</span> Portofolio Anda Siap!
        </h2>
        <p className="text-sm text-zinc-400">
          Langkah terakhir: Publikasikan portofolio Anda ke publik dan gunakan fitur ajaib kami untuk merubah portofolio ini menjadi CV profesional (PDF) dalam hitungan detik.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto z-10">
        {!isPublished ? (
          <button
            onClick={handlePublishAndContinue}
            disabled={isPublishing}
            className="btn bg-cyan-500 hover:bg-cyan-600 text-black font-bold whitespace-nowrap border-0 flex items-center justify-center py-2.5 px-6 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all hover:scale-105"
          >
            {isPublishing ? (
              <Loader2 size={18} className="animate-spin mr-2" />
            ) : (
              <Globe size={18} className="mr-2" />
            )}
            {isPublishing ? 'Mempublikasikan...' : 'Publish & Generate CV'}
            {!isPublishing && <ArrowRight size={18} className="ml-2" />}
          </button>
        ) : (
          <Link
            href="/dashboard/resume"
            className="btn bg-cyan-500 hover:bg-cyan-600 text-black font-bold whitespace-nowrap border-0 flex items-center justify-center py-2.5 px-6 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all hover:scale-105"
          >
            <Wand2 size={18} className="mr-2" />
            Generate CV Sekarang
            <ArrowRight size={18} className="ml-2" />
          </Link>
        )}
      </div>
    </div>
  );
}
