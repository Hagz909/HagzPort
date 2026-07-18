'use client';

import { useState, useEffect, use } from 'react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { toast } from 'react-hot-toast';
import { Loader2, Save, ArrowRight } from 'lucide-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';

const aboutSchema = z.object({
  bio: z.string().max(1000).optional().or(z.literal('')),
  linkedinUrl: z.union([z.literal(''), z.string().url('URL tidak valid')]).optional(),
  githubUrl: z.union([z.literal(''), z.string().url('URL tidak valid')]).optional(),
});

type AboutFormValues = z.infer<typeof aboutSchema>;

export default function AboutPage({ params }: { params: Promise<{ portfolioId: string }> }) {
  const { portfolioId } = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<AboutFormValues>({
    resolver: zodResolver(aboutSchema),
    defaultValues: {
      bio: '',
      linkedinUrl: '',
      githubUrl: '',
    },
  });

  const bioValue = watch('bio') || '';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/dashboard/portfolios/${portfolioId}/about`);
        if (res.ok) {
          const data = await res.json();
          reset({
            bio: data.bio || '',
            linkedinUrl: data.linkedinUrl || '',
            githubUrl: data.githubUrl || '',
          });
        }
      } catch (error) {
        toast.error('Gagal memuat halaman tentang');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [portfolioId, reset]);

  const onSubmit = async (data: AboutFormValues) => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/dashboard/portfolios/${portfolioId}/about`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Gagal menyimpan data');
      
      toast.success('Tentang Saya berhasil disimpan');
      reset(data); // Reset isDirty state
      router.push(`/dashboard/portfolios/${portfolioId}/experience`);
    } catch (error) {
      toast.error('Terjadi kesalahan saat menyimpan');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-zinc-900 rounded-lg"></div>
        <div className="card p-6 space-y-4">
          <div className="h-32 bg-zinc-800 rounded w-full"></div>
          <div className="h-10 bg-zinc-800 rounded w-full"></div>
          <div className="h-10 bg-zinc-800 rounded w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader 
        title="Tentang Saya" 
        description="Ceritakan lebih detail tentang perjalanan karir dan keahlian Anda."
      />

      <div className="card p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-zinc-300">
              Biografi Lengkap
            </label>
            <textarea
              {...register('bio')}
              rows={8}
              className={`input-field mt-1 ${errors.bio ? 'border-red-500' : ''}`}
              placeholder="Saya adalah seorang..."
            />
            <div className="mt-1 flex justify-between">
              {errors.bio ? (
                <p className="text-sm text-red-400">{errors.bio.message}</p>
              ) : (
                <p className="text-sm text-zinc-500">Mendukung format paragraf.</p>
              )}
              <span className={`text-xs ${bioValue.length > 1000 ? 'text-red-400' : 'text-zinc-500'}`}>
                {bioValue.length}/1000
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300">
                Profil LinkedIn
              </label>
              <input
                type="url"
                {...register('linkedinUrl')}
                className={`input-field mt-1 ${errors.linkedinUrl ? 'border-red-500' : ''}`}
                placeholder="https://linkedin.com/in/..."
              />
              {errors.linkedinUrl && (
                <p className="mt-1 text-sm text-red-400">{errors.linkedinUrl.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300">
                Profil GitHub
              </label>
              <input
                type="url"
                {...register('githubUrl')}
                className={`input-field mt-1 ${errors.githubUrl ? 'border-red-500' : ''}`}
                placeholder="https://github.com/..."
              />
              {errors.githubUrl && (
                <p className="mt-1 text-sm text-red-400">{errors.githubUrl.message}</p>
              )}
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="btn btn-primary"
            >
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isSaving ? 'Menyimpan...' : 'Simpan & Lanjutkan'}
              {!isSaving && <ArrowRight className="ml-2 h-4 w-4" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
