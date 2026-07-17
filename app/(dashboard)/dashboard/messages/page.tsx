'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Mail, Search, Filter, X, Trash2, MailOpen, AlertTriangle, Bell, Inbox, CheckCircle2, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { motion, AnimatePresence } from 'framer-motion';

function MessagesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTab = searchParams.get('tab') === 'notifications' ? 'notifications' : 'messages';
  
  const [activeTab, setActiveTab] = useState<'messages' | 'notifications'>(initialTab);
  
  const [messages, setMessages] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  
  // Confirm Dialog for delete (Messages only)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (activeTab === 'messages') {
      fetchMessages();
    } else {
      fetchNotifications();
    }
  }, [activeTab, filter]);

  const fetchMessages = async () => {
    setIsLoading(true);
    setSelectedItem(null);
    try {
      const res = await fetch(`/api/dashboard/messages?status=${filter}`);
      if (!res.ok) throw new Error('Gagal memuat pesan');
      const data = await res.json();
      setMessages(data.messages);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNotifications = async () => {
    setIsLoading(true);
    setSelectedItem(null);
    try {
      const res = await fetch(`/api/notifications`);
      if (!res.ok) throw new Error('Gagal memuat notifikasi');
      const data = await res.json();
      
      let notifs = data.notifications || [];
      if (filter === 'unread') notifs = notifs.filter((n: any) => !n.isRead);
      if (filter === 'read') notifs = notifs.filter((n: any) => n.isRead);
      
      setNotifications(notifs);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenItem = async (item: any) => {
    setSelectedItem(item);
    
    // Mark as read if unread
    if (!item.isRead) {
      try {
        if (activeTab === 'messages') {
          const res = await fetch(`/api/dashboard/messages/${item.id}/read`, { method: 'PATCH' });
          if (res.ok) {
            setMessages(prev => prev.map(m => m.id === item.id ? { ...m, isRead: true } : m));
          }
        } else {
          const res = await fetch(`/api/notifications`, { method: 'PATCH', body: JSON.stringify({ id: item.id }) });
          if (res.ok) {
            setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, isRead: true } : n));
          }
        }
      } catch (error) {
        console.error('Failed to mark as read', error);
      }
    }
  };

  const handleDeleteMessage = async () => {
    if (!itemToDelete) return;
    try {
      const res = await fetch(`/api/dashboard/messages/${itemToDelete}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus pesan');
      
      toast.success('Pesan dihapus');
      setMessages(prev => prev.filter(m => m.id !== itemToDelete));
      if (selectedItem?.id === itemToDelete) {
        setSelectedItem(null);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const markAllNotifsAsRead = async () => {
    try {
      await fetch('/api/notifications', { method: 'PATCH', body: JSON.stringify({}) });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('Semua notifikasi ditandai sudah dibaca');
    } catch (error) {
      toast.error('Gagal menandai notifikasi');
    }
  };

  const unreadMessagesCount = messages.filter(m => !m.isRead).length;
  const unreadNotifsCount = notifications.filter(n => !n.isRead).length;

  const currentList = activeTab === 'messages' ? messages : notifications;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* Header & Tabs */}
      <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/80 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col xl:flex-row xl:items-center justify-between gap-6 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none -z-10"></div>
        
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center mb-6 tracking-tight">
            <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl mr-4 shadow-inner">
              <Inbox className="w-6 h-6 text-cyan-400" />
            </div>
            Pusat Pesan
          </h1>
          
          {/* Segmented Control Switch */}
          <div className="relative flex bg-zinc-950/80 p-1.5 rounded-2xl w-fit border border-zinc-800 shadow-inner">
            <button
              onClick={() => { setActiveTab('messages'); router.replace('/dashboard/messages'); }}
              className={`relative z-10 flex items-center px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeTab === 'messages' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {activeTab === 'messages' && (
                <motion.div 
                  layoutId="activeTabIndicator" 
                  className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-500/30 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.15)] -z-10" 
                />
              )}
              <Mail className="w-4 h-4 mr-2" />
              Pesan Publik
              {unreadMessagesCount > 0 && activeTab !== 'messages' && (
                <span className="ml-2 w-2 h-2 rounded-full bg-cyan-500"></span>
              )}
            </button>
            <button
              onClick={() => { setActiveTab('notifications'); router.replace('/dashboard/messages?tab=notifications'); }}
              className={`relative z-10 flex items-center px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeTab === 'notifications' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {activeTab === 'notifications' && (
                <motion.div 
                  layoutId="activeTabIndicator" 
                  className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-500/30 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.15)] -z-10" 
                />
              )}
              <Bell className="w-4 h-4 mr-2" />
              Notifikasi Sistem
              {unreadNotifsCount > 0 && activeTab !== 'notifications' && (
                <span className="ml-2 w-2 h-2 rounded-full bg-red-500"></span>
              )}
            </button>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 items-end md:items-center">
          {activeTab === 'notifications' && unreadNotifsCount > 0 && (
            <button 
              onClick={markAllNotifsAsRead}
              className="text-sm text-cyan-400 hover:text-white font-medium px-4 py-2.5 bg-zinc-950/80 rounded-xl border border-zinc-800 hover:border-cyan-500/50 hover:bg-cyan-500/10 flex items-center transition-all shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Tandai semua dibaca
            </button>
          )}
          <div className="relative group">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="appearance-none bg-zinc-950/80 backdrop-blur-sm border border-zinc-800 group-hover:border-zinc-700 rounded-xl px-5 py-2.5 pr-12 text-sm text-white font-medium focus:outline-none focus:border-cyan-500 transition-all cursor-pointer shadow-inner"
            >
              <option value="all">Semua Status</option>
              <option value="unread">Belum Dibaca</option>
              <option value="read">Sudah Dibaca</option>
            </select>
            <Filter className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row gap-6 relative min-h-[550px]">
        
        {/* List Panel */}
        <div className={`flex-1 bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/80 rounded-3xl overflow-hidden shadow-xl ${selectedItem ? 'hidden lg:flex lg:flex-col lg:w-1/3' : 'flex flex-col w-full'}`}>
          <div className="p-4 border-b border-zinc-800/50 bg-zinc-950/40 text-xs font-bold text-zinc-500 uppercase tracking-widest flex justify-between">
            <span>Daftar {activeTab === 'messages' ? 'Pesan Masuk' : 'Notifikasi'}</span>
            <span className="text-cyan-500/70 bg-cyan-500/10 px-2 py-0.5 rounded-md">{currentList.length}</span>
          </div>
          
          {isLoading ? (
            <div className="p-8 text-center text-zinc-600 font-medium animate-pulse flex-1 flex flex-col justify-center items-center">
              <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mb-4"></div>
              Memuat data...
            </div>
          ) : currentList.length === 0 ? (
            <div className="p-8 flex-1 flex flex-col justify-center bg-zinc-950/20">
              <EmptyState
                icon={activeTab === 'messages' ? MailOpen : Bell}
                title={`Tidak ada ${activeTab === 'messages' ? 'pesan' : 'notifikasi'}`}
                description={filter === 'unread' ? "Bagus! Semua sudah dibaca." : `Belum ada ${activeTab === 'messages' ? 'pesan' : 'notifikasi'} yang diterima.`}
              />
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/50 overflow-y-auto flex-1 max-h-[70vh] scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
              {currentList.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleOpenItem(item)}
                  className={`w-full text-left p-5 hover:bg-zinc-800/50 transition-all flex items-start gap-4 group
                    ${!item.isRead ? 'bg-zinc-800/30' : ''} 
                    ${selectedItem?.id === item.id ? 'bg-zinc-800/80 border-l-[3px] border-cyan-500' : 'border-l-[3px] border-transparent'}
                  `}
                >
                  <div className="mt-1 flex-shrink-0">
                    {!item.isRead ? (
                      <div className={`w-2.5 h-2.5 rounded-full ${activeTab === 'messages' ? 'bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)]' : 'bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.8)]'}`}></div>
                    ) : (
                      <div className="w-2.5 h-2.5 rounded-full border-2 border-zinc-700 group-hover:border-zinc-500 transition-colors"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1 gap-2">
                      <h4 className={`text-sm truncate ${!item.isRead ? 'font-bold text-zinc-100' : 'font-medium text-zinc-400'}`}>
                        {activeTab === 'messages' ? item.senderName : item.title}
                      </h4>
                      <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider shrink-0">
                        {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    {activeTab === 'messages' && (
                      <p className={`text-sm mb-1.5 truncate ${!item.isRead ? 'text-zinc-200 font-medium' : 'text-zinc-500'}`}>
                        {item.subject || 'Tanpa Subjek'}
                      </p>
                    )}
                    <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>
                    {activeTab === 'messages' && item.portfolio?.username && (
                      <div className="mt-3 text-[10px] font-mono font-medium text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded-md border border-cyan-500/20 inline-flex items-center">
                        🔗 /{item.portfolio.username}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detail Panel */}
        <div className={`flex-1 bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/80 rounded-3xl shadow-2xl flex-col sticky top-24 lg:top-0 lg:max-h-[75vh] overflow-hidden ${selectedItem ? 'flex' : 'hidden lg:flex'}`}>
          {!selectedItem ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-500 relative">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-zinc-950/20 pointer-events-none"></div>
              <div className="w-24 h-24 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center mb-6 shadow-inner">
                {activeTab === 'messages' ? <Mail className="w-10 h-10 text-zinc-700" /> : <Bell className="w-10 h-10 text-zinc-700" />}
              </div>
              <p className="text-lg font-medium text-zinc-400">Pilih {activeTab === 'messages' ? 'pesan' : 'notifikasi'} untuk membaca</p>
              <p className="text-sm mt-2 text-zinc-600">Detail akan ditampilkan di sini.</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div 
                key={selectedItem.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex flex-col h-full"
              >
                {/* Header Action Bar */}
                <div className="p-4 border-b border-zinc-800/50 bg-zinc-950/60 flex justify-between items-center z-10 backdrop-blur-md">
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={() => setSelectedItem(null)}
                      className="lg:hidden p-2 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl transition-colors border border-zinc-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
                      Detail {activeTab === 'messages' ? 'Pesan' : 'Notifikasi'}
                    </span>
                  </div>
                  
                  {activeTab === 'messages' && (
                    <button
                      onClick={() => {
                        setItemToDelete(selectedItem.id);
                        setIsConfirmOpen(true);
                      }}
                      className="p-2 text-zinc-400 hover:text-red-400 bg-zinc-900 hover:bg-red-500/10 rounded-xl transition-colors flex items-center text-sm px-4 border border-zinc-800 hover:border-red-500/30 font-medium"
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Hapus
                    </button>
                  )}
                </div>
                
                <div className="p-6 md:p-8 overflow-y-auto flex-1 bg-gradient-to-b from-transparent to-zinc-950/30">
                  {activeTab === 'messages' ? (
                    <>
                      {/* Sender Info Card */}
                      <div className="flex items-start gap-4 mb-8">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 p-[2px] shrink-0 shadow-lg shadow-cyan-900/20">
                          <div className="w-full h-full bg-zinc-950 rounded-full flex items-center justify-center">
                            <span className="font-bold text-lg text-cyan-400 uppercase">
                              {selectedItem.senderName.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h2 className="text-2xl font-bold text-white mb-1 leading-tight truncate">
                            {selectedItem.subject || 'Tanpa Subjek'}
                          </h2>
                          <div className="flex flex-col sm:flex-row sm:items-center text-sm text-zinc-400 gap-1 sm:gap-2">
                            <span className="font-semibold text-zinc-200">{selectedItem.senderName}</span>
                            <span className="hidden sm:inline text-zinc-600">&bull;</span>
                            <a href={`mailto:${selectedItem.senderEmail}`} className="text-cyan-400 hover:text-cyan-300 transition-colors">
                              {selectedItem.senderEmail}
                            </a>
                          </div>
                        </div>
                        <div className="hidden md:block text-xs font-medium text-zinc-500 bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800 shrink-0">
                          {new Date(selectedItem.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                        </div>
                      </div>
                      
                      <div className="md:hidden text-xs font-medium text-zinc-500 bg-zinc-950 px-3 py-2 rounded-lg border border-zinc-800 mb-6 w-fit">
                        {new Date(selectedItem.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                      </div>
                      
                      {selectedItem.portfolio?.displayName && (
                        <div className="mb-8 bg-gradient-to-r from-cyan-500/10 to-transparent border-l-4 border-cyan-500 p-4 rounded-r-xl">
                          <p className="text-sm text-zinc-300">
                            Pesan ini dikirim oleh pengunjung melalui portofolio: <br/>
                            <strong className="text-cyan-400 text-base mt-1 inline-block">{selectedItem.portfolio.displayName}</strong>
                          </p>
                        </div>
                      )}

                      {/* Message Content */}
                      <div className="relative">
                        <div className="absolute top-0 left-6 w-px h-full bg-zinc-800 -z-10"></div>
                        <div className="bg-zinc-950/80 backdrop-blur-sm p-6 md:p-8 rounded-2xl border border-zinc-800/80 shadow-2xl">
                          <div className="text-zinc-200 text-sm md:text-base whitespace-pre-wrap leading-loose font-medium">
                            {selectedItem.message}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                            <Bell className="w-5 h-5 text-zinc-400" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded text-[10px] font-bold uppercase tracking-widest border border-zinc-700">
                                {selectedItem.type || 'Sistem'}
                              </span>
                            </div>
                            <h2 className="text-2xl font-bold text-white leading-tight">{selectedItem.title}</h2>
                          </div>
                        </div>
                        <div className="text-xs font-medium text-zinc-500 bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800 shrink-0 mt-2 md:mt-0">
                          {new Date(selectedItem.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                        </div>
                      </div>

                      <div className="bg-zinc-950/80 backdrop-blur-sm p-6 md:p-8 rounded-2xl border border-zinc-800/80 shadow-2xl">
                        <div className="text-zinc-300 text-sm md:text-base whitespace-pre-wrap leading-loose">
                          {selectedItem.message}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDeleteMessage}
        title="Hapus Pesan"
        message="Apakah Anda yakin ingin menghapus pesan ini? Tindakan ini tidak dapat dibatalkan."
        type="danger"
        confirmText="Hapus"
      />
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex flex-col justify-center items-center h-[60vh]">
        <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mb-4"></div>
        <p className="text-zinc-500 font-medium">Memuat Pusat Pesan...</p>
      </div>
    }>
      <MessagesContent />
    </Suspense>
  );
}
