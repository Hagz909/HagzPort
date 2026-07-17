'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ArrowLeft, FileText, Image as ImageIcon, 
  User, GraduationCap, Code, Mail, Settings,
  Globe, Eye, Palette, Quote
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface PortfolioSidebarProps {
  portfolioId: string;
  portfolioName: string;
  username: string;
  isPublished: boolean;
}

export function PortfolioSidebar({ 
  portfolioId, 
  portfolioName, 
  username, 
  isPublished,
}: PortfolioSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [publishing, setPublishing] = useState(false);

  const basePath = `/dashboard/portfolios/${portfolioId}`;

  const navItems = [
    { name: 'Biodata', href: `${basePath}/biodata`, icon: FileText },
    { name: 'Hero / Profil', href: `${basePath}/hero`, icon: ImageIcon },
    { name: 'Tentang Saya', href: `${basePath}/about`, icon: User },
    { name: 'Pengalaman', href: `${basePath}/experience`, icon: FileText },
    { name: 'Pendidikan', href: `${basePath}/education`, icon: GraduationCap },
    { name: 'Keahlian', href: `${basePath}/skills`, icon: Code },
    { name: 'Proyek', href: `${basePath}/projects`, icon: Code },
    { name: 'Testimonial Klien', href: `${basePath}/testimonials`, icon: Quote },
    { name: 'Tampilan', href: `${basePath}/appearance`, icon: Palette },
    { name: 'Pratinjau (Preview)', href: `${basePath}/preview`, icon: Eye },
    { name: 'Pengaturan', href: `${basePath}/settings`, icon: Settings },
  ];

  const togglePublish = async () => {
    setPublishing(true);
    try {
      const res = await fetch(`/api/dashboard/portfolios/${portfolioId}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !isPublished }),
      });
      
      if (!res.ok) throw new Error('Gagal update status');
      
      toast.success(isPublished ? 'Portofolio diubah menjadi Draft' : 'Portofolio dipublikasikan');
      router.refresh();
    } catch (error) {
      toast.error('Terjadi kesalahan');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="md:w-72 border-b md:border-b-0 md:border-r border-zinc-800/50 bg-zinc-900/30 backdrop-blur-md flex flex-col shrink-0 md:h-full z-10 relative shadow-2xl">
      <div className="p-4 border-b border-zinc-800 hidden md:block">
        <Link 
          href="/dashboard/portfolios" 
          className="flex items-center text-sm text-zinc-400 hover:text-cyan-400 transition-colors mb-4"
        >
          <ArrowLeft size={16} className="mr-2" />
          Kembali ke Dashboard
        </Link>
        <h3 className="font-semibold text-zinc-50 flex items-center truncate" title={portfolioName}>
          <span className="mr-2 text-xl">📁</span>
          {portfolioName}
        </h3>
      </div>

      <nav className="flex overflow-x-auto md:overflow-y-auto md:flex-col p-2 md:p-4 space-x-2 md:space-x-0 md:space-y-1 no-scrollbar shrink-0">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 whitespace-nowrap md:whitespace-normal shrink-0 ${
                isActive 
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[inset_0_0_15px_rgba(6,182,212,0.15)] font-semibold scale-[1.02]' 
                  : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100 hover:scale-[1.01]'
              }`}
            >
              <div className="flex items-center">
                <Icon size={18} className="mr-2 md:mr-3" />
                <span className="text-sm font-medium">{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-zinc-800 space-y-3 hidden md:block mt-auto">
        <Link
          href={`/${username}`}
          target="_blank"
          className="btn btn-ghost w-full justify-start border border-zinc-800 bg-zinc-900 hover:bg-zinc-800"
        >
          <Eye size={16} className="mr-2 text-zinc-400" />
          Lihat Halaman Publik ↗
        </Link>
        
        <button
          onClick={togglePublish}
          disabled={publishing}
          className={`btn w-full justify-start ${
            isPublished 
              ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border-green-500/30' 
              : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border-amber-500/30'
          }`}
        >
          <Globe size={16} className="mr-2" />
          {publishing ? 'Memproses...' : (isPublished ? 'Status: Publik (ON)' : 'Status: Draft (OFF)')}
        </button>
      </div>
    </div>
  );
}
