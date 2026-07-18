'use client';

import { useState, useEffect, use } from 'react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { toast } from 'react-hot-toast';
import { Loader2, Save, ArrowRight } from 'lucide-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';

const heroSchema = z.object({
  tagline: z.string().max(100).optional().or(z.literal('')),
  quote: z.string().max(200).optional().or(z.literal('')),
  profileImageUrl: z.string().optional().or(z.literal('')),
  profileImagePublicId: z.string().optional().or(z.literal('')),
});

type HeroFormValues = z.infer<typeof heroSchema>;

export default function HeroPage({ params }: { params: Promise<{ portfolioId: string }> }) {
  const { portfolioId } = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<HeroFormValues>({
    resolver: zodResolver(heroSchema),
    defaultValues: {
      tagline: '',
      quote: '',
      profileImageUrl: '',
      profileImagePublicId: '',
    },
  });

  const taglineValue = watch('tagline') || '';
  const quoteValue = watch('quote') || '';
  const profileImageUrl = watch('profileImageUrl');
  const profileImagePublicId = watch('profileImagePublicId');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/dashboard/portfolios/${portfolioId}/hero`);
        if (res.ok) {
          const data = await res.json();
          reset({
            tagline: data.tagline || '',
            quote: data.quote || '',
            profileImageUrl: data.profileImageUrl || '',
            profileImagePublicId: data.profileImagePublicId || '',
          });
        }
      } catch (error) {
        toast.error('Gagal memuat profil pahlawan');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [portfolioId, reset]);

  const onSubmit = async (data: HeroFormValues) => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/dashboard/portfolios/${portfolioId}/hero`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Gagal menyimpan data');
      
      toast.success('Profil utama berhasil disimpan');
      reset(data); // Reset isDirty state
      router.push(`/dashboard/portfolios/${portfolioId}/biodata`);
    } catch (error) {
      toast.error('Terjadi kesalahan saat menyimpan');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = ({ url, publicId }: { url: string; publicId: string }) => {
    setValue('profileImageUrl', url, { shouldDirty: true });
    setValue('profileImagePublicId', publicId, { shouldDirty: true });
  };

  const handleImageDelete = () => {
    setValue('profileImageUrl', '', { shouldDirty: true });
    setValue('profileImagePublicId', '', { shouldDirty: true });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-zinc-900 rounded-lg"></div>
        <div className="card p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="aspect-square bg-zinc-800 rounded-lg w-full max-w-[250px] mx-auto"></div>
          </div>
          <div className="md:col-span-2 space-y-4">
            <div className="h-10 bg-zinc-800 rounded w-full"></div>
            <div className="h-24 bg-zinc-800 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader 
        title="Hero / Profil Utama" 
        description="Sesuaikan tampilan bagian atas (hero) dari portofolio Anda."
      />

      <div className="card p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="md:col-span-1 flex flex-col items-center">
            <div className="w-full max-w-[250px]">
              <ImageUploader
                label="Foto Profil"
                folder="profiles"
                aspectRatio="1:1"
                currentImageUrl={profileImageUrl}
                currentPublicId={profileImagePublicId}
                onUploadComplete={handleImageUpload}
                onDeleteComplete={handleImageDelete}
              />
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300">
                Tagline (Headline)
              </label>
              <input
                type="text"
                {...register('tagline')}
                className={`input-field mt-1 ${errors.tagline ? 'border-red-500' : ''}`}
                placeholder="Cth: Full-Stack Developer & Tech Enthusiast"
              />
              <div className="mt-1 flex justify-between">
                {errors.tagline ? (
                  <p className="text-sm text-red-400">{errors.tagline.message}</p>
                ) : (
                  <p className="text-sm text-zinc-500">Tampil besar di bawah nama Anda.</p>
                )}
                <span className={`text-xs ${taglineValue.length > 100 ? 'text-red-400' : 'text-zinc-500'}`}>
                  {taglineValue.length}/100
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300">
                Quote Singkat
              </label>
              <textarea
                {...register('quote')}
                rows={3}
                className={`input-field mt-1 ${errors.quote ? 'border-red-500' : ''}`}
                placeholder="Cth: Membangun solusi digital dengan kode yang bersih dan terukur."
              />
              <div className="mt-1 flex justify-between">
                {errors.quote ? (
                  <p className="text-sm text-red-400">{errors.quote.message}</p>
                ) : (
                  <p className="text-sm text-zinc-500">Penjelasan singkat tentang Anda.</p>
                )}
                <span className={`text-xs ${quoteValue.length > 200 ? 'text-red-400' : 'text-zinc-500'}`}>
                  {quoteValue.length}/200
                </span>
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
          </div>
        </form>
      </div>
    </div>
  );
}
