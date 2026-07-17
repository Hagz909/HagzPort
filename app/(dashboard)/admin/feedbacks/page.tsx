'use client';

import { useState, useEffect } from 'react';
import { Star, MessageSquare, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminFeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const res = await fetch('/api/admin/feedbacks');
      if (!res.ok) throw new Error('Gagal memuat ulasan pengguna');
      const data = await res.json();
      setFeedbacks(data.feedbacks || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  // Calculate average rating
  const avgRating = feedbacks.length > 0 
    ? (feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / feedbacks.length).toFixed(1)
    : 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-2 flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
            </div>
            Feedback & Rating User
          </h1>
          <p className="text-sm text-zinc-400">Pusat ulasan jujur dari pengguna setelah mereka berhasil menggunakan fitur Generate CV.</p>
        </div>

        {/* Dashboard Stats */}
        <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-2xl px-6 py-4 flex gap-8">
          <div>
            <div className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-1">Total Ulasan</div>
            <div className="text-2xl font-black text-white">{feedbacks.length}</div>
          </div>
          <div>
            <div className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-1">Rata-Rata Rating</div>
            <div className="text-2xl font-black text-amber-400 flex items-center gap-2">
              {avgRating} <Star className="w-4 h-4 fill-amber-400" />
            </div>
          </div>
        </div>
      </div>

      {feedbacks.length === 0 ? (
        <div className="py-20 text-center bg-zinc-900/30 border border-zinc-800/50 rounded-2xl">
          <MessageSquare className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-zinc-400 mb-2">Belum ada ulasan yang masuk</h2>
          <p className="text-sm text-zinc-500 max-w-md mx-auto">Sistem akan menangkap ulasan baru ketika ada pengguna yang menyelesaikan pembuatan CV mereka.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {feedbacks.map((fb) => (
            <div key={fb.id} className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-2xl p-6 transition-colors hover:border-zinc-700 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[50px] rounded-full pointer-events-none group-hover:bg-amber-500/10 transition-colors" />
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex gap-3 items-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    {getInitials(fb.user.name)}
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">{fb.user.name}</div>
                    <div className="text-xs text-zinc-400">{fb.user.email}</div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-3.5 h-3.5 ${i < fb.rating ? 'fill-amber-400 text-amber-400' : 'fill-transparent text-zinc-700'}`} 
                      />
                    ))}
                  </div>
                  <div className="text-[10px] text-zinc-500 font-medium">
                    {new Date(fb.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              </div>

              <div className="relative z-10 p-4 bg-zinc-950/50 rounded-xl border border-zinc-800/80 min-h-[80px]">
                {fb.comment ? (
                  <p className="text-sm text-zinc-300 italic">"{fb.comment}"</p>
                ) : (
                  <p className="text-sm text-zinc-600 italic">Pengguna ini hanya memberikan rating tanpa komentar.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
