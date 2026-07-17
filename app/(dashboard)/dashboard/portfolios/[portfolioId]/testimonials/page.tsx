'use client';

import { useState, useEffect, use } from 'react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { toast } from 'react-hot-toast';
import { Loader2, Plus, Pencil, Trash2, X, Quote } from 'lucide-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

interface Testimonial {
  id: string;
  clientName: string;
  clientRole: string | null;
  quote: string;
}

const testimonialSchema = z.object({
  clientName: z.string().min(1, 'Nama klien wajib diisi').max(100, 'Nama klien terlalu panjang'),
  clientRole: z.string().max(100, 'Peran/Jabatan klien terlalu panjang').optional().or(z.literal('')),
  quote: z.string().min(5, 'Kutipan testimonial minimal 5 karakter').max(500, 'Kutipan testimonial terlalu panjang'),
});

type TestimonialFormInput = z.infer<typeof testimonialSchema>;

export default function TestimonialsPage({ params }: { params: Promise<{ portfolioId: string }> }) {
  const { portfolioId } = use(params);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
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
  } = useForm<TestimonialFormInput>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      clientName: '',
      clientRole: '',
      quote: '',
    },
  });

  const fetchTestimonials = async () => {
    try {
      const res = await fetch(`/api/dashboard/portfolios/${portfolioId}/testimonials`);
      if (res.ok) {
        const data = await res.json();
        setTestimonials(data.testimonials || []);
      }
    } catch (error) {
      toast.error('Gagal memuat data testimonial klien');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portfolioId]);

  const openModal = (test?: Testimonial) => {
    if (test) {
      setEditingId(test.id);
      reset({
        clientName: test.clientName,
        clientRole: test.clientRole || '',
        quote: test.quote,
      });
    } else {
      setEditingId(null);
      reset({
        clientName: '',
        clientRole: '',
        quote: '',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const onSubmit = async (formData: TestimonialFormInput) => {
    setIsSaving(true);
    try {
      const url = editingId 
        ? `/api/dashboard/portfolios/${portfolioId}/testimonials/${editingId}`
        : `/api/dashboard/portfolios/${portfolioId}/testimonials`;
      
      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: formData.clientName,
          clientRole: formData.clientRole || null,
          quote: formData.quote,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Gagal menyimpan data testimonial');
      }
      
      toast.success(editingId ? 'Testimonial diperbarui' : 'Testimonial ditambahkan');
      fetchTestimonials();
      closeModal();
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || 'Terjadi kesalahan saat menyimpan');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus testimonial ini?')) return;
    
    setIsDeleting(id);
    try {
      const res = await fetch(`/api/dashboard/portfolios/${portfolioId}/testimonials/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Gagal menghapus data');
      
      toast.success('Testimonial berhasil dihapus');
      fetchTestimonials();
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
        <div className="card p-6 h-64 bg-zinc-900 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader 
          title="Testimonial & Kutipan Klien" 
          description="Kelola kutipan rekomendasi, feedback klien, atau endorsements profesional yang ingin Anda tampilkan."
        />
        <button
          onClick={() => openModal()}
          className="btn btn-primary h-11 px-5"
        >
          <Plus size={16} className="mr-2" /> Tambah Testimonial
        </button>
      </div>

      {testimonials.length === 0 ? (
        <div className="card p-12 text-center flex flex-col items-center justify-center border-dashed border-zinc-800">
          <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500 mb-4 shadow-inner">
            <Quote size={28} />
          </div>
          <h3 className="text-zinc-200 font-bold mb-2">Belum ada testimonial klien</h3>
          <p className="text-zinc-500 text-sm max-w-sm font-light">
            Tunjukkan kredibilitas Anda dengan menambahkan kutipan pujian atau ulasan positif dari rekan kerja, klien, atau manajer Anda.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {testimonials.map((test) => (
            <div 
              key={test.id} 
              className="card p-6 relative group border border-zinc-800/80 hover:border-cyan-500/20 bg-zinc-900/40 backdrop-blur-xl transition-all"
            >
              <div className="flex justify-between items-start gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 font-black shadow-inner">
                  {test.clientName.charAt(0).toUpperCase()}
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => openModal(test)}
                    className="p-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 hover:text-cyan-400 transition-colors border border-zinc-800 text-zinc-400"
                    title="Edit Testimonial"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(test.id)}
                    disabled={isDeleting === test.id}
                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 hover:text-red-400 transition-colors border border-red-500/10 text-red-400 disabled:opacity-50"
                    title="Hapus Testimonial"
                  >
                    {isDeleting === test.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-zinc-300 text-sm italic font-light leading-relaxed">
                  &ldquo;{test.quote}&rdquo;
                </p>
                <div>
                  <h4 className="text-zinc-200 font-bold text-sm">{test.clientName}</h4>
                  {test.clientRole && (
                    <span className="text-zinc-500 text-xs font-light block mt-0.5">{test.clientRole}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Testimonial Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="card w-full max-w-lg bg-zinc-950 border border-zinc-800/80 p-6 rounded-2xl relative shadow-2xl">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold text-white mb-6 flex items-center">
              <Quote className="mr-2 text-cyan-400 w-5 h-5" />
              {editingId ? 'Edit Testimonial Klien' : 'Tambah Testimonial Klien'}
            </h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Nama Klien / Pemberi Ulasan</label>
                <input
                  type="text"
                  placeholder="Contoh: John Doe"
                  className="input-field"
                  {...register('clientName')}
                />
                {errors.clientName && (
                  <p className="text-xs text-red-500 mt-1">{errors.clientName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Peran & Instansi (Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: CEO at TechCorp / Lead Designer"
                  className="input-field"
                  {...register('clientRole')}
                />
                {errors.clientRole && (
                  <p className="text-xs text-red-500 mt-1">{errors.clientRole.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Kutipan Rekomendasi (Testimonial)</label>
                <textarea
                  placeholder="Tulis ulasan positif atau feedback profesional dari klien..."
                  rows={4}
                  className="input-field resize-none"
                  {...register('quote')}
                />
                {errors.quote && (
                  <p className="text-xs text-red-500 mt-1">{errors.quote.message}</p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-900">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSaving}
                  className="btn btn-ghost px-5 h-11"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn btn-primary px-5 h-11"
                >
                  {isSaving ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
                  {isSaving ? 'Menyimpan...' : 'Simpan Testimonial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
