'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { AnimationWrapper } from '../ui/AnimationWrapper';
import { Send, Loader2, Mail } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ContactSectionProps {
  portfolioId: string;
}

const contactSchema = z.object({
  senderName: z.string().min(2, 'Nama lengkap minimal 2 karakter'),
  senderEmail: z.string().email('Format email tidak valid'),
  subject: z.string().optional(),
  message: z.string().min(10, 'Pesan minimal 10 karakter'),
  honeypot: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

export function ContactSection({ portfolioId }: ContactSectionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    // Honeypot spam protection
    if (data.honeypot) {
      toast.success('Pesan Anda berhasil dikirim!');
      reset();
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/contact/${portfolioId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderName: data.senderName,
          senderEmail: data.senderEmail,
          subject: data.subject || 'Pesan Baru dari Portofolio',
          message: data.message,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Gagal mengirim pesan.');
      }

      toast.success('Pesan Anda berhasil dikirim!');
      reset();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-24 bg-transparent relative overflow-hidden scroll-mt-24">
      <div className="max-w-3xl mx-auto px-6">
        
        {/* Section Title & Tagline */}
        <AnimationWrapper delay={0.1} direction="up">
          <h2 className="font-heading text-3xl sm:text-5xl text-white mb-4 flex items-center justify-center gap-4 text-center">
            <Mail className="h-8 w-8 text-primary-400" />
            Hubungi Saya
          </h2>
          <p className="text-zinc-400 text-center text-sm sm:text-base font-light mb-16">
            Kirim pesan kepada saya secara langsung dan saya akan membalasnya sesegera mungkin.
          </p>
        </AnimationWrapper>

        {/* Contact form using Glassmorphism and Motion hover */}
        <AnimationWrapper delay={0.2} direction="up">
          <motion.div 
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-6 sm:p-10 shadow-[0_15px_30px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.03)] hover:border-primary-500/25 hover:shadow-[0_20px_45px_color-mix(in_srgb,var(--color-primary-500)_20%,transparent)] relative overflow-hidden group transition-colors duration-300"
          >
            {/* Shiny sweeping overlay hover effect */}
            <div className="absolute inset-0 w-1/3 h-full bg-gradient-to-r from-transparent via-primary-400/5 to-transparent -skew-x-12 translate-x-[-150%] group-hover:translate-x-[350%] transition-transform duration-1000 ease-out pointer-events-none z-10" />

            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary-500/30 to-transparent" />
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative z-10" suppressHydrationWarning>
              
              {/* Honeypot field (invisible) */}
              <input 
                type="text" 
                {...register('honeypot')} 
                className="hidden" 
                tabIndex={-1} 
                autoComplete="off" 
                suppressHydrationWarning
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label htmlFor="senderName" className="font-heading block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Nama Lengkap <span className="text-primary-500">*</span>
                  </label>
                  <input
                    id="senderName"
                    type="text"
                    {...register('senderName')}
                    className={`w-full bg-zinc-950/80 border ${errors.senderName ? 'border-red-500 focus:border-red-500' : 'border-zinc-800/85 focus:border-primary-500/80'} rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500/20 transition-all duration-300 placeholder:text-zinc-600`}
                    placeholder="John Doe"
                    disabled={isSubmitting}
                    suppressHydrationWarning
                  />
                  {errors.senderName && <p className="mt-1.5 text-xs text-red-400 font-medium">{errors.senderName.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="senderEmail" className="font-heading block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Alamat Email <span className="text-primary-500">*</span>
                  </label>
                  <input
                    id="senderEmail"
                    type="email"
                    {...register('senderEmail')}
                    className={`w-full bg-zinc-950/80 border ${errors.senderEmail ? 'border-red-500 focus:border-red-500' : 'border-zinc-800/85 focus:border-primary-500/80'} rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500/20 transition-all duration-300 placeholder:text-zinc-600`}
                    placeholder="john@example.com"
                    disabled={isSubmitting}
                    suppressHydrationWarning
                  />
                  {errors.senderEmail && <p className="mt-1.5 text-xs text-red-400 font-medium">{errors.senderEmail.message}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="subject" className="font-heading block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Subjek Pesan (Opsional)
                </label>
                <input
                  id="subject"
                  type="text"
                  {...register('subject')}
                  className="w-full bg-zinc-950/80 border border-zinc-800/85 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary-500/80 focus:ring-1 focus:ring-primary-500/20 transition-all duration-300 placeholder:text-zinc-600"
                  placeholder="Tawaran Kerjasama / Penawaran Pekerjaan"
                  disabled={isSubmitting}
                  suppressHydrationWarning
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="message" className="font-heading block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Pesan Lengkap <span className="text-primary-500">*</span>
                </label>
                <textarea
                  id="message"
                  {...register('message')}
                  rows={5}
                  className={`w-full bg-zinc-950/80 border ${errors.message ? 'border-red-500 focus:border-red-500' : 'border-zinc-800/85 focus:border-primary-500/80'} rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500/20 transition-all duration-300 placeholder:text-zinc-600 resize-none`}
                  placeholder="Tulis detail rencana pesan Anda di sini..."
                  disabled={isSubmitting}
                  suppressHydrationWarning
                ></textarea>
                {errors.message && <p className="mt-1.5 text-xs text-red-400 font-medium">{errors.message.message}</p>}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                suppressHydrationWarning
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-[0_0_15px_color-mix(in_srgb,var(--color-primary-500)_20%,transparent)] hover:shadow-[0_0_25px_color-mix(in_srgb,var(--color-primary-500)_20%,transparent)] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Mengirim...
                  </>
                ) : (
                  <>
                    Kirim Pesan <Send className="ml-2 h-4 w-4" />
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
        </AnimationWrapper>
      </div>
    </section>
  );
}
