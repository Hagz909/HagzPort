'use client';

import { useState, useEffect, use } from 'react';

import { PageHeader } from '@/components/dashboard/PageHeader';
import { toast } from 'react-hot-toast';
import { Loader2, Save, ArrowRight } from 'lucide-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm as useReactHookForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';

const biodataSchema = z.object({
  fullName: z.string().min(1, 'Nama lengkap wajib diisi').max(100),
  phone: z.string().max(20).optional().or(z.literal('')),
  address: z.string().max(500).optional().or(z.literal('')),
  cvUrl: z.union([z.literal(''), z.string().url('URL tidak valid')]).optional(),
});

type BiodataFormValues = z.infer<typeof biodataSchema>;

export default function BiodataPage({ params }: { params: Promise<{ portfolioId: string }> }) {
  const { portfolioId } = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useReactHookForm<BiodataFormValues>({
    resolver: zodResolver(biodataSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      address: '',
      cvUrl: '',
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/dashboard/portfolios/${portfolioId}/biodata`);
        if (res.ok) {
          const data = await res.json();
          reset({
            fullName: data.fullName || '',
            phone: data.phone || '',
            address: data.address || '',
            cvUrl: data.cvUrl || '',
          });
        }
      } catch (error) {
        toast.error('Gagal memuat biodata');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [portfolioId, reset]);

  const onSubmit = async (data: BiodataFormValues) => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/dashboard/portfolios/${portfolioId}/biodata`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Gagal menyimpan data');
      
      toast.success('Biodata berhasil disimpan');
      reset(data); // Reset isDirty state
      router.push(`/dashboard/portfolios/${portfolioId}/about`);
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
          <div className="h-10 bg-zinc-800 rounded w-full"></div>
          <div className="h-10 bg-zinc-800 rounded w-full"></div>
          <div className="h-24 bg-zinc-800 rounded w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader 
        title="Biodata Dasar" 
        description="Informasi pribadi yang akan ditampilkan di portofolio Anda."
      />

      <div className="card p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-300">
              Nama Lengkap <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              {...register('fullName')}
              className={`input-field mt-1 ${errors.fullName ? 'border-red-500' : ''}`}
              placeholder="Cth: John Doe"
            />
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-400">{errors.fullName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300">
              Telepon
            </label>
            <input
              type="text"
              {...register('phone')}
              className={`input-field mt-1 ${errors.phone ? 'border-red-500' : ''}`}
              placeholder="Cth: +62 812..."
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-400">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300">
              Alamat
            </label>
            <textarea
              {...register('address')}
              rows={3}
              className={`input-field mt-1 ${errors.address ? 'border-red-500' : ''}`}
              placeholder="Cth: Jakarta, Indonesia"
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-400">{errors.address.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300">
              Link CV (Google Drive / PDF)
            </label>
            <input
              type="url"
              {...register('cvUrl')}
              className={`input-field mt-1 ${errors.cvUrl ? 'border-red-500' : ''}`}
              placeholder="https://..."
            />
            {errors.cvUrl && (
              <p className="mt-1 text-sm text-red-400">{errors.cvUrl.message}</p>
            )}
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
