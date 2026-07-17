'use client';

import { useState, useEffect } from 'react';
import { Archive, Download, Trash2, Calendar, FileText, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';

export default function BackupsPage() {
  const [backups, setBackups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/backups');
      if (res.ok) {
        const data = await res.json();
        setBackups(data.backups || []);
      } else {
        toast.error('Gagal mengambil daftar backup');
      }
    } catch (err) {
      toast.error('Terjadi kesalahan memuat data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      const res = await fetch(`/api/admin/backups/${itemToDelete}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus');
      
      toast.success('Backup berhasil dihapus');
      setBackups(prev => prev.filter(b => b.id !== itemToDelete));
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsConfirmOpen(false);
      setItemToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <Archive className="w-6 h-6 text-emerald-400" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-md">Backup Aktivitas</h1>
          </div>
          <p className="text-sm text-zinc-400">Arsip otomatis dari log aktivitas yang telah melampaui batas halaman. Unduh sebagai PDF untuk pelaporan.</p>
        </div>
      </div>

      <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative z-10">
          {backups.length === 0 ? (
            <div className="py-10">
              <EmptyState 
                icon={Archive} 
                title="Belum ada arsip backup" 
                description="Backup akan terbuat otomatis jika halaman Aktivitas Realtime kelebihan kapasitas (> 65 data)." 
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {backups.map((backup) => (
                <div key={backup.id} className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-5 hover:border-emerald-500/30 transition-all group shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-emerald-400" />
                        <h3 className="font-bold text-zinc-100 text-lg">Arsip Log Aktivitas</h3>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {backup.recordCount} Baris Data
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center text-sm text-zinc-400">
                        <Calendar className="w-4 h-4 mr-2 text-zinc-500" />
                        <span className="w-16">Periode:</span> 
                        <span className="text-zinc-300 font-medium ml-2">
                          {new Date(backup.rangeStart).toLocaleDateString('id-ID')} - {new Date(backup.rangeEnd).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-zinc-400">
                        <Archive className="w-4 h-4 mr-2 text-zinc-500" />
                        <span className="w-16">Dibuat:</span> 
                        <span className="text-zinc-300 font-medium ml-2">
                          {new Date(backup.createdAt).toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t border-zinc-800/50 mt-auto">
                    <button
                      onClick={() => window.open(`/admin/backups/${backup.id}/print`, '_blank')}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
                    >
                      <Download className="w-4 h-4" />
                      Download Laporan PDF
                    </button>
                    <button
                      onClick={() => {
                        setItemToDelete(backup.id);
                        setIsConfirmOpen(true);
                      }}
                      className="p-2 text-zinc-400 hover:text-red-400 bg-zinc-900 hover:bg-red-500/10 rounded-lg transition-colors border border-zinc-800 hover:border-red-500/30"
                      title="Hapus Backup"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Hapus File Backup"
        message="Apakah Anda yakin ingin menghapus laporan backup aktivitas ini secara permanen? Data aktivitas di dalamnya akan hilang selamanya."
        type="danger"
        confirmText="Ya, Hapus Permanen"
      />
    </div>
  );
}
