'use client';

import { useState, useEffect } from 'react';
import { Activity, LogIn, LogOut, Edit3, Trash2, Filter, Plus, Globe, MessageSquare, FileText, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface NotificationItem {
  id: string;
  title: string | null;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Baru saja';
  if (diffMins < 60) return `${diffMins} menit yang lalu`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} jam yang lalu`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} hari yang lalu`;
}

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchActivities = async () => {
    try {
      const res = await fetch('/api/admin/activities');
      if (res.ok) {
        const data = await res.json();
        const rawNotifs: NotificationItem[] = data.activities || [];
        
        // Map notifications to the activity timeline format
        const mapped = rawNotifs.map((notif) => {
          let icon = Activity;
          let color = 'text-cyan-500';
          let bg = 'bg-cyan-500/10 border-cyan-500/20';
          let type = 'update'; // general category for filter

          const title = notif.title || '';
          const message = notif.message || '';

          if (title.includes('Pembuatan') || title.includes('Ditambahkan')) {
            icon = Plus;
            color = 'text-emerald-500';
            bg = 'bg-emerald-500/10 border-emerald-500/20';
            type = 'create';
          } else if (title.includes('Penghapusan') || title.includes('Dihapus')) {
            icon = Trash2;
            color = 'text-red-500';
            bg = 'bg-red-500/10 border-red-500/20';
            type = 'delete';
          } else if (title.includes('Publik') || title.includes('Live')) {
            icon = Globe;
            color = 'text-cyan-500';
            bg = 'bg-cyan-500/10 border-cyan-500/20';
            type = 'update';
          } else if (notif.type === 'message') {
            icon = MessageSquare;
            color = 'text-blue-500';
            bg = 'bg-blue-500/10 border-blue-500/20';
            type = 'update';
          } else if (notif.type === 'cv') {
            icon = FileText;
            color = 'text-amber-500';
            bg = 'bg-amber-500/10 border-amber-500/20';
            type = 'update';
          }

          // Try to extract user name
          let userName = 'Sistem';
          if (message.startsWith('Pengguna ')) {
            const temp = message.replace('Pengguna ', '');
            const firstSpace = temp.indexOf(' ');
            userName = firstSpace !== -1 ? temp.substring(0, firstSpace) : temp;
          } else if (message.startsWith('User ')) {
            const temp = message.replace('User ', '');
            const firstSpace = temp.indexOf(' ');
            userName = firstSpace !== -1 ? temp.substring(0, firstSpace) : temp;
          }

          return {
            id: notif.id,
            type,
            user: userName,
            title: notif.title || 'Aktivitas Sistem',
            action: notif.message,
            time: formatRelativeTime(notif.createdAt),
            icon,
            color,
            bg
          };
        });

        setActivities(mapped);
      } else {
        toast.error('Gagal mengambil log aktivitas');
      }
    } catch (err) {
      toast.error('Terjadi kesalahan memuat data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(a => a.type === filter);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
              <Activity className="w-6 h-6 text-cyan-400" />
            </div>
            <h1 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-sky-600 drop-shadow-md animate-pulse">Aktivitas Realtime</h1>
          </div>
          <p className="text-sm text-zinc-400">Pantau seluruh riwayat log aktivitas yang terjadi di HAGZPORT secara real-time.</p>
        </div>
      </div>

      {/* Filter Options */}
      <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-4 shadow-lg flex items-center gap-4">
        <Filter className="w-5 h-5 text-zinc-500 ml-2 shrink-0" />
        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 w-full" style={{ scrollbarWidth: 'none' }}>
          {[
            { value: 'all', label: 'Semua Aktivitas' },
            { value: 'create', label: 'Penambahan' },
            { value: 'update', label: 'Pembaruan' },
            { value: 'delete', label: 'Penghapusan' }
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                filter === f.value 
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]' 
                  : 'bg-zinc-800/50 text-zinc-400 border border-transparent hover:bg-zinc-800 hover:text-zinc-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Feed */}
      <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/5 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 pl-2 md:pl-6">
          {/* Vertical line */}
          <div className="absolute left-[27px] md:left-[43px] top-6 bottom-6 w-px bg-gradient-to-b from-cyan-500/50 via-zinc-800 to-transparent"></div>
          
          <div className="space-y-8">
            {filteredActivities.length === 0 ? (
              <div className="text-center text-zinc-500 py-10 pl-8">
                <p>Tidak ada aktivitas yang ditemukan untuk filter ini.</p>
              </div>
            ) : (
              filteredActivities.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="relative flex items-start gap-4 md:gap-6 group animate-in fade-in duration-300">
                    {/* Center Dot */}
                    <div className={`relative z-10 flex items-center justify-center shrink-0 w-10 h-10 rounded-full border shadow ${activity.bg} group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-5 h-5 ${activity.color}`} />
                    </div>
                    
                    {/* Card */}
                    <div className="flex-1 p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/50 backdrop-blur-sm shadow-sm group-hover:border-zinc-700/80 group-hover:shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-zinc-100">{activity.user}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                            {activity.title}
                          </span>
                        </div>
                        <span className="text-xs text-zinc-500 font-medium bg-zinc-900 px-2 py-1 rounded-md border border-zinc-800">{activity.time}</span>
                      </div>
                      <p className="text-sm text-zinc-300 leading-relaxed">
                        {activity.action}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
