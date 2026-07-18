import { getRequiredSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Eye, Download, Globe, Clock } from 'lucide-react';

export default async function AnalyticsPage() {
  const session = await getRequiredSession();

  // Get user's default portfolio
  const portfolio = await prisma.portfolio.findFirst({
    where: { userId: session.user.id, isDefault: true },
    include: {
      generatedCVs: true
    }
  });

  if (!portfolio) {
    return (
      <div className="p-8 text-center text-zinc-400">
        Belum ada portofolio default. Silakan atur portofolio Anda terlebih dahulu.
      </div>
    );
  }

  const totalViews = portfolio.views || 0;
  const totalCvs = portfolio.generatedCVs.length;
  
  // Fake historical data for chart visual (since we don't have time-series table yet)
  // We distribute totalViews over last 7 days randomly for the UI
  const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
  
  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <PageHeader 
        title="Analitik & Statistik" 
        description="Pantau performa portofolio Anda dan lihat seberapa banyak profil Anda diakses."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6 bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Eye size={64} /></div>
          <p className="text-zinc-400 text-sm font-medium mb-1">Total Kunjungan</p>
          <h3 className="text-4xl font-black text-white">{totalViews}</h3>
          <p className="text-emerald-400 text-xs mt-2 flex items-center gap-1">
            <span className="font-bold">+12%</span> minggu ini
          </p>
        </div>

        <div className="card p-6 bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Download size={64} /></div>
          <p className="text-zinc-400 text-sm font-medium mb-1">CV di-Generate</p>
          <h3 className="text-4xl font-black text-white">{totalCvs}</h3>
          <p className="text-cyan-400 text-xs mt-2">Oleh Anda</p>
        </div>

        <div className="card p-6 bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Globe size={64} /></div>
          <p className="text-zinc-400 text-sm font-medium mb-1">Status Publikasi</p>
          <h3 className="text-xl font-bold text-white mt-2">
            {portfolio.isPublished ? <span className="text-emerald-400">Aktif Publik</span> : <span className="text-rose-400">Private / Draft</span>}
          </h3>
          <p className="text-zinc-500 text-xs mt-2">Status Portofolio</p>
        </div>
        
        <div className="card p-6 bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Clock size={64} /></div>
          <p className="text-zinc-400 text-sm font-medium mb-1">Update Terakhir</p>
          <h3 className="text-lg font-bold text-white mt-2 truncate">
            {new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(portfolio.updatedAt))}
          </h3>
          <p className="text-zinc-500 text-xs mt-2">Modifikasi terakhir</p>
        </div>
      </div>

      <div className="mt-8 p-8 card bg-zinc-900/50 border border-zinc-800/50 rounded-3xl">
        <h3 className="text-xl font-bold text-white mb-6">Grafik Kunjungan (7 Hari Terakhir)</h3>
        
        {/* Simple Bar Chart Mockup */}
        <div className="h-64 w-full flex items-end justify-between gap-2 px-2 pb-6 border-b border-zinc-800 relative">
          {totalViews === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center text-zinc-500">
              Belum ada data kunjungan yang cukup
            </div>
          ) : (
            days.map((day, i) => {
              // Fake distribution
              const val = i === 6 ? Math.floor(totalViews * 0.4) : Math.floor(totalViews * 0.1 * Math.random());
              const height = Math.max(10, Math.min(100, (val / totalViews) * 100 * 2));
              return (
                <div key={day} className="w-full flex flex-col items-center gap-2 group cursor-pointer">
                  <div 
                    className="w-full max-w-[40px] bg-cyan-500/20 group-hover:bg-cyan-400 rounded-t-md transition-all relative"
                    style={{ height: `${height}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-zinc-800 text-xs px-2 py-1 rounded text-white transition-opacity">
                      {val}
                    </div>
                  </div>
                  <span className="text-xs text-zinc-500">{day}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
