'use client';

import { useState } from 'react';
import { User, Bell, Save, Loader2, Info, ShieldCheck, Mail, Calendar, Layers } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface SettingsClientProps {
  initialName: string;
  email: string;
  initialEmailNotification: boolean;
  createdAt: Date;
  totalPortfolios: number;
}

export default function SettingsClient({
  initialName,
  email,
  initialEmailNotification,
  createdAt,
  totalPortfolios
}: SettingsClientProps) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailNotification, setEmailNotification] = useState(initialEmailNotification);
  
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingNotif, setIsSavingNotif] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Nama tidak boleh kosong');
    if (password && password !== confirmPassword) {
      return toast.error('Password baru dan konfirmasi tidak cocok');
    }
    if (password && password.length < 8) {
      return toast.error('Password minimal 8 karakter');
    }

    setIsSavingProfile(true);
    try {
      const res = await fetch('/api/dashboard/settings/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password: password || undefined })
      });

      if (!res.ok) throw new Error('Gagal menyimpan profil');
      
      toast.success('Profil berhasil diperbarui');
      setPassword('');
      setConfirmPassword('');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleToggleNotification = async () => {
    const newValue = !emailNotification;
    setEmailNotification(newValue);
    setIsSavingNotif(true);

    try {
      const res = await fetch('/api/dashboard/settings/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailNotification: newValue })
      });

      if (!res.ok) {
        throw new Error('Gagal menyimpan preferensi');
      }
      toast.success(newValue ? 'Notifikasi email diaktifkan' : 'Notifikasi email dinonaktifkan');
    } catch (error: any) {
      setEmailNotification(!newValue);
      toast.error(error.message);
    } finally {
      setIsSavingNotif(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      
      {/* Background glow effects specifically for settings card */}
      <div className="absolute top-[10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-10%] w-[350px] h-[350px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

      {/* Profile Section */}
      <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/80 rounded-2xl overflow-hidden shadow-[0_15px_30px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.03)] relative group transition-all duration-300 hover:border-cyan-500/20">
        
        {/* Top Glowing edge accent */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
        
        <div className="p-5 sm:p-6 border-b border-zinc-800/80 bg-zinc-950/40 flex items-center">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 mr-3 border border-cyan-500/20 shadow-[inset_0_0_8px_rgba(6,182,212,0.1)]">
            <User size={18} />
          </div>
          <h2 className="text-lg font-bold text-white tracking-wide">Profil Akun</h2>
        </div>

        <form onSubmit={handleSaveProfile} className="p-5 sm:p-6 space-y-6 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">Nama Lengkap</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-950/80 border border-zinc-800/85 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/20 transition-all duration-300 placeholder:text-zinc-600"
                required
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">Email Utama</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full bg-zinc-900/30 border border-zinc-800/40 rounded-xl px-4 py-3 text-zinc-500 text-sm cursor-not-allowed select-none"
                />
                <Mail size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600" />
              </div>
            </div>
          </div>
          
          <div className="pt-6 border-t border-zinc-800/50">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="w-4 h-4 text-cyan-500" />
              <h3 className="text-sm font-bold text-white tracking-wide">Ubah Password Keamanan</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">Password Baru</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Kosongkan jika tidak ingin diubah"
                  className="w-full bg-zinc-950/80 border border-zinc-800/85 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/20 transition-all duration-300 placeholder:text-zinc-600"
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">Konfirmasi Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password baru"
                  className="w-full bg-zinc-950/80 border border-zinc-800/85 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/20 transition-all duration-300 placeholder:text-zinc-600"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSavingProfile}
              className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl flex items-center transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSavingProfile ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Simpan Profil
            </button>
          </div>
        </form>
      </div>

      {/* Notifications Section */}
      <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/80 rounded-2xl overflow-hidden shadow-[0_15px_30px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.03)] relative group transition-all duration-300 hover:border-amber-500/20">
        
        {/* Top Glowing edge accent */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
        
        <div className="p-5 sm:p-6 border-b border-zinc-800/80 bg-zinc-950/40 flex items-center">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 mr-3 border border-amber-500/20 shadow-[inset_0_0_8px_rgba(245,158,11,0.1)]">
            <Bell size={18} />
          </div>
          <h2 className="text-lg font-bold text-white tracking-wide">Preferensi Notifikasi</h2>
        </div>
        
        <div className="p-5 sm:p-6 relative z-10">
          <div className="flex items-start sm:items-center justify-between gap-6">
            <div className="space-y-1">
              <h3 className="text-white font-bold text-sm tracking-wide">Notifikasi Email</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-light">
                Terima email pemberitahuan ketika ada pesan kontak baru yang masuk di salah satu portofolio Anda.
              </p>
            </div>
            
            <button
              onClick={handleToggleNotification}
              disabled={isSavingNotif}
              className={`relative inline-flex h-6.5 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] ${
                emailNotification ? 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.4)]' : 'bg-zinc-800'
              }`}
            >
              <span className={`pointer-events-none inline-block h-5.5 w-5.5 transform rounded-full bg-white shadow-[0_2px_4px_rgba(0,0,0,0.2)] ring-0 transition duration-200 ease-in-out ${
                emailNotification ? 'translate-x-5.5' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Account Info Section */}
      <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/80 rounded-2xl overflow-hidden shadow-[0_15px_30px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.03)] relative group transition-all duration-300 hover:border-blue-500/20">
        
        {/* Top Glowing edge accent */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
        
        <div className="p-5 sm:p-6 border-b border-zinc-800/80 bg-zinc-950/40 flex items-center">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 mr-3 border border-blue-500/20 shadow-[inset_0_0_8px_rgba(59,130,246,0.1)]">
            <Info size={18} />
          </div>
          <h2 className="text-lg font-bold text-white tracking-wide">Informasi Akun</h2>
        </div>
        
        <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
          <div className="bg-zinc-950/60 border border-zinc-800/60 rounded-2xl p-5 flex items-center gap-4 transition-all duration-300 hover:border-cyan-500/20">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/5 flex items-center justify-center text-cyan-400 shrink-0 border border-cyan-500/10">
              <Calendar size={18} />
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 block uppercase tracking-wider font-bold">Tanggal Bergabung</span>
              <span className="text-white text-sm font-bold tracking-wide">{new Date(createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
          
          <div className="bg-zinc-950/60 border border-zinc-800/60 rounded-2xl p-5 flex items-center gap-4 transition-all duration-300 hover:border-cyan-500/20">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/5 flex items-center justify-center text-cyan-400 shrink-0 border border-cyan-500/10">
              <Layers size={18} />
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 block uppercase tracking-wider font-bold">Total Portofolio</span>
              <span className="text-white text-sm font-bold tracking-wide">{totalPortfolios} Portofolio Aktif</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
