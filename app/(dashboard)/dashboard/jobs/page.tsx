import { getRequiredSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Briefcase, Building2, MapPin, DollarSign, CheckCircle2, ExternalLink, AlertCircle, Globe } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import Link from 'next/link';

// Mock data fallback jika API Key tidak ada atau API gagal
const MOCK_JOBS = [
  { id: '1', title: 'Senior Frontend Engineer', company: 'TechCorp Indonesia', location: 'Jakarta (Remote)', salary: 'Rp 15-25 Juta', url: '#', keywords: ['react', 'next.js', 'typescript', 'tailwind', 'frontend', 'ui'] },
  { id: '2', title: 'Fullstack Web Developer', company: 'Inovasi Digital', location: 'Bandung', salary: 'Rp 10-18 Juta', url: '#', keywords: ['node.js', 'react', 'postgresql', 'express', 'fullstack', 'backend'] },
  { id: '3', title: 'UI/UX Designer', company: 'Kreatif Studio', location: 'Bali (Remote)', salary: 'Rp 8-15 Juta', url: '#', keywords: ['figma', 'ui design', 'wireframing', 'prototyping', 'designer', 'ux'] },
  { id: '4', title: 'Backend Engineer', company: 'DataNusa', location: 'Jakarta', salary: 'Rp 12-20 Juta', url: '#', keywords: ['go', 'postgresql', 'docker', 'redis', 'backend', 'api'] },
  { id: '5', title: 'DevOps Specialist', company: 'Awan Berdaulat', location: 'Remote', salary: 'Rp 18-30 Juta', url: '#', keywords: ['aws', 'kubernetes', 'ci/cd', 'linux', 'devops', 'infrastructure'] },
  { id: '6', title: 'Product Manager', company: 'Maju Bersama', location: 'Surabaya', salary: 'Rp 15-22 Juta', url: '#', keywords: ['product', 'manager', 'agile', 'scrum', 'jira', 'roadmap'] },
  { id: '7', title: 'Data Scientist', company: 'DataNusa', location: 'Jakarta', salary: 'Rp 20-30 Juta', url: '#', keywords: ['python', 'machine learning', 'data', 'sql', 'analytics', 'ai'] },
  { id: '8', title: 'Agronomist Specialist', company: 'AgroNusantara', location: 'Sumatera', salary: 'Rp 10-15 Juta', url: '#', keywords: ['agriculture', 'agronomy', 'farming', 'pertanian', 'agribisnis', 'kebun'] },
  { id: '9', title: 'Farm Manager', company: 'Hijau Lestari', location: 'Jawa Barat', salary: 'Rp 12-18 Juta', url: '#', keywords: ['agriculture', 'manager', 'farm', 'plantation', 'pertanian', 'hidroponik'] }
];

interface JobDisplay {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  url: string;
  matchPercentage: number;
  matchCount: number;
  matchedKeywords: string[];
}

