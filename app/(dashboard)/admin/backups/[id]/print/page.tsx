'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function PrintBackupPage() {
  const params = useParams();
  const [backup, setBackup] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchBackupData();
    }
  }, [params.id]);

  const fetchBackupData = async () => {
    try {
      const res = await fetch(`/api/admin/backups/${params.id}`);
      if (!res.ok) throw new Error('Gagal memuat data backup');
      const data = await res.json();
      setBackup(data.backup);
      
      // Auto trigger print dialog after 1 second to ensure render
      setTimeout(() => {
        window.print();
      }, 1000);
      
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white text-zinc-800">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 animate-spin text-zinc-900 mb-4" />
          <p className="text-sm font-medium">Menyiapkan Laporan PDF...</p>
        </div>
      </div>
    );
  }

  if (!backup) {
    return (
      <div className="p-10 text-center text-red-500 font-bold">
        Laporan tidak ditemukan!
      </div>
    );
  }

  // The parsed JSON data
  const activities = backup.data || [];

  return (
    <div className="bg-white text-black min-h-screen p-8 print:p-0">
      
      {/* Tombol Print (Sembunyi saat dicetak) */}
      <div className="mb-8 print:hidden flex justify-end">
        <button 
          onClick={() => window.print()}
          className="bg-black text-white px-6 py-2 rounded-lg font-bold shadow-md hover:bg-zinc-800"
        >
          Cetak ke PDF / Printer Sekarang
        </button>
      </div>

      {/* Konten PDF */}
      <div className="max-w-[210mm] mx-auto bg-white print:w-full print:max-w-none">
        
        {/* Header Laporan */}
        <div className="border-b-4 border-black pb-6 mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">HAGZPORT CMS</h1>
            <h2 className="text-xl font-bold text-zinc-600">Laporan Arsip Aktivitas Sistem</h2>
          </div>
          <div className="text-right text-sm font-medium text-zinc-500">
            <p>ID Laporan: #{backup.id.substring(backup.id.length - 8).toUpperCase()}</p>
            <p>Dibuat: {new Date(backup.createdAt).toLocaleString('id-ID')}</p>
            <p>Admin: {backup.user?.name || 'Sistem'}</p>
          </div>
        </div>

        {/* Ringkasan */}
        <div className="bg-zinc-100 p-6 rounded-lg mb-8 border border-zinc-300">
          <h3 className="font-bold text-lg mb-4 border-b border-zinc-300 pb-2">Ringkasan Arsip</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-zinc-500 mb-1">Periode Awal</p>
              <p className="font-bold">{new Date(backup.rangeStart).toLocaleString('id-ID')}</p>
            </div>
            <div>
              <p className="text-zinc-500 mb-1">Periode Akhir</p>
              <p className="font-bold">{new Date(backup.rangeEnd).toLocaleString('id-ID')}</p>
            </div>
            <div>
              <p className="text-zinc-500 mb-1">Total Aktivitas Tersimpan</p>
              <p className="font-bold text-xl">{backup.recordCount} Baris</p>
            </div>
          </div>
        </div>

        {/* Tabel Data */}
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-black text-white">
              <th className="py-3 px-4 font-bold border border-black">Waktu (WIB)</th>
              <th className="py-3 px-4 font-bold border border-black">Tipe/Modul</th>
              <th className="py-3 px-4 font-bold border border-black">Detail Aktivitas</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((act: any, idx: number) => (
              <tr key={act.id || idx} className="hover:bg-zinc-50 even:bg-zinc-50 border-b border-zinc-300">
                <td className="py-3 px-4 border-l border-r border-zinc-300 whitespace-nowrap align-top font-medium">
                  {new Date(act.createdAt).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                </td>
                <td className="py-3 px-4 border-r border-zinc-300 whitespace-nowrap align-top">
                  <span className="font-bold text-xs uppercase px-2 py-1 bg-zinc-200 rounded">
                    {act.type || 'SYSTEM'}
                  </span>
                </td>
                <td className="py-3 px-4 border-r border-zinc-300 align-top">
                  <div className="font-bold text-zinc-900 mb-1">{act.title || '-'}</div>
                  <div className="text-zinc-600">{act.message}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer */}
        <div className="mt-16 text-center text-xs text-zinc-500 border-t border-zinc-300 pt-8 print:fixed print:bottom-0 print:w-full print:border-none print:pt-0 pb-4">
          Dokumen ini digenerate secara otomatis oleh sistem HAGZPORT CMS pada {new Date().toLocaleString('id-ID')}.
          <br/>© 2026 HAGZPORT. All rights reserved.
        </div>
      </div>

    </div>
  );
}
