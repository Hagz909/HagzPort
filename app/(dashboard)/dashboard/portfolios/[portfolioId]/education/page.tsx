'use client';

import { useState, useEffect, use } from 'react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { toast } from 'react-hot-toast';
import { Loader2, Plus, Pencil, Trash2, X, GraduationCap, ArrowRight } from 'lucide-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import Link from 'next/link';

interface Education {
  id: string;
  institutionName: string;
  degree: string | null;
  nim: string | null;
  currentSemester: number | null;
  startYear: number | null;
  endYear: number | null;
  logoUrl: string | null;
  logoPublicId: string | null;
  description: string | null;
}

const educationSchema = z.object({
  institutionName: z.string().min(1, 'Nama Institusi wajib diisi').max(100),
  degree: z.string().max(100).optional().or(z.literal('')),
  nim: z.string().max(50).optional().or(z.literal('')),
  currentSemester: z.union([z.string(), z.number()]).optional().transform(v => v === '' || v === undefined ? undefined : Number(v)).pipe(z.number().min(1).max(14).optional()),
  startYear: z.union([z.string(), z.number()]).optional().transform(v => v === '' || v === undefined ? undefined : Number(v)).pipe(z.number().min(1900).max(2100).optional()),
  endYear: z.union([z.string(), z.number()]).optional().transform(v => v === '' || v === undefined ? undefined : Number(v)).pipe(z.number().min(1900).max(2100).optional()),
  logoUrl: z.string().optional().or(z.literal('')),
  logoPublicId: z.string().optional().or(z.literal('')),
  description: z.string().max(1000).optional().or(z.literal('')),
});

type EducationFormInput = z.input<typeof educationSchema>;
type EducationFormValues = z.output<typeof educationSchema>;

