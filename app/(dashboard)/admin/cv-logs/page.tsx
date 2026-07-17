'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { FileText, Loader2, ExternalLink, Calendar, User as UserIcon, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminCVLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/admin/cv-logs');
      if (!res.ok) throw new Error('Gagal memuat log');
      const data = await res.json();
      setLogs(data.logs || []);
      if (data.logs?.length > 0) setSelectedLog(data.logs[0]);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleDelete = async (logId: string, logTitle: string) => {
    if (!confirm(`Hapus log CV "${logTitle}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    setDeletingId(logId);
    try {
      const res = await fetch('/api/admin/cv-logs', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: logId }),
      });
      if (res.ok) {
        toast.success(`Log CV "${logTitle}" berhasil dihapus.`);
        if (selectedLog?.id === logId) setSelectedLog(null);
        await fetchLogs();
      } else {
        const data = await res.json();
        toast.error(data.message || 'Gagal menghapus log.');
      }
    } catch {
      toast.error('Terjadi kesalahan saat menghapus log.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6">
      <PageHeader 
        title="Log Generate CV" 
        description="Monitor seluruh pembuatan CV dari pengguna platform HgzPort secara real-time."
      />

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center shadow-2xl">
          <FileText className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <h3 className="text-zinc-400 font-medium">Belum ada log pembuatan CV.</h3>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Log List */}
          <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
            {logs.map((log) => (
              <div 
                key={log.id} 
                onClick={() => setSelectedLog(log)}
                className={`p-4 rounded-xl cursor-pointer transition-all border ${
                  selectedLog?.id === log.id 
                    ? 'bg-cyan-950/30 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
                    : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedLog?.id === log.id ? 'bg-cyan-500/20 text-cyan-400' : 'bg-zinc-800 text-zinc-400'}`}>
                      <UserIcon size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{log.portfolio.user.name}</h4>
                      <p className="text-xs text-zinc-500">{log.portfolio.user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-xs text-zinc-400 mb-1 justify-end">
                      <Calendar size={12} />
                      {new Date(log.createdAt).toLocaleDateString('id-ID', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pl-13">
                  <div className="flex items-center gap-2 text-sm text-cyan-200 bg-cyan-950/40 px-3 py-1.5 rounded-lg border border-cyan-900/50">
                    <FileText size={14} />
                    {log.title}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(log.id, log.title); }}
                    disabled={deletingId === log.id}
                    className="p-2 rounded-lg text-red-400 hover:text-white hover:bg-red-500/20 border border-transparent hover:border-red-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Hapus log CV ini"
                  >
                    {deletingId === log.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: 3D Preview Sticky */}
          <div className="sticky top-24 flex flex-col justify-center items-center relative perspective-1000 min-h-[600px] w-full hidden md:flex">
            {/* Ambient Glow */}
            <div className="absolute inset-0 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none scale-125"></div>

            <AnimatePresence mode="wait">
              <motion.div 
                key={selectedLog?.id || 'empty'}
                initial={{ opacity: 0, rotateY: 15, rotateX: 5, z: -100, scale: 0.9 }}
                animate={{ 
                  opacity: 1, 
                  rotateY: [-4, 4, -4],
                  rotateX: [2, -2, 2],
                  y: [-8, 8, -8],
                  scale: 1
                }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
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
                
                {/* Header Mockup */}
                <div className="h-10 bg-zinc-900 w-full mb-4 flex items-center px-4">
                  <div className="h-2 w-12 bg-zinc-700 rounded-full"></div>
                </div>
                
                {/* Content Mockup */}
                <div className="flex-1 p-5 flex flex-col gap-4">
                  <div className="flex gap-5 items-start border-b border-zinc-200 pb-4">
                    <div className="w-16 h-16 rounded-full bg-zinc-200"></div>
                    <div className="flex-1 space-y-2 mt-2">
                      <div className="h-4 bg-zinc-300 rounded w-3/4"></div>
                      <div className="h-3 bg-cyan-700/20 rounded w-1/2"></div>
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

                {/* Info Overlay */}
                <div className="absolute inset-0 bg-zinc-950/80 flex flex-col items-center justify-center p-6 text-center z-10 opacity-0 hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm">
                  <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(6,182,212,0.5)]">
                    <FileText className="w-8 h-8 text-cyan-400" />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-1">{selectedLog?.portfolio?.user?.name || 'User'}</h3>
                  <p className="text-zinc-300 text-xs mb-6">CV di-generate pada {new Date(selectedLog?.createdAt || Date.now()).toLocaleDateString('id-ID')}</p>
                  <a 
                    href={selectedLog?.publicUrl || '#'} 
                    target="_blank" 
                    rel="noreferrer"
                    className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold rounded-xl flex justify-center items-center gap-2 transition-all hover:scale-105 shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                  >
                    Buka File Asli (PDF) <ExternalLink size={16} />
                  </a>
                </div>

              </motion.div>
            </AnimatePresence>
            <p className="text-zinc-500 text-xs mt-8">Arahkan kursor ke atas dokumen untuk melihat aksi</p>
          </div>

        </div>
      )}
    </div>
  );
}
