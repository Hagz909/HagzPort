'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Poppins } from 'next/font/google';
import {
  Folder,
  FileText,
  Shield,
  ArrowRight,
  Sparkles,
  Layout,
  Cpu,
  TrendingUp,
  CheckCircle2,
  Globe,
  ArrowUpRight,
  Loader2,
  MousePointer
} from 'lucide-react';

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export default function Home() {
  const [animationStep, setAnimationStep] = useState(0);
  const [typedName, setTypedName] = useState('');
  const [typedTitle, setTypedTitle] = useState('');

  // 6-step loop representing:
  // 0: Reset/Idle
  // 1: Type name
  // 2: Type title
  // 3: Cursor hover & click
  // 4: Laser scanline runs
  // 5: CV reveals successfully
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationStep((prev) => (prev + 1) % 6);
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (animationStep === 0) {
      setTypedName('');
      setTypedTitle('');
    } else if (animationStep === 1) {
      const name = "Farhan Aditya";
      let i = 0;
      setTypedName('');
      const t = setInterval(() => {
        if (i < name.length) {
          setTypedName((prev) => prev + name.charAt(i));
          i++;
        } else {
          clearInterval(t);
        }
      }, 80);
      return () => clearInterval(t);
    } else if (animationStep === 2) {
      const title = "Frontend Engineer";
      let i = 0;
      setTypedTitle('');
      const t = setInterval(() => {
        if (i < title.length) {
          setTypedTitle((prev) => prev + title.charAt(i));
          i++;
        } else {
          clearInterval(t);
        }
      }, 70);
      return () => clearInterval(t);
    }
  }, [animationStep]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 relative overflow-x-hidden flex flex-col justify-between font-sans selection:bg-cyan-500/30 selection:text-cyan-200">

      {/* Background Ambient Glowing Orbs Container (Prevents Scroll Bleeding) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[130px] animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-500/10 blur-[140px] animate-pulse" style={{ animationDuration: '10s' }}></div>
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-blue-500/5 blur-[120px]"></div>
      </div>

      {/* Futuristic Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0"></div>

      {/* Fine radial gradient to vignette the grid overlay */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-zinc-950/70 to-zinc-950 pointer-events-none z-0"></div>

      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-900 bg-zinc-950/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-500 to-emerald-400 flex items-center justify-center font-black text-zinc-950 shadow-[0_0_20px_rgba(6,182,212,0.35)]">
              HP
            </div>
            <span className="text-2xl font-black tracking-tight text-white">
              Hgz<span className="text-cyan-400">Port</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a href="#fitur" className="hover:text-cyan-400 transition-colors">Fitur</a>
            <a href="#tampilan" className="hover:text-cyan-400 transition-colors">Tampilan</a>
            <a href="#keunggulan" className="hover:text-cyan-400 transition-colors">Keunggulan</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors px-3 py-1"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="relative group px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-sm font-bold transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] active:scale-[0.98] overflow-hidden"
            >
              <span className="relative z-10">Daftar Sekarang</span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 relative z-10 w-full max-w-7xl mx-auto px-6 pt-16 sm:pt-24 pb-20 flex flex-col items-center">

        {/* Hero Title & Text */}
        <div className="text-center space-y-6 max-w-4xl mx-auto mb-16">
          {/* Tagline Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-semibold text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.05)]"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            HgzPort Dashboard v1.2.0
          </motion.div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-7xl font-black tracking-tight text-white leading-[1.05]">
            Sihir Portofolio Anda <br className="hidden sm:block" />
            Menjadi <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400 drop-shadow-sm">Karya Seni Profesional</span>
          </h1>

          {/* Subtitle */}
          <p className={`${poppins.className} text-zinc-400 text-base sm:text-xl max-w-2xl mx-auto leading-relaxed font-light`}>
            Ubah portofolio digital Anda menjadi mahakarya profesional, tunjukkan keahlian terbaik Anda kepada dunia, dan hasilkan CV ATS-Friendly berkualitas tinggi secara instan dalam hitungan detik!
          </p>

          {/* Actions */}
          <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] shadow-[0_0_25px_rgba(6,182,212,0.4)]"
            >
              Mulai Bangun Portofolio <ArrowRight size={18} />
            </Link>
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              Buat Akun Baru
            </Link>
          </div>
        </div>

        {/* Floating SaaS Interactive Window Mockup with 3D perspective */}
        <div id="tampilan" className="perspective-1000 w-full max-w-5xl mb-24 relative z-20 scroll-mt-28">
          <motion.div
            initial={{ opacity: 0, y: 50, rotateX: 12, rotateY: -10 }}
            animate={{ opacity: 1, y: 0, rotateX: 8, rotateY: -6 }}
            whileHover={{ rotateX: 0, rotateY: 0, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 70, damping: 20 }}
            className="w-full rounded-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl p-3 sm:p-4 shadow-[0_30px_100px_rgba(0,0,0,0.8),inset_0_1px_80px_rgba(255,255,255,0.02)] relative group transform-style-preserve-3d"
          >
            {/* Header Line decoration */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />

            {/* Browser Window Bar */}
            <div className="flex justify-between items-center pb-3 border-b border-zinc-800/80 mb-3 px-2">
              <div className="flex gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80 block"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-500/80 block"></span>
                <span className="w-3 h-3 rounded-full bg-green-500/80 block"></span>
              </div>
              <div className="bg-zinc-950/80 border border-zinc-800 rounded-lg px-8 py-1 text-[10px] text-zinc-500 w-1/3 text-center truncate">
                hgzport.com/dashboard/resume
              </div>
              <div className="w-12"></div>
            </div>

            {/* Simulated App Workspace Grid */}
            <div className="grid lg:grid-cols-[200px_1fr_1.2fr] gap-4 rounded-xl overflow-hidden min-h-[380px] bg-zinc-950/80 p-2 text-left relative">

              {/* Simulated Mouse Pointer */}
              <AnimatePresence>
                {animationStep === 3 && (
                  <motion.div
                    initial={{ x: '10%', y: '10%' }}
                    animate={{ x: '35%', y: '82%' }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.4, ease: "easeInOut" }}
                    className="absolute z-40 pointer-events-none text-cyan-400 drop-shadow-[0_0_8px_#06b6d4]"
                  >
                    <MousePointer className="w-6 h-6 fill-current" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 1. Simulated Sidebar */}
              <div className="border-r border-zinc-900 p-3 space-y-4 hidden lg:block">
                <div className="h-6 w-24 bg-zinc-900 rounded-md mb-6"></div>
                <div className="space-y-2">
                  <div className="h-8 bg-cyan-500/10 border-l-2 border-cyan-400 rounded-r-md flex items-center px-2">
                    <div className="h-3 w-16 bg-cyan-400/40 rounded"></div>
                  </div>
                  <div className="h-8 rounded-md flex items-center px-2">
                    <div className="h-3 w-14 bg-zinc-900 rounded"></div>
                  </div>
                  <div className="h-8 rounded-md flex items-center px-2">
                    <div className="h-3 w-20 bg-zinc-900 rounded"></div>
                  </div>
                </div>
              </div>

              {/* 2. Simulated Form */}
              <div className="p-4 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="h-5 w-32 bg-zinc-900 rounded-md"></div>

                  {/* Form Input 1: Nama */}
                  <div className="space-y-1">
                    <div className="h-3 w-20 bg-zinc-800 rounded"></div>
                    <div className="h-10 bg-zinc-900 border border-zinc-800 rounded-xl px-3 flex items-center text-xs text-zinc-300">
                      {typedName}
                      {(animationStep === 1) && (
                        <span className="w-1 h-3.5 bg-cyan-400 ml-0.5 animate-pulse" />
                      )}
                    </div>
                  </div>

                  {/* Form Input 2: Tagline */}
                  <div className="space-y-1">
                    <div className="h-3 w-24 bg-zinc-800 rounded"></div>
                    <div className="h-10 bg-zinc-900 border border-zinc-800 rounded-xl px-3 flex items-center text-xs text-zinc-300">
                      {typedTitle}
                      {(animationStep === 2) && (
                        <span className="w-1 h-3.5 bg-cyan-400 ml-0.5 animate-pulse" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Generate Button Simulation */}
                <motion.div
                  animate={animationStep === 3 ? { scale: [1, 0.96, 1] } : {}}
                  transition={{ duration: 0.3, delay: 1.1 }}
                  className={`h-10 rounded-xl flex items-center justify-center font-bold text-xs text-white transition-all ${animationStep === 4
                      ? 'bg-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                      : 'bg-cyan-600 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    }`}
                >
                  {animationStep === 4 ? (
                    <span className="flex items-center gap-1.5"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Menyusun...</span>
                  ) : (
                    <span>Generate Preview</span>
                  )}
                </motion.div>
              </div>

              {/* 3. Simulated Live Mockup with 3D feel */}
              <div
                className={`border rounded-xl p-4 flex flex-col justify-between relative overflow-hidden transition-all duration-700 ${animationStep === 5
                    ? 'bg-zinc-900/90 border-cyan-500/40 shadow-[0_0_30px_rgba(6,182,212,0.25)]'
                    : 'bg-zinc-900/40 border-zinc-800/80 shadow-[inset_0_0_20px_rgba(0,0,0,0.4)]'
                  }`}
              >
                {/* Laser Scan line on step 4 */}
                {animationStep === 4 && (
                  <div className="absolute inset-0 bg-cyan-500/5 z-20 pointer-events-none overflow-hidden">
                    <div className="w-full h-0.5 bg-cyan-400 shadow-[0_0_15px_#06b6d4] absolute top-0 animate-scanline" />
                  </div>
                )}

                <div className="absolute top-0 right-0 left-0 h-1 bg-cyan-500/20"></div>

                <div className="space-y-4">
                  {/* Photo & Header area */}
                  <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 shrink-0 flex items-center justify-center text-xs font-bold text-cyan-400 border border-zinc-700/50">
                      {animationStep === 5 ? "FA" : "?"}
                    </div>
                    <div className="space-y-1 w-full">
                      {animationStep === 5 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs font-bold text-white">Farhan Aditya</motion.div>
                      ) : (
                        <div className="h-3 bg-zinc-800 rounded w-1/2"></div>
                      )}

                      {animationStep === 5 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] text-cyan-400 font-semibold">Frontend Engineer</motion.div>
                      ) : (
                        <div className="h-2 bg-zinc-900 rounded w-1/3"></div>
                      )}
                    </div>
                  </div>

                  {/* Project details area */}
                  <div className="space-y-2 pt-2 border-t border-zinc-900">
                    {animationStep === 5 ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                        <div className="text-[10px] font-bold text-zinc-300">PENGALAMAN PROYEK</div>
                        <div className="text-[9px] text-zinc-400 font-medium">Portofolio Builder & Studio CV (React, NextJS)</div>
                        <div className="text-[9px] text-zinc-500 leading-relaxed">Membangun platform portfolio dinamis dengan integrasi file PDF.</div>
                      </motion.div>
                    ) : (
                      <>
                        <div className="h-2.5 bg-zinc-800 rounded w-full"></div>
                        <div className="h-2.5 bg-zinc-800 rounded w-full"></div>
                        <div className="h-2.5 bg-zinc-800 rounded w-5/6"></div>
                      </>
                    )}
                  </div>
                </div>

                {/* Status footer inside mockup */}
                <div className={`h-8 rounded-lg flex items-center justify-center text-xs gap-2 transition-colors ${animationStep === 5 ? 'bg-cyan-500/10 text-cyan-400' : 'bg-zinc-800/50 text-zinc-500'
                  }`}>
                  <FileText size={14} />
                  <span>{animationStep === 5 ? "CV ATS-Ready Berhasil Dibuat" : "Draft CV Belum Disusun"}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Features Showcase Section */}
        <section id="fitur" className="w-full space-y-12 scroll-mt-28">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl font-black text-white">Teknologi Modern Terintegrasi</h2>
            <p className="text-sm text-zinc-400 leading-relaxed font-light">
              Kami merancang sistem dengan arsitektur modern untuk menjamin performa maksimal dan kemudahan pengelolaan data portofolio Anda.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Card 1 */}
            <div className="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800 hover:border-cyan-500/30 transition-all text-left shadow-md group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-6 group-hover:bg-cyan-500/20 transition-all shadow-[inset_0_0_10px_rgba(6,182,212,0.1)]">
                <Layout size={22} />
              </div>
              <h3 className="text-white font-bold text-lg mb-3">Management Dashboard</h3>
              <p className="text-zinc-400 text-sm leading-relaxed font-light">
                Editor data interaktif yang responsif dengan efek visual Glassmorphism dan Neo-Glow untuk memantau kemajuan portofolio digital.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800 hover:border-blue-500/30 transition-all text-left shadow-md group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6 group-hover:bg-blue-500/20 transition-all shadow-[inset_0_0_10px_rgba(59,130,246,0.1)]">
                <FileText size={22} />
              </div>
              <h3 className="text-white font-bold text-lg mb-3">ATS-Friendly Resume</h3>
              <p className="text-zinc-400 text-sm leading-relaxed font-light">
                Mesin kompilasi PDF sekali-klik yang langsung meracik data Anda ke format satu-kolom standar seleksi rekruitmen kerja internasional.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800 hover:border-emerald-500/30 transition-all text-left shadow-md group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6 group-hover:bg-emerald-500/20 transition-all shadow-[inset_0_0_10px_rgba(16,185,129,0.1)]">
                <Shield size={22} />
              </div>
              <h3 className="text-white font-bold text-lg mb-3">Control Room Admin</h3>
              <p className="text-zinc-400 text-sm leading-relaxed font-light">
                Monitor aktivitas user, log penarikan CV, notifikasi otomatis, dan analisis statistik terpusat melalui panel kendali admin terverifikasi.
              </p>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="keunggulan" className="w-full max-w-5xl py-20 grid md:grid-cols-2 gap-12 items-center scroll-mt-28">
          <div className="space-y-6 text-left">
            <h2 className="text-3xl font-black text-white leading-tight">
              Mengapa Menggunakan <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">HgzPort?</span>
            </h2>
            <p className="text-zinc-400 text-base leading-relaxed font-light">
              Membangun kehadiran profesional digital tidak pernah semudah ini. Kami menyediakan infrastruktur yang kokoh untuk membantu karir Anda melejit.
            </p>

            <div className="space-y-3.5">
              <div className="flex gap-3 items-center">
                <CheckCircle2 className="text-cyan-400 shrink-0" size={20} />
                <span className="text-zinc-200 text-sm">Desain Modern Minimalis & Adaptif Gelap-Terang</span>
              </div>
              <div className="flex gap-3 items-center">
                <CheckCircle2 className="text-cyan-400 shrink-0" size={20} />
                <span className="text-zinc-200 text-sm">Keamanan data berlapis menggunakan enkripsi database</span>
              </div>
              <div className="flex gap-3 items-center">
                <CheckCircle2 className="text-cyan-400 shrink-0" size={20} />
                <span className="text-zinc-200 text-sm">Notifikasi real-time & integrasi log sistem audit</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl bg-zinc-900/20 border border-zinc-900 space-y-2 text-left">
              <div className="text-cyan-400 font-bold text-3xl">100%</div>
              <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider">ATS Compatible</div>
            </div>
            <div className="p-6 rounded-2xl bg-zinc-900/20 border border-zinc-900 space-y-2 text-left">
              <div className="text-cyan-400 font-bold text-3xl">&lt; 1s</div>
              <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Generate Speed</div>
            </div>
            <div className="p-6 rounded-2xl bg-zinc-900/20 border border-zinc-900 space-y-2 text-left">
              <div className="text-cyan-400 font-bold text-3xl">Active</div>
              <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Audit Log</div>
            </div>
            <div className="p-6 rounded-2xl bg-zinc-900/20 border border-zinc-900 space-y-2 text-left">
              <div className="text-cyan-400 font-bold text-3xl">Full</div>
              <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Control Center</div>
            </div>
          </div>
        </section>

        {/* CTA Banner Section */}
        <section className="w-full max-w-5xl rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 border border-zinc-800/80 p-8 sm:p-12 relative overflow-hidden shadow-2xl flex flex-col md:flex-row justify-between items-center gap-8 text-left group">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-cyan-500/10 blur-[60px]" />

          <div className="space-y-3 relative z-10">
            <h3 className="text-2xl sm:text-3xl font-black text-white">Siap Memulai Sihir Anda?</h3>
            <p className="text-zinc-400 text-sm sm:text-base max-w-xl font-light">
              Daftar sekarang secara gratis dan buat portofolio profesional Anda pertama kali.
            </p>
          </div>

          <Link
            href="/register"
            className="w-full md:w-auto px-8 py-4 bg-white hover:bg-zinc-200 text-zinc-950 font-bold rounded-xl transition-all shadow-[0_0_30px_rgba(255,255,255,0.15)] flex items-center justify-center gap-2 group shrink-0"
          >
            Daftar Gratis <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </section>

      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-zinc-900 bg-zinc-950 py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-[10px] text-zinc-950">
              H
            </div>
            <span className="text-sm font-bold tracking-tight text-white">HgzPort</span>
          </div>

          <p className="text-xs text-zinc-600">
            &copy; {new Date().getFullYear()} HgzPort. Didesain secara profesional & elegan.
          </p>

          <div className="flex gap-4 text-xs text-zinc-500">
            <a href="https://nextjs.org" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1">NextJS <ArrowUpRight size={10} /></a>
            <a href="https://prisma.io" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1">Prisma <ArrowUpRight size={10} /></a>
            <a href="https://tailwindcss.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1">Tailwind <ArrowUpRight size={10} /></a>
          </div>
        </div>
      </footer>

    </div>
  );
}
