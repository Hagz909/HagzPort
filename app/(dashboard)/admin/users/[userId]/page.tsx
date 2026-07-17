'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, User, Folder, LayoutGrid, GraduationCap, Mail } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { StatusBadge } from '@/components/admin/StatusBadge';
import Image from 'next/image';

export default function AdminUserDetailPage() {
  const { userId } = useParams();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUserDetail();
  }, [userId]);

  const fetchUserDetail = async () => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`);
      if (!res.ok) {
        if (res.status === 404) {
          router.push('/admin/users');
          toast.error('Pengguna tidak ditemukan');
          return;
        }
        throw new Error('Gagal memuat detail pengguna');
      }
      const data = await res.json();
      setUser(data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <div className="flex items-center space-x-4 mb-8">
        <Link 
          href="/admin/users"
          className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Detail Pengguna</h1>
          <p className="text-sm text-zinc-400">ID: <span className="font-mono text-xs">{user.id}</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-sm md:col-span-1">
          <div className="flex flex-col items-center text-center">
            {user.image ? (
              <Image 
                src={user.image} 
                alt={user.name} 
                width={120} 
                height={120} 
                className="rounded-full bg-zinc-800 object-cover mb-4 border-4 border-zinc-800 shadow-xl" 
              />
            ) : (
              <div className="w-[120px] h-[120px] rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 text-4xl font-bold border-4 border-zinc-700 shadow-xl mb-4">
                {user.name?.charAt(0) || '?'}
              </div>
            )}
            <h2 className="text-xl font-bold text-white">{user.name}</h2>
            <p className="text-zinc-400 text-sm mb-4">{user.email}</p>
            
            <div className="flex items-center space-x-2 mb-6">
              <StatusBadge type="role" value={user.role} />
              <StatusBadge type="active" value={user.isActive} />
            </div>

            <div className="w-full pt-4 border-t border-zinc-800 flex justify-between text-sm">
              <span className="text-zinc-500">Bergabung</span>
              <span className="text-white font-medium">{new Date(user.createdAt).toLocaleDateString('id-ID')}</span>
            </div>
            <div className="w-full pt-2 flex justify-between text-sm">
              <span className="text-zinc-500">Terakhir Update</span>
              <span className="text-white font-medium">{new Date(user.updatedAt).toLocaleDateString('id-ID')}</span>
            </div>
          </div>
        </div>

        {/* Portfolios Overview */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center">
              <Folder className="w-5 h-5 mr-2 text-cyan-500" />
              Daftar Portofolio ({user.portfolios?.length || 0})
            </h3>
            
            <div className="space-y-4">
              {user.portfolios?.length === 0 ? (
                <p className="text-zinc-500 text-sm italic">Pengguna ini belum membuat portofolio.</p>
              ) : (
                user.portfolios?.map((portfolio: any) => (
                  <div key={portfolio.id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-white text-lg">{portfolio.fullName || 'Tanpa Nama'}</h4>
                        <a 
                          href={`/${portfolio.username}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-cyan-500 hover:text-cyan-400 text-sm font-medium"
                        >
                          /{portfolio.username}
                        </a>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${portfolio.isPublic ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'}`}>
                        {portfolio.isPublic ? 'Publik' : 'Draft'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-zinc-800/50">
                      <div className="flex flex-col">
                        <span className="text-zinc-500 text-xs mb-1 flex items-center"><LayoutGrid className="w-3 h-3 mr-1" /> Proyek</span>
                        <span className="text-white font-semibold">{portfolio._count.projects}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-zinc-500 text-xs mb-1 flex items-center"><GraduationCap className="w-3 h-3 mr-1" /> Edukasi</span>
                        <span className="text-white font-semibold">{portfolio._count.educations}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-zinc-500 text-xs mb-1 flex items-center"><Mail className="w-3 h-3 mr-1" /> Pesan</span>
                        <span className="text-white font-semibold">{portfolio._count.contactMessages}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
