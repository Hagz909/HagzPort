import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Printer, ArrowLeft } from 'lucide-react';
import Image from 'next/image';

interface Props {
  params: { id: string };
}

export default async function ResumePrintPage({ params }: Props) {
  // Tunggu params sesuai standar Next.js 15+ untuk app router async params
  const { id } = await params;

  const cv = await prisma.generatedCV.findUnique({
    where: { id },
    include: {
      portfolio: {
        include: {
          workExperiences: { orderBy: { startYear: 'desc' } },
          educations: { orderBy: { startYear: 'desc' } },
          projects: { orderBy: { order: 'asc' } },
          user: true
        }
      }
    }
  });

  if (!cv || !cv.portfolio) {
    notFound();
  }

  const port = cv.portfolio;

  return (
    <div className="min-h-screen bg-zinc-200 py-8 print:py-0 print:bg-white flex flex-col items-center font-sans">
      
      {/* Top Actions (Sembunyi saat dicetak) */}
      <div className="mb-6 print:hidden flex items-center justify-center gap-4">
        <button 
          id="back-btn"
          className="px-6 py-3 bg-zinc-800 text-white rounded-lg shadow-lg flex items-center gap-2 hover:bg-zinc-700 transition-colors font-semibold"
        >
          <ArrowLeft size={20} />
          Kembali
        </button>
        <button 
          id="print-cv-btn"
          className="px-6 py-3 bg-cyan-600 text-white rounded-lg shadow-lg flex items-center gap-2 hover:bg-cyan-500 transition-colors font-semibold"
        >
          <Printer size={20} />
          Cetak ke PDF
        </button>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.getElementById('print-cv-btn').addEventListener('click', () => { window.print(); });
              document.getElementById('back-btn').addEventListener('click', () => { 
                if (window.history.length > 1) {
                  window.history.back();
                } else {
                  window.close();
                }
              });
            `,
          }}
        />
      </div>

      {/* Area Kertas A4 */}
      <div className="w-full max-w-[210mm] min-h-[297mm] bg-white text-black p-10 md:p-14 shadow-2xl print:shadow-none print:p-0 mx-auto box-border overflow-hidden relative font-sans">
        
        {/* Header (Centered ATS Style) */}
        <div className="text-center mt-4">
          <h1 className="text-3xl font-bold uppercase tracking-tight text-zinc-900 mb-1">
            {port.fullName || port.user.name}
          </h1>
          <h2 className="text-sm font-semibold text-zinc-700 tracking-wider uppercase">
            {port.tagline || 'Professional'}
          </h2>
          
          {/* Contact Details Grid / Line */}
          <div className="mt-3 flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-xs text-zinc-600 border-b border-zinc-200 pb-4">
            {port.phone && (
              <>
                <span>{port.phone}</span>
                <span className="text-zinc-300">|</span>
              </>
            )}
            <span>{port.user.email}</span>
            {port.address && (
              <>
                <span className="text-zinc-300">|</span>
                <span>{port.address}</span>
              </>
            )}
            {port.linkedinUrl && (
              <>
                <span className="text-zinc-300">|</span>
                <a href={port.linkedinUrl} target="_blank" rel="noreferrer" className="text-cyan-800 font-medium hover:underline">
                  {port.linkedinUrl.replace('https://', '')}
                </a>
              </>
            )}
            {port.githubUrl && (
              <>
                <span className="text-zinc-300">|</span>
                <a href={port.githubUrl} target="_blank" rel="noreferrer" className="text-cyan-800 font-medium hover:underline">
                  {port.githubUrl.replace('https://', '')}
                </a>
              </>
            )}
          </div>
        </div>

        {/* Ringkasan Profesional */}
        {port.bio && (
          <section className="mt-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-300 pb-1 mb-2">
              Ringkasan Profesional
            </h3>
            <p className="text-xs text-zinc-700 leading-relaxed text-justify">
              {port.bio}
            </p>
          </section>
        )}

        {/* Keahlian (Skills) */}
        {port.skills && port.skills.length > 0 && (
          <section className="mt-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-300 pb-1 mb-2">
              Keahlian & Teknologi
            </h3>
            <p className="text-xs text-zinc-700 leading-relaxed">
              {port.skills.join(', ')}
            </p>
          </section>
        )}

        {/* Pengalaman Kerja */}
        <section className="mt-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-300 pb-1 mb-3">
            Pengalaman Kerja
          </h3>
          <div className="space-y-4">
            {(!port.workExperiences || port.workExperiences.length === 0) && (
              <p className="text-zinc-500 italic text-xs">Belum ada pengalaman kerja.</p>
            )}
            
            {port.workExperiences?.map((exp: any) => (
              <div key={exp.id} className="space-y-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-zinc-900 text-sm leading-tight">
                      {exp.position}
                    </h4>
                    <p className="text-xs font-semibold text-zinc-700">{exp.companyName}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-medium text-zinc-600">
                      {exp.startYear || '?'} - {exp.endYear || 'Sekarang'}
                    </p>
                  </div>
                </div>
                
                {exp.description && (
                  <p className="text-xs text-zinc-600 leading-relaxed text-justify whitespace-pre-wrap mt-1">
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Pengalaman Proyek */}
        <section className="mt-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-300 pb-1 mb-3">
            Pengalaman Proyek
          </h3>
          <div className="space-y-4">
            {port.projects.length === 0 && (
              <p className="text-zinc-500 italic text-xs">Belum ada data proyek.</p>
            )}
            
            {port.projects.map((proj: any) => (
              <div key={proj.id} className="space-y-1">
                <div className="flex justify-between items-baseline">
                  <h4 className="font-bold text-zinc-900 text-sm">{proj.title}</h4>
                  {proj.demoUrl && (
                    <a href={proj.demoUrl} target="_blank" rel="noreferrer" className="text-[10px] text-cyan-800 hover:underline">
                      Link Demo ({proj.demoUrl.replace('https://', '')})
                    </a>
                  )}
                </div>
                
                {proj.techStack && proj.techStack.length > 0 && (
                  <p className="text-xs font-semibold text-zinc-700 italic">
                    Teknologi: {proj.techStack.join(', ')}
                  </p>
                )}
                
                <p className="text-xs text-zinc-600 leading-relaxed text-justify">
                  {proj.description || 'Proyek dikembangkan untuk mencapai target bisnis.'}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Pendidikan */}
        <section className="mt-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-300 pb-1 mb-3">
            Pendidikan
          </h3>
          <div className="space-y-3">
            {port.educations.length === 0 && (
              <p className="text-zinc-500 italic text-xs">Belum ada data pendidikan.</p>
            )}
            
            {port.educations.map((edu: any) => (
              <div key={edu.id} className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-zinc-900 text-sm leading-tight">
                    {edu.institutionName}
                  </h4>
                  <p className="text-xs text-zinc-700">{edu.degree}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-zinc-600">
                    {edu.startYear || '?'} - {edu.endYear || 'Sekarang'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          @page { margin: 0; size: A4; }
          body { -webkit-print-color-adjust: exact; background: white; }
          .print\\:hidden { display: none !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:py-0 { padding-top: 0 !important; padding-bottom: 0 !important; }
          .print\\:bg-white { background-color: white !important; }
          .print\\:p-0 { padding: 0 !important; }
        }
        `
      }} />
    </div>
  );
}
