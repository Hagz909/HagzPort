'use client';

import { useState, useEffect } from 'react';
import { Settings, User, Shield, Bell, AlertTriangle, Camera, Loader2, Save, LogOut } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

export default function AdminSettingsPage() {
  const { data: session, update } = useSession();
  
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);
  
  // Local state for profile inputs
  const [name, setName] = useState('');
  
  // Local state for password inputs
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  useEffect(() => {
    if (session?.user?.name) {
      setName(session.user.name);
    }
  }, [session]);
  
  // Dummy State for Toggles
  const [notifNewProject, setNotifNewProject] = useState(true);
  const [notifNewMessage, setNotifNewMessage] = useState(true);
  const [notifSound, setNotifSound] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Nama lengkap wajib diisi');

    setIsSavingProfile(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'profile', name })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      // Update session real-time so UI reacts immediately
      await update({ name });
      toast.success(data.message);
    } catch (error: any) {
      toast.error(error.message || 'Gagal menyimpan profil');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error('Konfirmasi password tidak cocok');
    }
    if (newPassword.length < 6) {
      return toast.error('Password baru minimal 6 karakter');
    }

    setIsSavingPassword(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'password', currentPassword, newPassword })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);

      toast.success(data.message);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.message || 'Gagal memperbarui sandi');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleSaveNotifications = () => {
    setIsSavingNotifications(true);
    setTimeout(() => setIsSavingNotifications(false), 1000);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto pb-10">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
              <Settings className="w-6 h-6 text-cyan-400" />
            </div>
            <h1 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-sky-600 drop-shadow-md">Pengaturan Akun</h1>
          </div>
          <p className="text-sm text-zinc-400">Kelola informasi profil, keamanan sandi, dan preferensi notifikasi Anda.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Profile & Security */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Card: Informasi Profil */}
          <div className="glass-panel rounded-2xl shadow-xl overflow-hidden relative group">
            <div className="absolute top-0 left-0 w-64 h-64 bg-cyan-500/5 blur-[80px] rounded-full pointer-events-none" />
            
            <div className="p-6 border-b border-zinc-800/50 flex items-center gap-3 relative z-10">
              <User className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white">Informasi Profil</h2>
            </div>
            
            <form onSubmit={handleSaveProfile} className="p-6 space-y-6 relative z-10">
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                {/* Avatar Uploader */}
                <div className="relative shrink-0 group/avatar cursor-pointer">
                  <div className="w-24 h-24 rounded-full bg-zinc-800 border-2 border-zinc-700 overflow-hidden flex items-center justify-center relative">
                    {/* Dummy avatar gradient */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/40 to-sky-500/20" />
                    <span className="text-2xl font-bold text-white relative z-10">
                      {name ? name.substring(0, 2).toUpperCase() : 'AU'}
                    </span>
                  </div>
                  <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity duration-300">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </div>
                
                {/* Input Fields */}
                <div className="flex-1 space-y-4 w-full">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1.5">Nama Lengkap</label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Masukkan nama lengkap"
                      className="w-full glass-panel rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/70 focus:shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1.5">Alamat Email (Tidak bisa diubah)</label>
                    <input 
                      type="email" 
                      value={session?.user?.email || ''}
                      disabled
                      className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-zinc-500 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end pt-2">
                <button 
                  type="submit"
                  disabled={isSavingProfile}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSavingProfile ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</>
                  ) : (
                    <><Save className="w-4 h-4" /> Simpan Profil</>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Card: Reset Password */}
          <div className="glass-panel rounded-2xl shadow-xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none" />
            
            <div className="p-6 border-b border-zinc-800/50 flex items-center gap-3 relative z-10">
              <Shield className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white">Keamanan & Sandi</h2>
            </div>
            
            <form onSubmit={handleUpdatePassword} className="p-6 space-y-5 relative z-10">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">Password Saat Ini</label>
                <input 
                  type="password" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Masukkan password saat ini"
                  className="w-full glass-panel rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/70 focus:shadow-[0_0_15px_rgba(16,185,129,0.15)] transition-all"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1.5">Password Baru</label>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full glass-panel rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/70 focus:shadow-[0_0_15px_rgba(16,185,129,0.15)] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1.5">Konfirmasi Password Baru</label>
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi password baru"
                    className="w-full glass-panel rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/70 focus:shadow-[0_0_15px_rgba(16,185,129,0.15)] transition-all"
                  />
                </div>
              </div>
              
              <div className="flex justify-end pt-2">
                <button 
                  type="submit"
                  disabled={isSavingPassword}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 font-semibold rounded-xl transition-all hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSavingPassword ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Memperbarui...</>
                  ) : (
                    <><Shield className="w-4 h-4" /> Perbarui Sandi</>
                  )}
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Right Column: Notifications & Danger Zone */}
        <div className="space-y-8">
          
          {/* Card: Notifikasi */}
          <div className="glass-panel rounded-2xl shadow-xl overflow-hidden relative">
            <div className="p-6 border-b border-zinc-800/50 flex items-center gap-3">
              <Bell className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white">Preferensi Notifikasi</h2>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-zinc-200">Proyek Baru</h4>
                  <p className="text-xs text-zinc-500 mt-0.5">Beritahu saya saat user menambah proyek</p>
                </div>
                <button 
                  onClick={() => { setNotifNewProject(!notifNewProject); handleSaveNotifications(); }}
                  className={`w-11 h-6 rounded-full transition-colors relative ${notifNewProject ? 'bg-cyan-500' : 'bg-zinc-700'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${notifNewProject ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-zinc-200">Pesan Masuk</h4>
                  <p className="text-xs text-zinc-500 mt-0.5">Terima peringatan pesan kontak baru</p>
                </div>
                <button 
                  onClick={() => { setNotifNewMessage(!notifNewMessage); handleSaveNotifications(); }}
                  className={`w-11 h-6 rounded-full transition-colors relative ${notifNewMessage ? 'bg-cyan-500' : 'bg-zinc-700'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${notifNewMessage ? 'left-6' : 'left-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-zinc-200">Suara Pemberitahuan</h4>
                  <p className="text-xs text-zinc-500 mt-0.5">Bunyikan efek suara saat ada notifikasi</p>
                </div>
                <button 
                  onClick={() => { setNotifSound(!notifSound); handleSaveNotifications(); }}
                  className={`w-11 h-6 rounded-full transition-colors relative ${notifSound ? 'bg-cyan-500' : 'bg-zinc-700'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${notifSound ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
            </div>
            
            {/* Tiny loader indicator for toggles */}
            {isSavingNotifications && (
              <div className="absolute top-6 right-6 flex items-center text-xs text-cyan-400 gap-1.5">
                <Loader2 className="w-3 h-3 animate-spin" /> <span>Menyimpan...</span>
              </div>
            )}
          </div>

          {/* Card: Danger Zone */}
          <div className="bg-red-500/5 backdrop-blur-md border border-red-500/20 rounded-2xl shadow-xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/5 blur-[60px] rounded-full pointer-events-none" />
            
            <div className="p-6 border-b border-red-900/30 flex items-center gap-3 relative z-10">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-bold text-red-500">Zona Bahaya</h2>
            </div>
            
            <div className="p-6 space-y-4 relative z-10">
              <p className="text-sm text-zinc-400 leading-relaxed">
                Tindakan di bawah ini dapat memutus koneksi sesi aktif Anda dari perangkat lain. Gunakan dengan hati-hati.
              </p>
              
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 font-medium rounded-xl transition-all hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                <LogOut className="w-4 h-4" />
                Logout Semua Perangkat
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
