'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import {
  FileText, Shield, ArrowRight, Layout, Cpu,
  CheckCircle2, ArrowUpRight, MousePointer, Sparkles, Zap, Globe, Radar
} from 'lucide-react';

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);

  // 60FPS Fluid Physics Engine for Mouse Tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const [isMounted, setIsMounted] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleReveal = () => {
    setShowContent(true);
    setTimeout(() => {
      document.getElementById('fitur')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const x = (clientX / window.innerWidth - 0.5) * 20; // Range -10 to 10
    const y = (clientY / window.innerHeight - 0.5) * 20;
    mouseX.set(x);
    mouseY.set(y);
  };

  // Scroll Parallax for Hero
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const yHero = useTransform(scrollYProgress, [0, 1], [0, 250]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const scaleHero = useTransform(scrollYProgress, [0, 0.4], [1, 0.95]);

  // Derived transforms for true 8D Parallax (tied to smooth spring)
  const orbX1 = useTransform(smoothX, (x) => x * -2.5);
  const orbY1 = useTransform(smoothY, (y) => y * -2.5);
  const orbX2 = useTransform(smoothX, (x) => x * 2.5);
  const orbY2 = useTransform(smoothY, (y) => y * 2.5);

  const panelRotateX = useTransform(smoothY, (y) => y * -0.5);
  const panelRotateY = useTransform(smoothX, (x) => x * 0.5);
  const panelX = useTransform(smoothX, (x) => x * 0.8);
  const panelY = useTransform(smoothY, (y) => y * 0.8);

  const floatLeftX = useTransform(smoothX, (x) => x * -1.2 - 100);
  const floatLeftY = useTransform(smoothY, (y) => y * -1.2 - 20);

  const floatRightX = useTransform(smoothX, (x) => x * 1.5 + 80);
  const floatRightY = useTransform(smoothY, (y) => y * 1.5 + 80);

  const spotlightX = useTransform(smoothX, x => (x * 50) + (typeof window !== 'undefined' ? window.innerWidth / 2 : 0) - 300);
  const spotlightY = useTransform(smoothY, y => (y * 50) + (typeof window !== 'undefined' ? window.innerHeight / 2 : 0) - 300);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-[#020617] text-zinc-50 relative overflow-x-hidden flex flex-col justify-between font-sans selection:bg-[#00f0ff]/30 selection:text-[#00f0ff]"
    >
      {/* 1. Interactive Spotlight tied to cursor (Hidden on mobile) */}
      {isMounted && (
        <motion.div
          className="fixed w-[600px] h-[600px] bg-[#00f0ff]/5 rounded-full blur-[150px] pointer-events-none z-50 hidden lg:block"
          style={{ x: spotlightX, y: spotlightY }}
        />
      )}

      {/* 8D Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          style={{ x: orbX1, y: orbY1 }}
          className="absolute -top-[20%] -left-[10%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] rounded-full bg-[#00f0ff]/15 blur-[150px]"
        />
        <motion.div
          style={{ x: orbX2, y: orbY2 }}
          className="absolute top-[40%] -right-[10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full bg-[#b026ff]/15 blur-[140px]"
        />
      </div>

      <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-0 mix-blend-screen mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)"></div>

      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-[#020617]/50 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00f0ff] to-[#b026ff] flex items-center justify-center font-black text-[#020617] shadow-[0_0_20px_rgba(0,240,255,0.4)]">
              HP
            </div>
            <span className="text-2xl font-black tracking-tight text-white montenegrin-gothic-one-regular">
              Hgz<span className="text-[#00f0ff]">Port</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-1 p-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md shadow-inner shadow-white/5">
            <a href="#fitur" className="px-5 py-2 rounded-full text-sm font-medium text-zinc-300 hover:text-[#00f0ff] hover:bg-[#00f0ff]/10 transition-all duration-300 google-sans-flex-regular">Visual Editor</a>
            <a href="#keunggulan" className="px-5 py-2 rounded-full text-sm font-medium text-zinc-300 hover:text-[#b026ff] hover:bg-[#b026ff]/10 transition-all duration-300 google-sans-flex-regular">ATS Engine</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="px-5 py-2 rounded-full text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/10 transition-all duration-300 google-sans-flex-regular border border-transparent hover:border-white/10">
              Masuk
            </Link>
            <Link href="/register" className="relative group px-6 py-2 rounded-full bg-gradient-to-r from-[#00f0ff]/10 to-[#b026ff]/10 border border-[#00f0ff]/30 text-white text-sm font-bold transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:border-[#00f0ff]/60 active:scale-95 overflow-hidden">
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 z-0" />
              <span className="relative z-10 google-sans-flex-regular tracking-wide group-hover:text-[#00f0ff] transition-colors">Daftar Gratis</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <motion.main
        style={{ y: yHero, opacity: opacityHero, scale: scaleHero }}
        className="flex-1 relative z-10 w-full max-w-7xl mx-auto px-6 pt-36 pb-20 flex flex-col items-center min-h-screen"
      >
        <div className="text-center space-y-6 max-w-4xl mx-auto mb-20 relative w-full">

          {/* Cyber Mega Mendung Left */}
          <motion.div 
            style={{ x: useTransform(smoothX, x => x * -2), y: useTransform(smoothY, y => y * -2) }}
            className="absolute -left-20 sm:-left-64 top-0 w-80 sm:w-[500px] opacity-80 hidden lg:block z-0 pointer-events-none"
          >
            <div className="w-full h-full relative" style={{ WebkitMaskImage: 'linear-gradient(to right, black 30%, transparent 90%)', maskImage: 'linear-gradient(to right, black 30%, transparent 90%)' }}>
               <img src="/cyber_mega_mendung.png" alt="Mega Mendung Batik" className="w-full h-full object-contain transform -scale-x-100 drop-shadow-[0_0_15px_rgba(0,240,255,0.4)]" />
            </div>
          </motion.div>

          {/* Cyber Mega Mendung Right */}
          <motion.div 
            style={{ x: useTransform(smoothX, x => x * 2), y: useTransform(smoothY, y => y * 2) }}
            className="absolute -right-20 sm:-right-64 top-20 w-80 sm:w-[500px] opacity-80 hidden lg:block z-0 pointer-events-none"
          >
            <div className="w-full h-full relative" style={{ WebkitMaskImage: 'linear-gradient(to left, black 30%, transparent 90%)', maskImage: 'linear-gradient(to left, black 30%, transparent 90%)' }}>
               <img src="/cyber_mega_mendung.png" alt="Mega Mendung Batik" className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(176,38,255,0.4)]" />
            </div>
          </motion.div>

          {/* HagzPort Version 2.0 Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative inline-flex group mb-6"
          >
            <div className="absolute transition-all duration-1000 opacity-70 -inset-px bg-gradient-to-r from-[#00f0ff] via-[#b026ff] to-[#00f0ff] rounded-full blur-md group-hover:opacity-100 group-hover:-inset-1 group-hover:duration-200 animate-gradient-x"></div>
            <div className="relative inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#020617] border border-white/10 text-sm font-bold text-white shadow-2xl">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00f0ff] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00f0ff] shadow-[0_0_8px_#00f0ff]"></span>
              </span>
              HagzPort <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] to-[#b026ff] montenegrin-gothic-one-regular tracking-widest ml-1">VERSION 2.0</span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tighter text-white leading-[1.05] montenegrin-gothic-one-regular drop-shadow-2xl"
          >
            SULAP PORTFOLIO ANDA <br className="hidden sm:block" />
            MENJADI CV ATS DAN <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00f0ff] via-sky-400 to-[#b026ff] animate-gradient-x drop-shadow-[0_0_15px_rgba(0,240,255,0.5)]">PUBLISH GLOBAL.</span>
          </motion.h1>

          {/* Deskripsi Singkat Berorientasi Pengguna */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="google-sans-flex-regular text-zinc-300 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed font-light relative z-10 drop-shadow-md bg-[#020617]/40 sm:bg-transparent p-4 rounded-xl"
          >
            Sebuah ekosistem karir terpadu yang mendefinisikan ulang cara Anda tampil di dunia profesional. Dari Dashboard User berestetika transparan untuk menyusun portofolio interaktif, hingga mesin Generate CV ATS berskala global yang melacak peluang karir secara real-time.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="pt-6 relative z-10"
          >
            <Link href="/register" className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#b026ff] text-[#020617] text-base font-black transition-all hover:shadow-[0_0_40px_rgba(0,240,255,0.6)] hover:scale-105 active:scale-95 flex items-center justify-center gap-2 max-w-xs mx-auto montenegrin-gothic-one-regular tracking-widest">
              AKTIFKAN SEKARANG <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>

        {/* Gambar dan Video (Simulasi 8D Panel Fisika) */}
        <div className="perspective-1200 w-full max-w-5xl relative z-20 h-[500px] flex items-center justify-center">

          {/* Back Left Panel - Editor Simulation */}
          <motion.div
            style={{ x: floatLeftX, y: floatLeftY, rotateY: 15, rotateX: 5 }}
            className="absolute left-0 lg:left-10 top-10 w-64 h-80 glass-panel border border-[#b026ff]/40 rounded-2xl p-5 shadow-[0_20px_50px_rgba(176,38,255,0.2)] z-10 opacity-90 hidden md:block"
          >
            <div className="flex items-center gap-2 mb-6">
              <Layout className="w-5 h-5 text-[#b026ff]" />
              <span className="text-[10px] font-bold text-white tracking-widest uppercase">Visual Editor</span>
            </div>
            <div className="space-y-4">
              <div className="h-10 w-full bg-[#b026ff]/10 border border-[#b026ff]/20 rounded-lg p-2 flex items-center gap-2">
                <div className="w-4 h-4 rounded-sm bg-[#b026ff]/40"></div>
                <div className="w-24 h-2 bg-[#b026ff]/30 rounded"></div>
              </div>
              <div className="h-10 w-full bg-[#b026ff]/10 border border-[#b026ff]/20 rounded-lg p-2 flex items-center gap-2 relative overflow-hidden">
                <motion.div
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-[#b026ff]/30 to-transparent skew-x-12"
                />
                <div className="w-4 h-4 rounded-sm bg-[#b026ff]/40"></div>
                <div className="w-16 h-2 bg-[#b026ff]/30 rounded"></div>
              </div>
              <div className="h-10 w-full bg-[#b026ff]/10 border border-[#b026ff]/20 rounded-lg p-2 flex items-center gap-2">
                <div className="w-4 h-4 rounded-sm bg-[#b026ff]/40"></div>
                <div className="w-20 h-2 bg-[#b026ff]/30 rounded"></div>
              </div>
            </div>
          </motion.div>

          {/* Back Right Panel - Global Page Simulation */}
          <motion.div
            style={{ x: floatRightX, y: floatRightY, rotateY: -15, rotateX: 5 }}
            className="absolute right-0 lg:right-10 top-10 w-64 h-80 glass-panel border border-[#00f0ff]/40 rounded-2xl p-5 shadow-[0_20px_50px_rgba(0,240,255,0.2)] z-10 opacity-90 hidden md:block"
          >
            <div className="flex items-center gap-2 mb-6">
              <Globe className="w-5 h-5 text-[#00f0ff]" />
              <span className="text-[10px] font-bold text-white tracking-widest uppercase">Global Page</span>
            </div>
            
            <div className="space-y-4 flex flex-col items-center justify-center mt-12 relative">
              {/* Radar pulse effect */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-4">
                <div className="w-24 h-24 rounded-full border border-[#00f0ff]/20 flex items-center justify-center relative">
                  <div className="w-16 h-16 rounded-full border border-[#00f0ff]/40 flex items-center justify-center bg-[#020617]/50 backdrop-blur-md relative z-10">
                    <Globe className="w-8 h-8 text-[#00f0ff]" />
                  </div>
                  <motion.div
                    animate={{ scale: [1, 2.5], opacity: [0.8, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                    className="absolute inset-0 rounded-full border border-[#00f0ff] z-0"
                  />
                </div>
              </div>

              {/* Status logs */}
              <div className="absolute -bottom-24 w-full space-y-2">
                <div className="h-6 w-full bg-[#00f0ff]/10 border border-[#00f0ff]/20 rounded p-1.5 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-pulse shadow-[0_0_8px_#00f0ff]"></div>
                  <div className="w-20 h-1.5 bg-[#00f0ff]/30 rounded"></div>
                </div>
                <div className="h-6 w-4/5 bg-[#00f0ff]/10 border border-[#00f0ff]/20 rounded p-1.5 flex items-center gap-2 ml-auto">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-pulse shadow-[0_0_8px_#00f0ff]" style={{ animationDelay: '0.5s' }}></div>
                  <div className="w-16 h-1.5 bg-[#00f0ff]/30 rounded"></div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Front Center Panel - Dashboard Main */}
          <motion.div
            style={{ x: panelX, y: panelY, rotateY: panelRotateY, rotateX: panelRotateX }}
            className="absolute w-[90%] max-w-2xl glass-panel border border-[#00f0ff]/50 rounded-2xl p-4 shadow-[0_40px_120px_rgba(0,240,255,0.2),inset_0_1px_30px_rgba(255,255,255,0.08)] z-30 bg-[#020617]/70 backdrop-blur-3xl"
          >
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent" />
            <div className="flex justify-between items-center pb-3 border-b border-white/10 mb-4 px-2">
              <div className="flex gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-500/80 shadow-[0_0_10px_rgba(234,179,8,0.5)]"></span>
                <span className="w-3 h-3 rounded-full bg-green-500/80 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
              </div>
              <div className="bg-[#020617] border border-white/10 rounded-md px-6 py-1 text-[10px] text-zinc-400 w-1/2 text-center font-mono truncate">
                hgengine.com/live-preview
              </div>
              <div className="w-12"></div>
            </div>

            <div className="h-64 flex gap-4">
              <div className="w-full sm:w-2/3 space-y-4">
                <div className="flex gap-4">
                  <div className="w-1/2 h-24 bg-white/5 rounded-xl border border-white/10 relative overflow-hidden group">
                    <div className="absolute bottom-0 right-0 w-16 h-16 bg-[#00f0ff]/30 blur-2xl group-hover:bg-[#00f0ff]/50 transition-colors"></div>
                    <div className="p-4 text-white font-bold text-xs uppercase tracking-wider">ATS Score</div>
                    <div className="px-4 text-3xl font-black text-[#00f0ff] drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]">98%</div>
                  </div>
                  <div className="w-1/2 h-24 bg-white/5 rounded-xl border border-white/10 relative overflow-hidden group">
                    <div className="absolute bottom-0 right-0 w-16 h-16 bg-[#b026ff]/30 blur-2xl group-hover:bg-[#b026ff]/50 transition-colors"></div>
                    <div className="p-4 text-white font-bold text-xs uppercase tracking-wider">Render Time</div>
                    <div className="px-4 text-3xl font-black text-[#b026ff] drop-shadow-[0_0_10px_rgba(176,38,255,0.5)]">0.4s</div>
                  </div>
                </div>
                <div className="w-full h-32 bg-gradient-to-br from-[#00f0ff]/10 to-[#b026ff]/10 rounded-xl border border-white/10 relative overflow-hidden flex items-center justify-center p-4">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="w-full max-w-[200px] h-20 glass-panel border border-white/20 rounded-lg flex flex-col justify-center items-center shadow-xl"
                  >
                    <div className="w-3/4 h-2 bg-zinc-700 rounded-full mb-2"></div>
                    <div className="w-1/2 h-2 bg-zinc-700 rounded-full mb-2"></div>
                    <div className="w-5/6 h-2 bg-[#00f0ff]/40 rounded-full"></div>
                  </motion.div>
                </div>
              </div>
              <div className="w-1/3 border-l border-white/10 pl-4 space-y-3 hidden sm:flex flex-col justify-center">
                <div className="h-8 w-full bg-[#00f0ff] rounded-lg shadow-[0_0_20px_rgba(0,240,255,0.4)] flex items-center justify-center">
                  <Zap className="w-4 h-4 text-[#020617] mr-1" />
                  <span className="text-[10px] font-black text-[#020617] uppercase">Generate PDF</span>
                </div>
                <div className="h-8 w-full glass-panel rounded-lg flex items-center justify-center border border-white/10">
                  <span className="text-[10px] font-bold text-white uppercase">Live Preview</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll Down Indicator */}
        <motion.button
          onClick={handleReveal}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="absolute bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-50 group cursor-pointer bg-transparent border-none outline-none"
        >
          <span className="text-[10px] font-bold tracking-[0.3em] text-zinc-400 uppercase group-hover:text-[#00f0ff] transition-colors">
            {showContent ? "Akses Terbuka" : "Lihat Lebih Lanjut"}
          </span>
          <div className={`w-6 h-10 rounded-full border-2 border-white/20 group-hover:border-[#00f0ff]/50 flex justify-center p-1 relative overflow-hidden transition-colors glass-panel ${showContent ? 'border-[#00f0ff]/80 shadow-[0_0_15px_rgba(0,240,255,0.6)]' : ''}`}>
            <motion.div
              animate={{ y: [0, 14, 0], opacity: [1, 0, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className={`w-1.5 h-2 bg-gradient-to-b from-[#00f0ff] to-[#b026ff] rounded-full ${showContent ? 'shadow-[0_0_15px_#00f0ff]' : 'shadow-[0_0_8px_#00f0ff]'}`}
            />
          </div>
        </motion.button>
      </motion.main>

      <AnimatePresence>
        {showContent && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 150 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.2, type: "spring", bounce: 0.3 }}
            className="w-full origin-top"
          >
            {/* Manfaat Produk (Fitur-Fitur Pengguna Memukau) */}
            <section id="fitur" className="w-full py-32 relative z-10 border-t border-white/5 bg-[#020617]/90 backdrop-blur-3xl">
              <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-24">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-[#b026ff]/30 text-xs font-semibold text-[#b026ff] mb-6"
                  >
                    <Cpu size={14} /> FITUR KELAS ENTERPRISE
                  </motion.div>
                  <h2 className="text-4xl sm:text-6xl font-black text-white montenegrin-gothic-one-regular mb-6 tracking-tight">KENDALI KARIR <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] to-[#b026ff] drop-shadow-[0_0_20px_rgba(176,38,255,0.4)]">MUTLAK.</span></h2>
                  <p className="text-zinc-400 google-sans-flex-regular max-w-2xl mx-auto text-base sm:text-lg">Tinggalkan metode lama. Platform ini dirancang untuk mendongkrak visibilitas profesional Anda dengan serangkaian instrumen mutakhir.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  <motion.div
                    whileHover={{ y: -10 }}
                    className="glass-panel glass-panel-hover rounded-[2rem] p-8 relative overflow-hidden group border border-white/10 hover:border-[#00f0ff]/50"
                  >
                    <div className="absolute -top-20 -right-20 w-48 h-48 bg-[#00f0ff]/10 rounded-full blur-[60px] group-hover:bg-[#00f0ff]/30 transition-colors duration-500"></div>
                    <Layout className="w-12 h-12 text-[#00f0ff] mb-8 drop-shadow-[0_0_15px_rgba(0,240,255,0.6)]" />
                    <h3 className="text-2xl font-bold text-white mb-4 montenegrin-gothic-one-regular tracking-wide">Interactive Dashboard</h3>
                    <p className="text-base text-zinc-400 font-light leading-relaxed google-sans-flex-regular">Kendalikan identitas digital Anda melalui Dashboard User futuristik. Edit data portofolio dengan kebebasan tanpa batas dan nikmati estetika visual yang responsif seketika.</p>
                  </motion.div>

                  <motion.div
                    whileHover={{ y: -10 }}
                    className="glass-panel glass-panel-hover rounded-[2rem] p-8 relative overflow-hidden group border border-white/10 hover:border-[#b026ff]/50"
                  >
                    <div className="absolute -top-20 -right-20 w-48 h-48 bg-[#b026ff]/10 rounded-full blur-[60px] group-hover:bg-[#b026ff]/30 transition-colors duration-500"></div>
                    <Zap className="w-12 h-12 text-[#b026ff] mb-8 drop-shadow-[0_0_15px_rgba(176,38,255,0.6)]" />
                    <h3 className="text-2xl font-bold text-white mb-4 montenegrin-gothic-one-regular tracking-wide">Instant ATS Engine</h3>
                    <p className="text-base text-zinc-400 font-light leading-relaxed google-sans-flex-regular">Mesin kompilasi secepat kilat kami secara presisi merender portofolio Anda menjadi resume 1-kolom berstandar internasional yang dijamin tembus seleksi otomatis mesin rekrutmen.</p>
                  </motion.div>

                  <motion.div
                    whileHover={{ y: -10 }}
                    className="glass-panel glass-panel-hover rounded-[2rem] p-8 relative overflow-hidden group border border-white/10 hover:border-white/40"
                  >
                    <div className="absolute -top-20 -right-20 w-48 h-48 bg-white/5 rounded-full blur-[60px] group-hover:bg-white/15 transition-colors duration-500"></div>
                    <Globe className="w-12 h-12 text-white mb-8 drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]" />
                    <h3 className="text-2xl font-bold text-white mb-4 montenegrin-gothic-one-regular tracking-wide">Global Connect Hub</h3>
                    <p className="text-base text-zinc-400 font-light leading-relaxed google-sans-flex-regular">Anda tidak sendirian. Halaman Global HgzPort menyatukan seluruh portofolio pengguna dalam satu semesta, memberikan Anda panggung untuk bersinar dan berjejaring di kancah dunia.</p>
                  </motion.div>
                </div>
              </div>
            </section>

            {/* Keunggulan (Live Job Matcher / Tidak ada unsur Admin) */}
            <section id="keunggulan" className="w-full py-32 relative z-10 bg-[#020617] overflow-hidden border-t border-white/5">
              <div className="absolute top-0 left-[20%] w-[500px] h-[500px] bg-[#00f0ff]/5 rounded-full blur-[150px] pointer-events-none"></div>
              <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-20 items-center">
                <div className="space-y-8 relative z-10">
                  <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight montenegrin-gothic-one-regular">
                    Sistem Pelacakan Lowongan <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] to-[#b026ff] drop-shadow-[0_0_10px_rgba(0,240,255,0.3)]">Terotomatisasi</span>
                  </h2>
                  <p className="text-zinc-400 text-lg leading-relaxed font-light google-sans-flex-regular">
                    HgzPort bukan sekadar tempat menyimpan portofolio. Sistem pintar kami dirancang untuk melacak dan memetakan peluang pekerjaan secara real-time, menyorot profil keahlian Anda ke dalam radar rekruter global.
                  </p>

                  <div className="space-y-4 google-sans-flex-regular mt-8">
                    <div className="flex gap-4 items-center">
                      <div className="w-8 h-8 rounded-full bg-[#00f0ff]/10 border border-[#00f0ff]/30 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="text-[#00f0ff]" size={16} />
                      </div>
                      <span className="text-zinc-200 text-sm">Navigasi Karir Real-time & Sinkronisasi Global</span>
                    </div>
                    <div className="flex gap-4 items-center">
                      <div className="w-8 h-8 rounded-full bg-[#00f0ff]/10 border border-[#00f0ff]/30 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="text-[#00f0ff]" size={16} />
                      </div>
                      <span className="text-zinc-200 text-sm">Validasi Otomatis Kesesuaian Keterampilan (Skill Matching)</span>
                    </div>
                  </div>
                </div>

                <div className="relative perspective-1000">
                  <motion.div
                    whileHover={{ rotateY: -10, rotateX: 5 }}
                    transition={{ type: "spring", damping: 20 }}
                    className="w-full glass-panel border border-[#b026ff]/30 rounded-3xl p-8 relative overflow-hidden shadow-[0_20px_50px_rgba(176,38,255,0.1)]"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#00f0ff]/20 rounded-full blur-[60px]"></div>
                    <div className="flex gap-4 mb-6">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#00f0ff] to-[#b026ff] p-0.5">
                        <div className="w-full h-full bg-[#020617] rounded-full flex items-center justify-center font-bold text-[#00f0ff]">
                          <Radar className="w-5 h-5" />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-lg">Live Job Matcher</h4>
                        <p className="text-xs text-[#00f0ff]">Radar Portofolio Aktif</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="w-full h-12 bg-white/5 rounded-xl border border-white/10 flex items-center px-4">
                        <span className="text-xs text-zinc-400 font-mono">Scanning Global Opportunities...</span>
                        <span className="ml-auto text-[10px] text-[#00f0ff] font-bold">OK</span>
                      </div>
                      <div className="w-full h-12 bg-white/5 rounded-xl border border-white/10 flex items-center px-4">
                        <span className="text-xs text-zinc-400 font-mono">Matching Frontend Developer Role...</span>
                        <span className="ml-auto text-[10px] text-[#b026ff] font-bold">98% MATCH</span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </section>

            {/* Modern Footer & Bottom CTA */}
            <footer className="relative z-10 w-full bg-[#01030a]">
              {/* Bottom CTA */}
              <div className="max-w-4xl mx-auto px-6 py-24 text-center border-b border-white/5">
                <h2 className="text-3xl sm:text-5xl font-black text-white montenegrin-gothic-one-regular mb-6">Publikasikan Mahakarya <span className="text-[#00f0ff]">Sekarang.</span></h2>
                <p className="text-zinc-400 mb-8 max-w-xl mx-auto google-sans-flex-regular">Waktu Anda terlalu berharga untuk dihabiskan dengan editor kuno. Bangun portofolio Anda dalam hitungan detik dan buka gerbang karir global Anda.</p>
                <Link href="/register" className="inline-flex items-center gap-2 px-10 py-5 rounded-2xl bg-white text-[#020617] text-lg font-black transition-all hover:bg-zinc-200 hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.2)] montenegrin-gothic-one-regular tracking-widest">
                  DAFTAR GRATIS <ArrowRight size={20} />
                </Link>
              </div>

              <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#00f0ff] to-[#b026ff] flex items-center justify-center font-black text-xs text-[#020617] shadow-[0_0_10px_rgba(0,240,255,0.3)]">
                    HP
                  </div>
                  <span className="text-lg font-black tracking-tight text-white montenegrin-gothic-one-regular">HgzPort</span>
                </div>

                <div className="flex items-center gap-6">
                  <a href="https://www.instagram.com/hagz.el" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-[#b026ff] transition-all hover:scale-110">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
                  </a>
                  <a href="https://github.com/Hagz909" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-all hover:scale-110">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A4.8 4.8 0 0 0 8 18v4"></path></svg>
                  </a>
                  <a href="https://www.youtube.com/@ilhammusyafa4580" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-red-500 transition-all hover:scale-110">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
                  </a>
                </div>

                <p className="text-xs text-zinc-600 google-sans-flex-regular font-light">
                  &copy; {new Date().getFullYear()} Hak Cipta Dilindungi. Direkayasa eksklusif untuk karir profesional Anda.
                </p>
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
