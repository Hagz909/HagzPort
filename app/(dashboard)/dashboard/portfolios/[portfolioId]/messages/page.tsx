'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Mail, Search, Filter, X, Trash2, MailOpen, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';

export default function PortfolioMessagesPage() {
  const { portfolioId } = useParams();
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  
  // Confirm Dialog for delete
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchMessages();
  }, [portfolioId, filter]);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/dashboard/portfolios/${portfolioId}/messages?status=${filter}`);
      if (!res.ok) throw new Error('Gagal memuat pesan');
      const data = await res.json();
      setMessages(data.messages);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenMessage = async (msg: any) => {
    setSelectedMessage(msg);
    // Mark as read if it is unread
    if (!msg.isRead) {
      try {
        const res = await fetch(`/api/dashboard/portfolios/${portfolioId}/messages/${msg.id}/read`, {
          method: 'PATCH'
        });
        if (res.ok) {
          // Update local state to reflect read status
          setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isRead: true } : m));
        }
      } catch (error) {
        console.error('Failed to mark as read', error);
      }
    }
  };

  const handleDelete = async () => {
    if (!messageToDelete) return;
    try {
      const res = await fetch(`/api/dashboard/portfolios/${portfolioId}/messages/${messageToDelete}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Gagal menghapus pesan');
      
      toast.success('Pesan dihapus');
      setMessages(prev => prev.filter(m => m.id !== messageToDelete));
      if (selectedMessage?.id === messageToDelete) {
        setSelectedMessage(null);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const unreadCount = messages.filter(m => !m.isRead).length;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center mb-1">
            <Mail className="w-6 h-6 mr-3 text-cyan-500" />
            Kotak Masuk
          </h1>
          <p className="text-zinc-400 text-sm">
            {messages.length} pesan total &bull; <span className="text-cyan-400 font-medium">{unreadCount} belum dibaca</span>
          </p>
        </div>
        
        <div className="relative">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="appearance-none bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 pr-10 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
          >
            <option value="all">Semua Pesan</option>
            <option value="unread">Belum Dibaca</option>
            <option value="read">Sudah Dibaca</option>
          </select>
          <Filter className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row gap-6 relative">
        
        {/* Message List */}
        <div className={`flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden ${selectedMessage ? 'hidden lg:block lg:w-1/3' : 'w-full'}`}>
          {isLoading ? (
            <div className="p-8 text-center text-zinc-500 animate-pulse">Memuat pesan...</div>
          ) : messages.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={MailOpen}
                title="Tidak ada pesan masuk"
                description={filter === 'unread' ? "Bagus! Anda telah membaca semua pesan." : "Belum ada pesan yang diterima."}
              />
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/50 max-h-[70vh] overflow-y-auto">
              {messages.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => handleOpenMessage(msg)}
                  className={`w-full text-left p-4 hover:bg-zinc-800/50 transition-colors flex items-start gap-3
                    ${!msg.isRead ? 'bg-zinc-800/20' : ''} 
                    ${selectedMessage?.id === msg.id ? 'bg-zinc-800 border-l-2 border-cyan-500' : 'border-l-2 border-transparent'}
                  `}
                >
                  <div className="mt-1 flex-shrink-0">
                    {!msg.isRead ? (
                      <div className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]"></div>
                    ) : (
                      <div className="w-2.5 h-2.5 rounded-full border border-zinc-700"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className={`text-sm truncate ${!msg.isRead ? 'font-bold text-white' : 'font-medium text-zinc-300'}`}>
                        {msg.senderName}
                      </h4>
                      <span className="text-xs text-zinc-500 whitespace-nowrap ml-2">
                        {new Date(msg.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <p className={`text-xs mb-1 truncate ${!msg.isRead ? 'text-zinc-300' : 'text-zinc-500'}`}>
                      {msg.subject || 'Tanpa Subjek'}
                    </p>
                    <p className="text-xs text-zinc-500 truncate">
                      {msg.message}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Message Detail Panel */}
        {selectedMessage && (
          <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl flex flex-col max-h-[80vh] sticky top-24 lg:top-0 lg:max-h-[70vh]">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/50 rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setSelectedMessage(null)}
                  className="lg:hidden p-1.5 text-zinc-400 hover:text-white bg-zinc-800 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
                <h3 className="font-bold text-white">Detail Pesan</h3>
              </div>
              <button
                onClick={() => {
                  setMessageToDelete(selectedMessage.id);
                  setIsConfirmOpen(true);
                }}
                className="p-1.5 text-zinc-400 hover:text-red-400 bg-zinc-800 rounded-lg transition-colors flex items-center text-sm px-3"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Hapus
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">{selectedMessage.subject || 'Tanpa Subjek'}</h2>
                  <div className="flex items-center text-sm text-zinc-400">
                    <span className="font-medium text-zinc-300 mr-2">{selectedMessage.senderName}</span>
                    &lt;{selectedMessage.senderEmail}&gt;
                  </div>
                </div>
                <div className="text-xs text-zinc-500 whitespace-nowrap bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800">
                  {new Date(selectedMessage.createdAt).toLocaleString('id-ID')}
                </div>
              </div>

              <div className="w-full h-px bg-zinc-800 mb-6"></div>

              <div className="text-zinc-300 text-sm whitespace-pre-wrap leading-relaxed">
                {selectedMessage.message}
              </div>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Pesan"
        message="Apakah Anda yakin ingin menghapus pesan ini? Tindakan ini tidak dapat dibatalkan."
        type="danger"
        confirmText="Hapus"
      />
    </div>
  );
}
