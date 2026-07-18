'use client';

import { useState, useEffect, use } from 'react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { toast } from 'react-hot-toast';
import { Loader2, Plus, Pencil, Trash2, X, Briefcase, ArrowRight } from 'lucide-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import Link from 'next/link';

interface Experience {
  id: string;
  companyName: string;
  position: string;
  startYear: number | null;
  endYear: number | null;
  description: string | null;
}

const experienceSchema = z.object({
  companyName: z.string().min(1, 'Nama Perusahaan wajib diisi').max(100),
  position: z.string().min(1, 'Posisi/Jabatan wajib diisi').max(100),
  startYear: z.union([z.string(), z.number()]).optional().transform(v => v === '' || v === undefined ? undefined : Number(v)).pipe(z.number().min(1900).max(2100).optional()),
  endYear: z.union([z.string(), z.number()]).optional().transform(v => v === '' || v === undefined ? undefined : Number(v)).pipe(z.number().min(1900).max(2100).optional()),
  description: z.string().max(2000).optional().or(z.literal('')),
});

type ExperienceFormInput = z.input<typeof experienceSchema>;

export default function ExperiencePage({ params }: { params: Promise<{ portfolioId: string }> }) {
  const { portfolioId } = use(params);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExperienceFormInput>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      companyName: '',
      position: '',
      startYear: undefined,
      endYear: undefined,
      description: '',
    },
  });

  const fetchExperiences = async () => {
    try {
      const res = await fetch(`/api/dashboard/portfolios/${portfolioId}/experience`);
      if (res.ok) {
        const data = await res.json();
        setExperiences(data);
      }
    } catch (error) {
      toast.error('Gagal memuat data pengalaman kerja');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiences();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portfolioId]);

  const openModal = (exp?: Experience) => {
    if (exp) {
      setEditingId(exp.id);
      reset({
        companyName: exp.companyName,
        position: exp.position,
        startYear: exp.startYear || undefined,
        endYear: exp.endYear || undefined,
        description: exp.description || '',
      });
    } else {
      setEditingId(null);
      reset({
        companyName: '',
        position: '',
        startYear: undefined,
        endYear: undefined,
        description: '',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const onSubmit = async (data: any) => {
    setIsSaving(true);
    try {
      const url = editingId 
        ? `/api/dashboard/portfolios/${portfolioId}/experience/${editingId}`
        : `/api/dashboard/portfolios/${portfolioId}/experience`;
      
      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Gagal menyimpan data');
      }
      
      toast.success(editingId ? 'Data pengalaman diperbarui' : 'Data pengalaman ditambahkan');
      fetchExperiences();
      closeModal();
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || 'Terjadi kesalahan saat menyimpan');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data pengalaman kerja ini?')) return;
    
    setIsDeleting(id);
    try {
      const res = await fetch(`/api/dashboard/portfolios/${portfolioId}/experience/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Gagal menghapus data');
      
      toast.success('Data pengalaman dihapus');
      fetchExperiences();
    } catch (error) {
      toast.error('Terjadi kesalahan saat menghapus');
    } finally {
      setIsDeleting(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-zinc-900 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map(i => <div key={i} className="h-32 bg-zinc-900 rounded-lg"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader 
        title="Pengalaman Kerja" 
        description="Tambahkan riwayat pekerjaan, magang, atau karir profesional Anda."
        action={
          <button onClick={() => openModal()} className="btn btn-primary">
            <Plus size={16} className="mr-2" /> Tambah
          </button>
        }
      />

      {experiences.length === 0 ? (
        <div className="card p-12 flex flex-col items-center justify-center text-center">
          <div className="bg-zinc-800 p-4 rounded-full mb-4">
            <Briefcase className="h-8 w-8 text-zinc-400" />
          </div>
          <h3 className="text-lg font-medium text-zinc-50">Belum ada pengalaman kerja</h3>
          <p className="mt-2 text-zinc-400 max-w-sm mb-6">
            Mulai tambahkan riwayat pekerjaan Anda agar pengunjung melihat pengalaman profesional Anda.
          </p>
          <button onClick={() => openModal()} className="btn btn-primary">
            <Plus size={16} className="mr-2" /> Tambah Pengalaman Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {experiences.map((exp) => (
            <div key={exp.id} className="card p-5 flex flex-col sm:flex-row gap-4 items-start relative group">
              <div className="w-12 h-12 rounded-lg border border-zinc-700 bg-zinc-800 flex items-center justify-center shrink-0 text-zinc-500">
                <Briefcase size={20} />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-lg font-semibold text-zinc-50 truncate pr-20">{exp.companyName}</h4>
                <div className="flex flex-wrap items-center gap-2 text-sm mt-1">
                  <span className="text-cyan-400 font-medium">{exp.position}</span>
                  {(exp.startYear || exp.endYear) && <span className="text-zinc-600">•</span>}
                  <span className="text-zinc-400">
                    {exp.startYear || '?'} — {exp.endYear || 'Sekarang'}
                  </span>
                </div>
                {exp.description && (
                  <p className="text-sm text-zinc-400 mt-3 line-clamp-3">{exp.description}</p>
                )}
              </div>

              <div className="absolute top-4 right-4 flex opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity gap-2">
                <button 
                  onClick={() => openModal(exp)} 
                  className="p-2 text-zinc-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-md transition-colors"
                  title="Edit"
                >
                  <Pencil size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(exp.id)}
                  disabled={isDeleting === exp.id} 
                  className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors disabled:opacity-50"
                  title="Hapus"
                >
                  {isDeleting === exp.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Wizard Next Step Button */}
      <div className="pt-8 flex justify-end">
        <Link 
          href={`/dashboard/portfolios/${portfolioId}/education`}
          className="btn btn-primary"
        >
          Lanjutkan ke Pendidikan <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900 sticky top-0 z-10">
              <h3 className="text-lg font-semibold">{editingId ? 'Edit Pengalaman' : 'Tambah Pengalaman'}</h3>
              <button onClick={closeModal} className="text-zinc-400 hover:text-zinc-100 p-1">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="exp-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                
                <div>
                  <label className="block text-sm font-medium text-zinc-300">Nama Perusahaan <span className="text-red-400">*</span></label>
                  <input type="text" {...register('companyName')} className="input-field mt-1" placeholder="Cth: PT Teknologi Masa Depan" />
                  {errors.companyName && <p className="text-xs text-red-400 mt-1">{errors.companyName.message}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-300">Posisi / Jabatan <span className="text-red-400">*</span></label>
                  <input type="text" {...register('position')} className="input-field mt-1" placeholder="Cth: Senior Frontend Engineer" />
                  {errors.position && <p className="text-xs text-red-400 mt-1">{errors.position.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300">Tahun Mulai</label>
                    <input type="number" {...register('startYear')} className="input-field mt-1" placeholder="2020" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300">Tahun Selesai</label>
                    <input type="number" {...register('endYear')} className="input-field mt-1" placeholder="Kosongkan jika aktif" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-300">Deskripsi Pekerjaan</label>
                  <textarea {...register('description')} rows={5} className="input-field mt-1" placeholder="Membangun arsitektur microfrontend, memimpin tim frontend..." />
                </div>

              </form>
            </div>
            
            <div className="p-4 border-t border-zinc-800 bg-zinc-900 flex justify-end gap-3 sticky bottom-0">
              <button type="button" onClick={closeModal} className="btn btn-ghost" disabled={isSaving}>
                Batal
              </button>
              <button type="submit" form="exp-form" disabled={isSaving} className="btn btn-primary">
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSaving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