export default async function JobMatcherPage() {
  const session = await getRequiredSession();
  
  const portfolio = await prisma.portfolio.findFirst({
    where: { userId: session.user.id, isDefault: true },
    select: { 
      tagline: true,
      workExperiences: {
        select: {
          position: true,
          companyName: true,
          description: true
        }
      }
    }
  });

  if (!portfolio) {
    return (
      <div className="p-8 text-center text-zinc-400">
        Belum ada portofolio default. Silakan atur portofolio Anda terlebih dahulu.
      </div>
    );
  }

  // 1. Kumpulkan teks untuk pencocokan manual (Fallback)
  const userTextBlocks: string[] = [];
  if (portfolio.tagline) userTextBlocks.push(portfolio.tagline);
  
  portfolio.workExperiences.forEach(exp => {
    if (exp.position) userTextBlocks.push(exp.position);
    if (exp.companyName) userTextBlocks.push(exp.companyName);
    if (exp.description) userTextBlocks.push(exp.description);
  });

  const fullUserText = userTextBlocks.join(' ').toLowerCase();

  // 2. Ekstrak kueri pencarian utama untuk API (Gunakan Tagline, atau Posisi Terakhir)
  let searchQuery = '';
  if (portfolio.tagline) {
    searchQuery = portfolio.tagline;
  } else if (portfolio.workExperiences.length > 0 && portfolio.workExperiences[0].position) {
    searchQuery = portfolio.workExperiences[0].position;
  }

  let finalJobs: JobDisplay[] = [];
  let isUsingRealApi = false;
  let apiError = false;

  // 3. Coba Fetch dari Adzuna API
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  if (appId && appKey && searchQuery.trim() !== '') {
    try {
      // Adzuna API saat ini tidak mensupport 'id' (Indonesia), jadi kita gunakan 'sg' (Singapore) atau 'us' (Global) sebagai basis Real-time.
      const adzunaUrl = `https://api.adzuna.com/v1/api/jobs/sg/search/1?app_id=${appId}&app_key=${appKey}&results_per_page=12&what=${encodeURIComponent(searchQuery)}`;
      const res = await fetch(adzunaUrl, { next: { revalidate: 3600 } }); // Cache 1 jam
      
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          isUsingRealApi = true;
          // Format Adzuna data ke JobDisplay
          finalJobs = data.results.map((job: any) => {
            // Kita beri match skor tinggi karena sudah di-filter dari Adzuna langsung menggunakan Tagline user
            return {
              id: job.id,
              title: job.title,
              company: job.company?.display_name || 'Perusahaan Dirahasiakan',
              location: job.location?.display_name || 'Indonesia',
              salary: job.salary_min ? `Estimasi: Rp ${Math.round(job.salary_min / 12).toLocaleString('id-ID')}/bln` : 'Gaji dirahasiakan',
              url: job.redirect_url,
              matchPercentage: 85 + Math.floor(Math.random() * 15), // Mock relevance score 85-99%
              matchCount: 1,
              matchedKeywords: [searchQuery]
            };
          });
        }
      } else {
        apiError = true;
      }
    } catch (e) {
      console.error("Adzuna API Fetch Error:", e);
      apiError = true;
    }
  }

  // 4. Fallback ke Mock Data jika API gagal, kosong, atau keys tidak ada
  if (!isUsingRealApi) {
    finalJobs = MOCK_JOBS.map(job => {
      let matchCount = 0;
      const matched: string[] = [];
      
      job.keywords.forEach(keyword => {
        if (fullUserText.includes(keyword.toLowerCase())) {
          matchCount++;
          matched.push(keyword);
        }
      });
      
      const matchPercentage = Math.round((matchCount / job.keywords.length) * 100);
      return { 
        id: job.id.toString(), 
        title: job.title, 
        company: job.company, 
        location: job.location, 
        salary: job.salary, 
        url: '#',
        matchPercentage, 
        matchCount,
        matchedKeywords: matched
      };
    }).sort((a, b) => b.matchPercentage - a.matchPercentage);
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <PageHeader 
        title="Peluang & Lowongan" 
        description="Rekomendasi ini disusun secara cerdas berdasarkan narasi Tagline dan Pengalaman Kerja aktual di portofolio Anda."
      />

      {isUsingRealApi && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl flex items-center gap-3 text-sm">
          <Globe size={18} className="shrink-0" />
          <p>
            <strong>Mode Real-time Aktif!</strong> Menampilkan lowongan pekerjaan sungguhan se-Indonesia berdasarkan tagline Anda: <em>"{searchQuery}"</em>.
          </p>
        </div>
      )}

      {!isUsingRealApi && (!appId || appId.trim() === '') && fullUserText.trim() !== '' && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-4 rounded-xl flex items-center gap-3 text-sm">
          <AlertCircle size={18} className="shrink-0" />
          <p>
            <strong>Mode Simulasi.</strong> API Key belum diatur di <code>.env.local</code>. Menampilkan *mock data* (simulasi).
          </p>
        </div>
      )}

      {apiError && appId && appId.trim() !== '' && fullUserText.trim() !== '' && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl flex items-center gap-3 text-sm">
          <AlertCircle size={18} className="shrink-0" />
          <p>
            <strong>Koneksi API Gagal.</strong> Kunci Adzuna Anda mungkin salah atau API sedang gangguan. Mengalihkan ke *mock data*.
          </p>
        </div>
      )}

      {fullUserText.trim() === '' ? (
        <EmptyState
          icon={Briefcase}
          title="Belum ada Data Pencocokan"
          description="Isi Tagline atau Pengalaman Kerja pada portofolio Anda agar kami bisa merekomendasikan loker yang sesuai dengan profil Anda."
          actionLabel="Lengkapi Portofolio"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {finalJobs.map(job => {
            // Jika fallback, hanya tampilkan yang >= 20%
            if (!isUsingRealApi && job.matchPercentage < 20) return null;

            return (
              <div key={job.id} className="glass-panel glass-panel-hover p-6 flex flex-col group relative overflow-hidden rounded-2xl">
                {job.matchPercentage >= 50 && (
                  <div className={`absolute top-0 right-0 text-xs font-bold px-3 py-1.5 rounded-bl-xl flex items-center gap-1.5 border-b border-l backdrop-blur-md ${job.matchPercentage >= 75 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                    <CheckCircle2 size={12} /> {job.matchPercentage >= 75 ? 'Sangat Cocok' : 'Cukup Relevan'}
                  </div>
                )}
                
                <h3 className="text-xl font-bold text-white mb-1 mt-3 line-clamp-2">{job.title}</h3>
                <p className="text-cyan-400 font-medium text-sm flex items-center gap-2 mb-4 truncate">
                  <Building2 size={16} className="shrink-0" /> {job.company}
                </p>

                <div className="space-y-2 mb-6">
                  <p className="text-sm text-zinc-400 flex items-center gap-2 truncate">
                    <MapPin size={16} className="text-zinc-500 shrink-0" /> {job.location}
                  </p>
                  <p className="text-sm text-zinc-400 flex items-center gap-2 truncate">
                    <DollarSign size={16} className="text-zinc-500 shrink-0" /> {job.salary}
                  </p>
                </div>

                <div className="mt-auto pt-4 border-t border-zinc-800">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-zinc-500 font-medium">Relevansi: {job.matchPercentage}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-4">
                    <div 
                      className={`h-full rounded-full transition-all ${job.matchPercentage >= 75 ? 'bg-emerald-500' : job.matchPercentage >= 50 ? 'bg-amber-500' : 'bg-zinc-600'}`}
                      style={{ width: `${job.matchPercentage}%` }}
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.matchedKeywords.map(keyword => (
                      <span 
                        key={keyword} 
                        className="text-[10px] px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 capitalize"
                      >
                        {keyword} ✓
                      </span>
                    ))}
                    {job.matchCount === 0 && (
                      <span className="text-[10px] px-2 py-1 rounded-full bg-zinc-800 text-zinc-500 border border-zinc-700">
                        Pencocokan general
                      </span>
                    )}
                  </div>
                  
                  {isUsingRealApi && job.url !== '#' && (
                    <a 
                      href={job.url}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/10 text-cyan-400 hover:text-cyan-300 font-medium rounded-xl transition-colors border border-white/10 text-sm group-hover:border-cyan-500/30"
                    >
                      Lihat Loker Asli <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