export default function EducationPage({ params }: { params: Promise<{ portfolioId: string }> }) {
  const { portfolioId } = use(params);
  const [educations, setEducations] = useState<Education[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<EducationFormInput>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      institutionName: '',
      degree: '',
      nim: '',
      currentSemester: undefined,
      startYear: undefined,
      endYear: undefined,
      logoUrl: '',
      logoPublicId: '',
      description: '',
    },
  });

  const logoUrl = watch('logoUrl');
  const logoPublicId = watch('logoPublicId');

  const fetchEducations = async () => {
    try {
      const res = await fetch(`/api/dashboard/portfolios/${portfolioId}/education`);
      if (res.ok) {
        const data = await res.json();
        setEducations(data);
      }
    } catch (error) {
      toast.error('Gagal memuat data pendidikan');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEducations();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portfolioId]);

  const openModal = (edu?: Education) => {
    if (edu) {
      setEditingId(edu.id);
      reset({
        institutionName: edu.institutionName,
        degree: edu.degree || '',
        nim: edu.nim || '',
        currentSemester: edu.currentSemester || undefined,
        startYear: edu.startYear || undefined,
        endYear: edu.endYear || undefined,
        logoUrl: edu.logoUrl || '',
        logoPublicId: edu.logoPublicId || '',
        description: edu.description || '',
      });
    } else {
      setEditingId(null);
      reset({
        institutionName: '',
        degree: '',
        nim: '',
        currentSemester: undefined,
        startYear: undefined,
        endYear: undefined,
        logoUrl: '',
        logoPublicId: '',
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
        ? `/api/dashboard/portfolios/${portfolioId}/education/${editingId}`
        : `/api/dashboard/portfolios/${portfolioId}/education`;
      
      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Gagal menyimpan data');
      
      toast.success(editingId ? 'Data pendidikan diperbarui' : 'Data pendidikan ditambahkan');
      fetchEducations();
      closeModal();
    } catch (error) {
      toast.error('Terjadi kesalahan saat menyimpan');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, publicId: string | null) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data pendidikan ini?')) return;
    
    setIsDeleting(id);
    try {
      // 1. Hapus gambar di Cloudinary jika ada
      if (publicId) {
        await fetch('/api/upload/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ publicId }),
        });
      }

      // 2. Hapus data di DB
      const res = await fetch(`/api/dashboard/portfolios/${portfolioId}/education/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Gagal menghapus data');
      
      toast.success('Data pendidikan dihapus');
      fetchEducations();
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
        title="Riwayat Pendidikan" 
        description="Tambahkan sekolah, universitas, atau bootcamp yang pernah Anda ikuti."
        action={
          <button onClick={() => openModal()} className="btn btn-primary">
            <Plus size={16} className="mr-2" /> Tambah
          </button>
        }
      />

      {educations.length === 0 ? (
        <div className="card p-12 flex flex-col items-center justify-center text-center">
          <div className="bg-zinc-800 p-4 rounded-full mb-4">
            <GraduationCap className="h-8 w-8 text-zinc-400" />
          </div>
          <h3 className="text-lg font-medium text-zinc-50">Belum ada riwayat pendidikan</h3>
          <p className="mt-2 text-zinc-400 max-w-sm mb-6">
            Mulai tambahkan riwayat pendidikan Anda agar pengunjung tahu latar belakang akademis Anda.
          </p>
          <button onClick={() => openModal()} className="btn btn-primary">
            <Plus size={16} className="mr-2" /> Tambah Pendidikan Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {educations.map((edu) => (
            <div key={edu.id} className="card p-5 flex flex-col sm:flex-row gap-4 items-start relative group">
              {edu.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={edu.logoUrl} alt={edu.institutionName} className="w-16 h-16 rounded-lg object-cover border border-zinc-700 bg-zinc-800 shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded-lg border border-zinc-700 bg-zinc-800 flex items-center justify-center shrink-0 text-zinc-500">
                  <GraduationCap size={24} />
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <h4 className="text-lg font-semibold text-zinc-50 truncate pr-20">{edu.institutionName}</h4>
                <div className="flex flex-wrap items-center gap-2 text-sm mt-1">
                  {edu.degree && <span className="text-cyan-400 font-medium">{edu.degree}</span>}
                  {edu.degree && (edu.startYear || edu.endYear) && <span className="text-zinc-600">•</span>}
                  <span className="text-zinc-400">
                    {edu.startYear || '?'} — {edu.endYear || 'Sekarang'}
                  </span>
                </div>
                {edu.nim && (
                  <p className="text-xs text-zinc-500 mt-1">NIM: {edu.nim}</p>
                )}
                {edu.description && (
                  <p className="text-sm text-zinc-400 mt-3 line-clamp-2">{edu.description}</p>
                )}
              </div>

              <div className="absolute top-4 right-4 flex opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity gap-2">
                <button 
                  onClick={() => openModal(edu)} 
                  className="p-2 text-zinc-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-md transition-colors"
                  title="Edit"
                >
                  <Pencil size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(edu.id, edu.logoPublicId)}
                  disabled={isDeleting === edu.id} 
                  className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors disabled:opacity-50"
                  title="Hapus"
                >
                  {isDeleting === edu.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Wizard Next Step Button */}
      <div className="pt-8 flex justify-end">
        <Link 
          href={`/dashboard/portfolios/${portfolioId}/skills`}
          className="btn btn-primary"
        >
          Lanjutkan ke Keahlian <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900 sticky top-0 z-10">
              <h3 className="text-lg font-semibold">{editingId ? 'Edit Pendidikan' : 'Tambah Pendidikan'}</h3>
              <button onClick={closeModal} className="text-zinc-400 hover:text-zinc-100 p-1">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="edu-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="w-full sm:w-1/3">
                    <ImageUploader
                      label="Logo Institusi"
                      folder="logos"
                      aspectRatio="1:1"
                      currentImageUrl={logoUrl}
                      currentPublicId={logoPublicId}
                      onUploadComplete={({url, publicId}) => {
                        setValue('logoUrl', url);
                        setValue('logoPublicId', publicId);
                      }}
                      onDeleteComplete={() => {
                        setValue('logoUrl', '');
                        setValue('logoPublicId', '');
                      }}
                    />
                  </div>
                  
                  <div className="w-full sm:w-2/3 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-300">Nama Institusi <span className="text-red-400">*</span></label>
                      <input type="text" {...register('institutionName')} className="input-field mt-1" placeholder="Cth: Universitas Indonesia" />
                      {errors.institutionName && <p className="text-xs text-red-400 mt-1">{errors.institutionName.message}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-zinc-300">Gelar / Jurusan</label>
                      <input type="text" {...register('degree')} className="input-field mt-1" placeholder="Cth: S1 Teknik Informatika" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-300">Tahun Mulai</label>
                        <input type="number" {...register('startYear')} className="input-field mt-1" placeholder="2018" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-300">Tahun Selesai (Kosongkan jika masih)</label>
                        <input type="number" {...register('endYear')} className="input-field mt-1" placeholder="2022" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-300">NIM / NISN</label>
                        <input type="text" {...register('nim')} className="input-field mt-1" placeholder="Cth: 180123456" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-300">Semester Saat Ini</label>
                        <input type="number" {...register('currentSemester')} className="input-field mt-1" placeholder="Cth: 6" />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300">Deskripsi / Pencapaian</label>
                  <textarea {...register('description')} rows={4} className="input-field mt-1" placeholder="Kegiatan, organisasi, penghargaan..." />
                </div>

              </form>
            </div>
            
            <div className="p-4 border-t border-zinc-800 bg-zinc-900 flex justify-end gap-3 sticky bottom-0">
              <button type="button" onClick={closeModal} className="btn btn-ghost" disabled={isSaving}>
                Batal
              </button>
              <button type="submit" form="edu-form" disabled={isSaving} className="btn btn-primary">
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
