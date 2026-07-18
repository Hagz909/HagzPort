'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useDebounce } from 'use-debounce';

export default function OnboardingPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [debouncedUsername] = useDebounce(username, 300);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<'idle' | 'valid' | 'invalid' | 'blacklist' | 'taken'>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const checkAvailability = async () => {
      if (!debouncedUsername) {
        setValidationResult('idle');
        return;
      }
      const regex = /^[a-z0-9-]{3,30}$/;
      if (!regex.test(debouncedUsername)) {
        setValidationResult('invalid');
        return;
      }
      const blacklist = [
        'admin', 'api', 'dashboard', 'login', 'register', 'logout', 'settings',
        'profile', 'public', 'static', 'about', 'contact', 'home', 'index',
        'null', 'undefined'
      ];
      if (blacklist.includes(debouncedUsername)) {
        setValidationResult('blacklist');
        return;
      }

      setIsValidating(true);
      try {
        const res = await fetch('/api/dashboard/onboarding/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: debouncedUsername }),
        });
        const data = await res.json();
        if (data.available) {
          setValidationResult('valid');
        } else {
          setValidationResult('taken');
        }
      } catch (error) {
        setValidationResult('invalid');
      } finally {
        setIsValidating(false);
      }
    };
    
    checkAvailability();
  }, [debouncedUsername]);

  if (status === 'loading') {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validationResult !== 'valid') return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/dashboard/onboarding', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: debouncedUsername }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || 'Gagal menyimpan username');
        if (data.message === 'Username sudah digunakan') setValidationResult('invalid');
        return;
      }

      toast.success('Berhasil!');
      router.push('/dashboard/portfolios');
    } catch (error) {
      toast.error('Terjadi kesalahan sistem');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-full items-center justify-center">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-zinc-50 drop-shadow-md">
            Sempurnakan Identitas Anda
          </h2>
          <p className="mt-3 text-base text-zinc-400 prompt-light">
            Tentukan identitas unik untuk tautan portofolio profesional Anda.
          </p>
        </div>

        <div className="card p-8 backdrop-blur-xl border border-zinc-800/60 shadow-[0_0_40px_rgba(0,0,0,0.5)] relative">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300">
                Username Portofolio
              </label>
              <div className="mt-2 flex rounded-md shadow-sm">
                <span className="inline-flex items-center rounded-l-md border border-r-0 border-zinc-700/80 bg-black/40 px-3 text-zinc-500 text-sm transition-colors group-focus-within:border-cyan-500/50 group-focus-within:text-cyan-400">
                  hgzport.com/
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  className="w-full h-11 rounded-r-md border border-zinc-700/80 bg-black/20 px-4 py-2 text-sm text-zinc-100 placeholder-zinc-600 transition-all focus:border-cyan-500/80 focus:bg-black/60 focus:outline-none focus:ring-0 disabled:opacity-50 group"
                  placeholder="nama-anda"
                  disabled={isSubmitting}
                />
              </div>

              {/* Status Indicators */}
              <div className="mt-3 flex items-center text-sm">
                {username === '' ? (
                  <span className="text-zinc-500">Minimal 3 karakter (huruf, angka, strip)</span>
                ) : validationResult === 'valid' ? (
                  <span className="flex items-center text-green-500"><CheckCircle2 size={16} className="mr-1" /> Username tersedia! (jika belum dipakai orang lain)</span>
                ) : validationResult === 'invalid' ? (
                  <span className="flex items-center text-red-400"><XCircle size={16} className="mr-1" /> Format tidak valid atau terlalu pendek</span>
                ) : validationResult === 'blacklist' ? (
                  <span className="flex items-center text-red-400"><XCircle size={16} className="mr-1" /> Username ini tidak diizinkan</span>
                ) : validationResult === 'taken' ? (
                  <span className="flex items-center text-red-400"><XCircle size={16} className="mr-1" /> Username sudah digunakan orang lain</span>
                ) : isValidating ? (
                  <span className="flex items-center text-cyan-400"><Loader2 size={16} className="mr-1 animate-spin" /> Memeriksa ketersediaan...</span>
                ) : null}
              </div>
            </div>

            <button
              type="submit"
              disabled={validationResult !== 'valid' || isSubmitting}
              className="btn-shimmer relative w-full h-12 flex items-center justify-center overflow-hidden rounded-md text-sm font-bold uppercase tracking-[0.1em] text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                  Menyimpan...
                </>
              ) : (
                <span className="relative z-10">Lanjutkan ke Dashboard</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
