'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, MailOpen, Mail, Trash2, Maximize2, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { DataTable, Column } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import Link from 'next/link';
import { CustomSelect } from '@/components/ui/CustomSelect';

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [readFilter, setReadFilter] = useState('');
  
  // Selected Message for Modal
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchMessages();
  }, [debouncedSearch, readFilter]);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams();
      if (debouncedSearch) query.append('search', debouncedSearch);
      if (readFilter) query.append('isRead', readFilter === 'read' ? 'true' : 'false');
      
      const res = await fetch(`/api/admin/messages?${query.toString()}`);
      if (!res.ok) throw new Error('Gagal memuat pesan');
      const data = await res.json();
      setMessages(data.messages);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleRead = async (messageId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/messages/${messageId}/toggle-read`, { method: 'PATCH' });
      if (!res.ok) throw new Error('Gagal mengubah status pesan');
      toast.success(currentStatus ? 'Ditandai belum dibaca' : 'Ditandai sudah dibaca');
      fetchMessages();
      if (selectedMessage && selectedMessage.id === messageId) {
        setSelectedMessage({ ...selectedMessage, isRead: !currentStatus });
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const columns: Column<any>[] = [
    {
      header: 'Pengirim',
      cell: (msg) => (
        <div>
          <div className="font-bold text-white">{msg.senderName}</div>
          <div className="text-xs text-zinc-400">{msg.senderEmail}</div>
        </div>
      )
    },
    {
      header: 'Subjek / Pesan',
      cell: (msg) => (
        <div className="max-w-[200px] sm:max-w-xs md:max-w-md">
          <div className="font-medium text-zinc-300 truncate">{msg.subject || 'Tanpa Subjek'}</div>
          <div className="text-xs text-zinc-500 truncate">{msg.message}</div>
        </div>
      )
    },
    {
      header: 'Portofolio',
      cell: (msg) => (
        <Link 
          href={`/${msg.portfolio.username}`}
          target="_blank"
          className="text-cyan-500 hover:text-cyan-400 text-sm font-medium transition-colors"
        >
          /{msg.portfolio.username}
        </Link>
      )
    },
    {
      header: 'Status',
      cell: (msg) => <StatusBadge type="message" value={msg.isRead} />
    },
    {
      header: 'Tanggal',
      cell: (msg) => (
        <span className="text-xs text-zinc-400">
          {new Date(msg.createdAt).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
          })}
        </span>
      )
    },
    {
      header: 'Aksi',
      className: 'text-right',
      cell: (msg) => (
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={() => handleToggleRead(msg.id, msg.isRead)}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors"
            title={msg.isRead ? "Tandai Belum Dibaca" : "Tandai Sudah Dibaca"}
          >
            {msg.isRead ? <Mail className="w-4 h-4" /> : <MailOpen className="w-4 h-4 text-cyan-400" />}
          </button>
          <button
            onClick={() => setSelectedMessage(msg)}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors"
            title="Lihat Detail Pesan"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Monitor Pesan</h1>
          <p className="text-sm text-zinc-400">Pantau semua pesan kontak dari seluruh portofolio publik.</p>
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row gap-4 relative z-20 overflow-visible">
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[80px] rounded-full" />
        </div>
        <div className="relative flex-1 z-10 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-cyan-400 transition-colors" />
          <input
            type="text"
            placeholder="Cari pengirim, email, atau isi pesan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 glass-panel rounded-xl text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500/50 focus:shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-all"
          />
        </div>
        <div className="w-full sm:w-48 flex-shrink-0 z-20">
          <CustomSelect
            value={readFilter}
            onChange={setReadFilter}
            options={[
              { value: '', label: 'Semua Status' },
              { value: 'unread', label: 'Belum Dibaca' },
              { value: 'read', label: 'Sudah Dibaca' }
            ]}
          />
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={messages} 
        isLoading={isLoading} 
        emptyMessage="Tidak ada pesan yang ditemukan."
      />

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedMessage(null)}
          ></div>
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-2xl glass-panel rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              
              <div className="flex justify-between items-center p-4 sm:p-6 border-b border-zinc-800">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-bold text-white">Detail Pesan</h3>
                  <StatusBadge type="message" value={selectedMessage.isRead} />
                </div>
                <button 
                  onClick={() => setSelectedMessage(null)}
                  className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 sm:p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-1">Pengirim</label>
                    <p className="font-medium text-white">{selectedMessage.senderName}</p>
                    <p className="text-sm text-zinc-400">{selectedMessage.senderEmail}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-1">Portofolio Tujuan</label>
                    <p className="font-medium text-white">{selectedMessage.portfolio.user.name}</p>
                    <Link 
                      href={`/${selectedMessage.portfolio.username}`}
                      target="_blank"
                      className="text-sm text-cyan-500 hover:text-cyan-400 inline-flex items-center"
                    >
                      /{selectedMessage.portfolio.username}
                    </Link>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-1">Subjek</label>
                  <p className="font-medium text-white text-lg">{selectedMessage.subject || 'Tanpa Subjek'}</p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-2">Isi Pesan</label>
                  <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-zinc-300 text-sm whitespace-pre-wrap leading-relaxed">
                    {selectedMessage.message}
                  </div>
                </div>
                
                <div className="text-xs text-zinc-500 text-right">
                  Diterima pada: {new Date(selectedMessage.createdAt).toLocaleString('id-ID')}
                </div>
              </div>

              <div className="glass-panel p-4 sm:p-6 flex justify-end gap-3">
                <button
                  onClick={() => handleToggleRead(selectedMessage.id, selectedMessage.isRead)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {selectedMessage.isRead ? 'Tandai Belum Dibaca' : 'Tandai Sudah Dibaca'}
                </button>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-cyan-900/20"
                >
                  Tutup
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
