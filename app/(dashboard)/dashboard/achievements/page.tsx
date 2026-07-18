import { getRequiredSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Trophy, Star, Target, Globe, FileText, Zap } from 'lucide-react';

export default async function GamificationPage() {
  const session = await getRequiredSession();
  const portfolio = await prisma.portfolio.findFirst({
    where: { userId: session.user.id, isDefault: true },
    include: {
      generatedCVs: true,
      workExperiences: true,
      educations: true,
      projects: true,
    }
  });

  if (!portfolio) {
    return (
      <div className="p-8 text-center text-zinc-400">
        Belum ada portofolio default. Silakan atur portofolio Anda terlebih dahulu.
      </div>
    );
  }

  // Cek kriteria badge
  const isProfileComplete = 
    !!portfolio.bio && 
    !!portfolio.tagline && 
    portfolio.skills.length >= 3 && 
    portfolio.workExperiences.length > 0;
  
  const isGlobalStar = portfolio.isGlobalPublished;
  const isCVMaster = portfolio.generatedCVs.length > 0;
  const isPopular = (portfolio.views || 0) >= 50;

  const BADGES = [
    {
      id: 'profile-100',
      title: 'Profil Sempurna',
      description: 'Melengkapi bio, tagline, minimal 3 skill, dan 1 pengalaman kerja.',
      icon: Star,
      isUnlocked: isProfileComplete,
      color: 'text-amber-400',
      bg: 'bg-amber-400/20',
      border: 'border-amber-400/30'
    },
    {
      id: 'cv-master',
      title: 'CV Master',
      description: 'Telah men-generate dokumen CV (PDF) setidaknya satu kali.',
      icon: FileText,
      isUnlocked: isCVMaster,
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/20',
      border: 'border-emerald-400/30'
    },
    {
      id: 'global-star',
      title: 'Bintang Global',
      description: 'Berhasil mem-publish portofolio ke The Grand Showcase.',
      icon: Globe,
      isUnlocked: isGlobalStar,
      color: 'text-blue-400',
      bg: 'bg-blue-400/20',
      border: 'border-blue-400/30'
    },
    {
      id: 'popular',
      title: 'Kreator Populer',
      description: 'Portofolio telah dilihat lebih dari 50 kali.',
      icon: Zap,
      isUnlocked: isPopular,
      color: 'text-rose-400',
      bg: 'bg-rose-400/20',
      border: 'border-rose-400/30'
    },
    {
      id: 'project-hunter',
      title: 'Hunter Proyek',
      description: 'Mencantumkan setidaknya 3 proyek unggulan di portofolio.',
      icon: Target,
      isUnlocked: portfolio.projects.length >= 3,
      color: 'text-purple-400',
      bg: 'bg-purple-400/20',
      border: 'border-purple-400/30'
    }
  ];

  const unlockedCount = BADGES.filter(b => b.isUnlocked).length;
  const progressPercentage = Math.round((unlockedCount / BADGES.length) * 100);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <PageHeader 
        title="Pencapaian & Badge" 
        description="Selesaikan tantangan untuk membuka lencana khusus dan tunjukkan dedikasi Anda sebagai kreator portofolio."
      />

      <div className="mb-8 p-6 card bg-gradient-to-r from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl flex flex-col md:flex-row items-center gap-6">
        <div className="w-24 h-24 bg-cyan-500/10 rounded-full flex items-center justify-center border-4 border-cyan-500/20 shrink-0 relative">
          <Trophy className="text-cyan-400" size={40} />
          <div className="absolute -bottom-2 -right-2 bg-zinc-900 border border-zinc-700 text-xs font-bold px-2 py-1 rounded text-white">
            Lv.{unlockedCount + 1}
          </div>
        </div>
        
        <div className="flex-1 w-full text-center md:text-left">
          <h2 className="text-2xl font-bold text-white mb-2">Perjalanan Kreator Anda</h2>
          <p className="text-sm text-zinc-400 mb-4">
            Anda telah membuka {unlockedCount} dari {BADGES.length} lencana yang tersedia. Terus tingkatkan portofolio Anda!
          </p>
          <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-1000"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {BADGES.map(badge => {
          const Icon = badge.icon;
          return (
            <div 
              key={badge.id}
              className={`card p-6 border rounded-2xl relative overflow-hidden transition-all duration-300 ${badge.isUnlocked ? 'bg-zinc-900 border-zinc-700' : 'bg-zinc-950 border-zinc-900/50 grayscale opacity-70'}`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${badge.isUnlocked ? `${badge.bg} ${badge.color} ${badge.border}` : 'bg-zinc-900 text-zinc-600 border-zinc-800'}`}>
                  <Icon size={28} />
                </div>
                <div>
                  <h3 className={`font-bold mb-1 ${badge.isUnlocked ? 'text-white' : 'text-zinc-500'}`}>
                    {badge.title}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {badge.description}
                  </p>
                </div>
              </div>
              
              {!badge.isUnlocked && (
                <div className="absolute top-3 right-3 text-[10px] font-bold tracking-widest text-zinc-600 uppercase">
                  LOCKED
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  );
}
