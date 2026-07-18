'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Loader2, FileText, Download, ExternalLink, Calendar, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { FeedbackModal } from '@/components/dashboard/FeedbackModal';
import { useRouter, useSearchParams } from 'next/navigation';

export default function CVTerbuatPage() {
  const [cvLogs, setCvLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchCvLogs = async () => {
      try {
        const res = await fetch('/api/dashboard/cv-logs');
        if (res.ok) {
          const data = await res.json();
          setCvLogs(data);
        }
      } catch (error) {
        toast.error('Gagal memuat riwayat CV');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCvLogs();

    // Check feedback if redirected from generate success
    if (searchParams.get('success') === '1') {
      const checkFeedback = async () => {
        try {
          const statusRes = await fetch('/api/dashboard/feedback/status');
          if (statusRes.ok) {
            const { shouldShow } = await statusRes.json();
            if (shouldShow) {
              setTimeout(() => setShowFeedback(true), 1500);
            }
          }
        } catch (err) {}
      };
      checkFeedback();
    }
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <PageHeader 
        title="Riwayat CV Terbuat" 
        description="Koleksi dokumen Resume / CV (PDF) yang pernah Anda generate menggunakan Studio Resume."
      />

      {cvLogs.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Belum ada CV yang dibuat"
          description="Anda belum pernah melakukan generate CV PDF dari portofolio Anda."
          actionLabel="Buat CV Sekarang"
          actionOnClick={() => router.push('/dashboard/resume')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cvLogs.map((cv) => (
            <div key={cv.id} className="card p-6 flex flex-col group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-50 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-cyan-500/10 rounded-xl">
                  <FileText className="text-cyan-400" size={24} />
                </div>
                <div className="text-right">
                  <p className="text-xs text-zinc-500 mb-1 flex items-center gap-1 justify-end">
                    <Calendar size={12} />
                    {new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(cv.createdAt))}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(new Date(cv.createdAt))} WIB
                  </p>
                </div>
              </div>

              <h3 className="text-lg font-bold text-zinc-100 mb-2 truncate" title={cv.title}>
                {cv.title}
              </h3>
              
              <p className="text-sm text-zinc-400 mb-6">
                Sumber: <span className="text-zinc-300 font-medium">{cv.portfolio?.displayName || cv.portfolio?.username || 'Portofolio'}</span>
              </p>

              <div className="mt-auto grid grid-cols-2 gap-3">
                <a 
                  href={cv.publicUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-ghost flex items-center justify-center text-sm"
                >
                  <ExternalLink size={16} className="mr-2" />
                  Lihat PDF
                </a>
                <a 
                  href={cv.publicUrl} 
                  download={`${cv.title}.pdf`}
                  className="btn bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500 hover:text-black flex items-center justify-center text-sm border border-cyan-500/20"
                >
                  <Download size={16} className="mr-2" />
                  Download
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      <FeedbackModal 
        isOpen={showFeedback} 
        onClose={() => setShowFeedback(false)} 
        onSuccess={() => setShowFeedback(false)} 
      />
    </div>
  );
}
