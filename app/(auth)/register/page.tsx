'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Eye, EyeOff, Sun, Moon, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Nama minimal 2 karakter').max(50),
    email: z.string().email('Format email tidak valid'),
    password: z
      .string()
      .min(8, 'Password minimal 8 karakter')
      .regex(/[A-Z]/, 'Harus mengandung minimal 1 huruf besar')
      .regex(/[0-9]/, 'Harus mengandung minimal 1 angka'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Password tidak cocok',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

const portfolios = [
  { name: 'Hero Section', role: 'Tampilan Awal', image: '/file_imageSLD/Tampilan_awal.png' },
  { name: 'About Me', role: 'Tentang Saya', image: '/file_imageSLD/Tentang_saya.png' },
  { name: 'Education', role: 'Riwayat Pendidikan', image: '/file_imageSLD/Riwayat_pendidikan.png' },
  { name: 'Projects', role: 'Proyek Saya', image: '/file_imageSLD/Proyek_saya.png' }
];

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const router = useRouter();
  
  const isDark = theme === 'dark';

  const containerRef = useRef<HTMLDivElement>(null);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    containerRef.current.style.setProperty('--mouse-x', `${x}px`);
    containerRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  const sliderRef = useRef<HTMLDivElement>(null);
  const [isHoveringSlider, setIsHoveringSlider] = useState(false);

  useEffect(() => {
    if (isHoveringSlider) return;
    const interval = setInterval(() => {
      if (sliderRef.current) {
        const container = sliderRef.current;
        const cardWidth = (container.firstElementChild as HTMLElement)?.offsetWidth || 300;
        const gap = 16; 
        let newScroll = container.scrollLeft + cardWidth + gap;
        if (newScroll >= container.scrollWidth - container.clientWidth) {
          newScroll = 0;
        }
        container.scrollTo({ left: newScroll, behavior: 'smooth' });
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [isHoveringSlider]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      const responseData = await res.json();

      if (!res.ok) {
        toast.error(responseData.message || 'Gagal membuat akun');
        return;
      }

      toast.success('Akun berhasil dibuat! Mengalihkan...');

      // Auto login
      const signInResult = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        toast.error('Gagal auto-login, silakan login manual.');
        router.push('/login');
      } else {
        router.push('/dashboard/onboarding');
      }
    } catch (error) {
      console.error(error);
      toast.error('Terjadi kesalahan pada server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`relative flex min-h-screen items-center justify-center px-4 py-12 overflow-hidden transition-colors duration-700 ${isDark ? 'bg-[#020617]' : 'bg-slate-50'}`}
      style={{
        backgroundImage: isDark ? `
          radial-gradient(circle 800px at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(0,240,255,0.15), transparent 40%),
          linear-gradient(rgba(0,240,255,0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,240,255,0.05) 1px, transparent 1px)
        ` : `
          radial-gradient(circle 800px at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(14,165,233,0.08), transparent 40%),
          linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 40px 40px, 40px 40px',
        backgroundPosition: '0 0, 0 0, 0 0',
        colorScheme: isDark ? 'dark' : 'light'
      }}
    >
      <button
        type="button"
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        className={`absolute top-6 right-6 z-50 flex items-center justify-center w-12 h-12 rounded-full backdrop-blur-md border transition-all duration-300 hover:scale-110 ${
          isDark 
            ? 'bg-zinc-900/50 border-[#00f0ff]/30 text-[#00f0ff] hover:shadow-[0_0_15px_rgba(0,240,255,0.4)]' 
            : 'bg-white/50 border-slate-200 text-sky-600 hover:shadow-[0_0_15px_rgba(14,165,233,0.2)]'
        }`}
        title={isDark ? "Beralih ke Putih Elegant" : "Beralih ke Dark Glow"}
      >
        {isDark ? <Sun size={22} /> : <Moon size={22} />}
      </button>

      {/* Back to Home Button */}
      <Link
        href="/"
        className={`absolute top-6 left-6 z-50 flex items-center justify-center gap-2 px-4 h-12 rounded-xl backdrop-blur-md border transition-all duration-300 hover:scale-105 ${
          isDark 
            ? 'bg-zinc-900/50 border-[#00f0ff]/30 text-[#00f0ff] hover:text-[#b026ff] hover:shadow-[0_0_15px_rgba(0,240,255,0.4)]' 
            : 'bg-white/50 border-slate-200 text-sky-600 hover:text-sky-500 hover:shadow-[0_0_15px_rgba(14,165,233,0.2)]'
        }`}
        title="Kembali ke Beranda"
      >
        <ArrowLeft size={18} />
        <span className="text-sm font-bold tracking-wide">Beranda</span>
      </Link>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {isDark ? (
          <>
            <div className="orb orb-1 opacity-20" />
            <div className="orb orb-2 opacity-10 bg-[#b026ff]" />
            <div className="orb orb-3 opacity-20" />
            <div className="absolute top-0 left-[15%] w-[1px] h-full bg-gradient-to-b from-transparent via-[#00f0ff]/50 to-transparent animate-scanline" />
            <div className="absolute top-0 right-[25%] w-[1px] h-full bg-gradient-to-b from-transparent via-sky-500/30 to-transparent animate-scanline-delayed" />
            <div className="absolute top-0 left-[60%] w-[1px] h-full bg-gradient-to-b from-transparent via-[#00f0ff]/20 to-transparent animate-scanline" style={{ animationDelay: '-6s', animationDuration: '15s' }} />
          </>
        ) : (
          <>
            <div className="orb orb-1 opacity-40 bg-sky-200" />
            <div className="orb orb-2 opacity-30 bg-blue-200" />
            <div className="orb orb-3 opacity-40 bg-indigo-100" />
            <div className="absolute top-0 left-[15%] w-[1px] h-full bg-gradient-to-b from-transparent via-sky-300/40 to-transparent animate-scanline" />
            <div className="absolute top-0 right-[25%] w-[1px] h-full bg-gradient-to-b from-transparent via-blue-300/30 to-transparent animate-scanline-delayed" />
            <div className="absolute top-0 left-[60%] w-[1px] h-full bg-gradient-to-b from-transparent via-indigo-300/20 to-transparent animate-scanline" style={{ animationDelay: '-6s', animationDuration: '15s' }} />
          </>
        )}
      </div>

      <div className="w-full max-w-6xl mx-auto flex flex-col-reverse lg:flex-row lg:items-start items-center gap-12 lg:gap-24 relative z-10 animate-cardEntrance">
        
        <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
          <div 
            className={`w-full max-w-md relative rounded-2xl border p-8 backdrop-blur-xl group transition-colors duration-500 ${
              isDark ? 'border-[#00f0ff]/20' : 'border-slate-200/60'
            }`}
            style={{
              background: isDark ? 'rgba(2, 6, 23, 0.7)' : 'rgba(255, 255, 255, 0.85)',
              boxShadow: isDark 
                ? '0 0 0 1px rgba(0,240,255,0.1), 0 25px 60px -12px rgba(0,0,0,0.8), inset 0 0 80px rgba(0,240,255,0.03)'
                : '0 0 0 1px rgba(0,0,0,0.02), 0 20px 40px -12px rgba(0,0,0,0.08), inset 0 0 80px rgba(255,255,255,0.6)'
            }}
          >
            {isDark && (
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent opacity-80" />
            )}
            {!isDark && (
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-sky-300 to-transparent opacity-60" />
            )}

            <div className="mb-6 text-center lg:text-left">
              <h2 className={`text-2xl font-bold tracking-tight mb-2 transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Bergabung Bersama Kami
              </h2>
              <p className={`text-sm prompt-regular transition-colors ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                Mulai bangun portofolio profesionalmu
              </p>
            </div>

            <form className="space-y-5 relative z-10" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label className={`block text-xs font-medium prompt-regular mb-1.5 transition-colors ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                  Nama Lengkap
                </label>
                <div className="mt-1">
                  <input
                    {...register('name')}
                    type="text"
                    className={`w-full h-11 rounded-md border px-4 py-2 text-sm transition-all duration-300 focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 ${
                      isDark 
                        ? 'border-[#00f0ff]/20 bg-black/60 text-zinc-100 placeholder-zinc-600 focus:border-[#00f0ff]' 
                        : 'border-slate-300/60 bg-white/70 text-slate-900 placeholder-slate-400 focus:border-sky-500'
                    }`}
                    style={{ boxShadow: '0 0 0 1px transparent' }}
                    onFocus={(e) => {
                      e.target.style.boxShadow = isDark 
                        ? '0 0 0 1px rgba(0,240,255,0.4), 0 0 20px rgba(0,240,255,0.15)'
                        : '0 0 0 1px rgba(14,165,233,0.3), 0 0 15px rgba(14,165,233,0.1)';
                      e.target.style.borderColor = isDark ? 'rgba(0,240,255,0.8)' : 'rgba(14,165,233,0.6)';
                    }}
                    onBlur={(e) => {
                      e.target.style.boxShadow = '0 0 0 1px transparent';
                      e.target.style.borderColor = isDark ? 'rgba(0,240,255,0.2)' : 'rgba(203,213,225,0.6)'; 
                    }}
                    placeholder="Isi nama Anda..."
                    disabled={isLoading}
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className={`block text-xs font-medium prompt-regular mb-1.5 transition-colors ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                  Email
                </label>
                <div className="mt-1">
                  <input
                    {...register('email')}
                    type="email"
                    className={`w-full h-11 rounded-md border px-4 py-2 text-sm transition-all duration-300 focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 ${
                      isDark 
                        ? 'border-[#00f0ff]/20 bg-black/60 text-zinc-100 placeholder-zinc-600 focus:border-[#00f0ff]' 
                        : 'border-slate-300/60 bg-white/70 text-slate-900 placeholder-slate-400 focus:border-sky-500'
                    }`}
                    style={{ boxShadow: '0 0 0 1px transparent' }}
                    onFocus={(e) => {
                      e.target.style.boxShadow = isDark 
                        ? '0 0 0 1px rgba(0,240,255,0.4), 0 0 20px rgba(0,240,255,0.15)'
                        : '0 0 0 1px rgba(14,165,233,0.3), 0 0 15px rgba(14,165,233,0.1)';
                      e.target.style.borderColor = isDark ? 'rgba(0,240,255,0.8)' : 'rgba(14,165,233,0.6)';
                    }}
                    onBlur={(e) => {
                      e.target.style.boxShadow = '0 0 0 1px transparent';
                      e.target.style.borderColor = isDark ? 'rgba(0,240,255,0.2)' : 'rgba(203,213,225,0.6)'; 
                    }}
                    placeholder="Isi email Anda..."
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className={`block text-xs font-medium prompt-regular mb-1.5 transition-colors ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                  Password
                </label>
                <div className="relative mt-1">
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    className={`w-full h-11 rounded-md border pl-4 pr-11 py-2 text-sm transition-all duration-300 focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 ${
                      isDark 
                        ? 'border-[#00f0ff]/20 bg-black/60 text-zinc-100 placeholder-zinc-600 focus:border-[#00f0ff]' 
                        : 'border-slate-300/60 bg-white/70 text-slate-900 placeholder-slate-400 focus:border-sky-500'
                    }`}
                    style={{ boxShadow: '0 0 0 1px transparent' }}
                    onFocus={(e) => {
                      e.target.style.boxShadow = isDark 
                        ? '0 0 0 1px rgba(0,240,255,0.4), 0 0 20px rgba(0,240,255,0.15)'
                        : '0 0 0 1px rgba(14,165,233,0.3), 0 0 15px rgba(14,165,233,0.1)';
                      e.target.style.borderColor = isDark ? 'rgba(0,240,255,0.8)' : 'rgba(14,165,233,0.6)';
                    }}
                    onBlur={(e) => {
                      e.target.style.boxShadow = '0 0 0 1px transparent';
                      e.target.style.borderColor = isDark ? 'rgba(0,240,255,0.2)' : 'rgba(203,213,225,0.6)';
                    }}
                    placeholder="••••••••"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className={`absolute inset-y-0 right-0 flex items-center pr-3 transition-colors ${
                      isDark ? 'text-zinc-500 hover:text-[#00f0ff]' : 'text-slate-400 hover:text-sky-600'
                    }`}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label className={`block text-xs font-medium prompt-regular mb-1.5 transition-colors ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                  Konfirmasi Password
                </label>
                <div className="mt-1">
                  <input
                    {...register('confirmPassword')}
                    type={showPassword ? 'text' : 'password'}
                    className={`w-full h-11 rounded-md border px-4 py-2 text-sm transition-all duration-300 focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 ${
                      isDark 
                        ? 'border-[#00f0ff]/20 bg-black/60 text-zinc-100 placeholder-zinc-600 focus:border-[#00f0ff]' 
                        : 'border-slate-300/60 bg-white/70 text-slate-900 placeholder-slate-400 focus:border-sky-500'
                    }`}
                    style={{ boxShadow: '0 0 0 1px transparent' }}
                    onFocus={(e) => {
                      e.target.style.boxShadow = isDark 
                        ? '0 0 0 1px rgba(0,240,255,0.4), 0 0 20px rgba(0,240,255,0.15)'
                        : '0 0 0 1px rgba(14,165,233,0.3), 0 0 15px rgba(14,165,233,0.1)';
                      e.target.style.borderColor = isDark ? 'rgba(0,240,255,0.8)' : 'rgba(14,165,233,0.6)';
                    }}
                    onBlur={(e) => {
                      e.target.style.boxShadow = '0 0 0 1px transparent';
                      e.target.style.borderColor = isDark ? 'rgba(0,240,255,0.2)' : 'rgba(203,213,225,0.6)'; 
                    }}
                    placeholder="••••••••"
                    disabled={isLoading}
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-400">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className={`btn-shimmer relative w-full h-12 flex items-center justify-center overflow-hidden rounded-md text-sm font-bold uppercase tracking-[0.1em] text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6 ${
                  isDark 
                    ? 'bg-gradient-to-r from-[#00f0ff] to-[#b026ff]' 
                    : 'bg-gradient-to-r from-sky-500 to-blue-600'
                }`}
                style={{ 
                  boxShadow: isDark ? '0 0 20px rgba(0,240,255,0.3)' : '0 10px 20px rgba(14,165,233,0.2)' 
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.boxShadow = isDark 
                      ? '0 0 40px rgba(0,240,255,0.6)' 
                      : '0 15px 30px rgba(14,165,233,0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = isDark 
                    ? '0 0 20px rgba(0,240,255,0.3)' 
                    : '0 10px 20px rgba(14,165,233,0.2)';
                }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                    Mendaftar...
                  </>
                ) : (
                  <span className="relative z-10">DAFTAR</span>
                )}
              </button>
            </form>

            <p className={`mt-6 text-center text-sm transition-colors ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
              Sudah punya akun?{' '}
              <Link
                href="/login"
                className={`font-medium transition-colors ${
                  isDark ? 'text-[#00f0ff] hover:text-[#b026ff]' : 'text-sky-600 hover:text-sky-500'
                }`}
                style={{ textShadow: isDark ? '0 0 10px rgba(0,240,255,0.4)' : 'none' }}
              >
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex flex-col lg:justify-start justify-center items-center lg:items-start text-center lg:text-left">
          <div className="relative mb-5 group cursor-default">
            <div className={`absolute inset-0 rounded-full blur-[35px] transition-colors duration-700 ${
              isDark ? 'bg-[#00f0ff]/30 group-hover:bg-[#00f0ff]/50' : 'bg-sky-400/20 group-hover:bg-sky-300/40'
            }`}></div>
            
            <svg 
              width="76" 
              height="76" 
              viewBox="0 0 40 40" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="square" 
              strokeLinejoin="miter" 
              className={`relative z-10 transition-all duration-500 transform group-hover:scale-105 ${
                isDark 
                  ? 'text-[#00f0ff] drop-shadow-[0_0_15px_rgba(0,240,255,0.8)] group-hover:drop-shadow-[0_0_25px_rgba(0,240,255,1)]'
                  : 'text-sky-600 drop-shadow-[0_5px_10px_rgba(14,165,233,0.3)] group-hover:drop-shadow-[0_8px_20px_rgba(14,165,233,0.5)]'
              }`}
            >
              <path d="M10 6v28" />
              <path d="M22 6v28" />
              <path d="M10 20h12" />
              <path d="M22 6h8a7 7 0 0 1 0 14h-8" />
            </svg>
          </div>
          
          <div className={`mb-3 ${isDark ? 'drop-shadow-[0_0_15px_rgba(0,240,255,0.5)]' : 'drop-shadow-[0_4px_10px_rgba(14,165,233,0.15)]'}`}>
            <h1 
              className={`text-4xl lg:text-5xl font-black uppercase saira-stencil tracking-widest bg-clip-text text-transparent ${
                isDark 
                  ? 'bg-gradient-to-r from-[#00f0ff] to-[#b026ff]' 
                  : 'bg-gradient-to-r from-slate-900 to-sky-600'
              }`}
            >
              HAGZPORT
            </h1>
          </div>
          
          <div className={`border-l-2 pl-4 py-1 ml-1 transition-colors duration-500 ${
            isDark ? 'border-[#00f0ff]/60' : 'border-sky-500/50'
          }`}>
            <p className={`prompt-light text-base lg:text-lg max-w-sm leading-relaxed transition-colors duration-500 ${
              isDark ? 'text-zinc-300' : 'text-slate-600'
            }`}>
              Sebuah Web yang bisa custom Portfolio mu.
            </p>
          </div>

          {/* Label untuk Slider */}
          <div className="mt-10 lg:mt-12 w-full flex items-center opacity-90 pl-1">
            <span className={`text-[10px] md:text-xs font-bold uppercase tracking-widest transition-colors duration-500 ${isDark ? 'text-[#00f0ff]' : 'text-sky-600'}`}>
              Berikut contoh portfolio user
            </span>
            <div className={`ml-4 h-[1px] flex-grow rounded-full transition-colors duration-500 ${isDark ? 'bg-gradient-to-r from-[#00f0ff]/50 to-transparent' : 'bg-gradient-to-r from-sky-400/50 to-transparent'}`}></div>
          </div>

          {/* Slider Portfolio Results */}
          <div 
            className="w-full mt-4 lg:mt-6 relative overflow-hidden"
            style={{
              maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
              WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)'
            }}
          >
            <div 
              ref={sliderRef}
              onMouseEnter={() => setIsHoveringSlider(true)}
              onMouseLeave={() => setIsHoveringSlider(false)}
              onTouchStart={() => setIsHoveringSlider(true)}
              onTouchEnd={() => setIsHoveringSlider(false)}
              className="flex gap-4 overflow-x-auto snap-x snap-mandatory py-4 w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
              {portfolios.map((p, i) => (
                <div 
                  key={i} 
                  className={`min-w-[240px] lg:min-w-[280px] h-[150px] lg:h-[180px] snap-center shrink-0 relative rounded-xl overflow-hidden shadow-lg border transition-colors duration-500 group cursor-grab active:cursor-grabbing ${
                    isDark ? 'border-[#00f0ff]/30' : 'border-slate-300'
                  }`}
                >
                  <img src={p.image} alt={`Portfolio ${p.name}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className={`absolute inset-0 bg-gradient-to-t transition-colors duration-500 ${
                    isDark 
                      ? 'from-black/90 via-black/20 to-transparent' 
                      : 'from-slate-900/80 via-slate-900/20 to-transparent'
                  }`}></div>
                  <div className="absolute bottom-4 left-4 right-4 text-left">
                    <p className="text-white font-semibold text-sm lg:text-base drop-shadow-md">{p.name}</p>
                    <p className={`text-xs transition-colors duration-500 ${isDark ? 'text-[#00f0ff]' : 'text-sky-300'}`}>{p.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
