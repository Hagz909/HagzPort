'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Folder, Users, MessageSquare, LogOut, Bell, Menu, Settings, X, Activity, PieChart, FileText, Archive, Star, Globe, Shield, Briefcase, Trophy } from 'lucide-react';
import { toast } from 'sonner';

// NavLink Component with Framer Motion and Glassmorphism aesthetics
function NavLink({ href, icon, label, pathname, onClick, exact = false }: any) {
  // Fix the active state bug where /dashboard is active for all sub-paths
  const isExactRoot = exact || href === '/dashboard' || href === '/admin/dashboard';
  const isActive = isExactRoot 
    ? pathname === href 
    : (pathname === href || pathname.startsWith(`${href}/`));
  
  return (
    <Link href={href} onClick={onClick} className="block relative mb-1">
      <motion.div
        whileHover={{ x: 4, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
        whileTap={{ scale: 0.98 }}
        className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-300 relative z-10
          ${isActive 
            ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
            : 'text-zinc-400 hover:text-zinc-100'
          }`}
      >
        <span className={`${isActive ? 'text-cyan-400' : 'text-zinc-500 group-hover:text-zinc-300'} transition-colors`}>
          {icon}
        </span>
        {label}
      </motion.div>
    </Link>
  );
}

function UserFooter({ user, onSignOut }: { user: any; onSignOut: () => void }) {
  return (
    <div className="p-4 border-t border-white/10 bg-white/[0.02]">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 p-0.5">
          <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center font-bold text-sm">
            {user.name.substring(0, 2).toUpperCase()}
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="text-sm font-medium text-white truncate">{user.name}</p>
          <p className="text-xs text-zinc-500 truncate">{user.email}</p>
        </div>
      </div>
      <button
        onClick={onSignOut}
        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors border border-transparent hover:border-rose-500/20"
      >
        <LogOut size={18} />
        Sign Out
      </button>
    </div>
  );
}

export default function DashboardLayoutClient({
  children,
  user,
  onSignOut
}: {
  children: React.ReactNode;
  user: any;
  onSignOut: () => void;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Fetch awal saat halaman dimuat (mount) untuk mendapatkan unread badge count
  useEffect(() => {
    const loadNotifications = () => {
      fetch('/api/notifications')
        .then(res => res.json())
        .then(data => setNotifications(data.notifications || []))
        .catch(() => {});
    };
    loadNotifications();
  }, []);

  // Re-fetch hanya ketika menu dropdown notifikasi DIBUKA (isNotificationOpen === true)
  useEffect(() => {
    if (isNotificationOpen) {
      fetch('/api/notifications')
        .then(res => res.json())
        .then(data => setNotifications(data.notifications || []))
        .catch(() => {});
    }
  }, [isNotificationOpen]);

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', { method: 'PATCH', body: JSON.stringify({}) });
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (e) {
      toast.error('Gagal menandai notifikasi');
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch('/api/notifications', { method: 'PATCH', body: JSON.stringify({ id }) });
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (e) {}
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const pathname = usePathname();
  const role = user.role;

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const renderNavLinks = () => (
    <>
      {role === 'USER' ? (
        <>
          <NavLink href="/dashboard/global" icon={<Globe size={20} />} label="Portfolio Global" pathname={pathname} onClick={closeMobileMenu} />
          <NavLink href="/dashboard" icon={<Home size={20} />} label="Overview" pathname={pathname} onClick={closeMobileMenu} />
          <NavLink href="/dashboard/portfolios" icon={<Folder size={20} />} label="Portofolio Saya" pathname={pathname} onClick={closeMobileMenu} />
          <NavLink href="/dashboard/resume" icon={<FileText size={20} />} label="Studio Resume (CV)" pathname={pathname} onClick={closeMobileMenu} />
          <NavLink href="/dashboard/cv-terbuat" icon={<Archive size={20} />} label="CV Terbuat" pathname={pathname} onClick={closeMobileMenu} />
          <NavLink href="/dashboard/analytics" icon={<PieChart size={20} />} label="Analitik & Statistik" pathname={pathname} onClick={closeMobileMenu} />
          <NavLink href="/dashboard/jobs" icon={<Briefcase size={20} />} label="Pencarian Karier" pathname={pathname} onClick={closeMobileMenu} />
          <NavLink href="/dashboard/achievements" icon={<Trophy size={20} />} label="Pencapaian (Badge)" pathname={pathname} onClick={closeMobileMenu} />
          <NavLink href="/dashboard/messages" icon={<MessageSquare size={20} />} label="Pesan & Notifikasi" pathname={pathname} onClick={closeMobileMenu} />
          <NavLink href="/dashboard/settings" icon={<Settings size={20} />} label="Pengaturan Akun" pathname={pathname} onClick={closeMobileMenu} />
        </>
      ) : (
        <>
          <NavLink href="/admin/dashboard" icon={<Home size={20} />} label="Overview" pathname={pathname} onClick={closeMobileMenu} />
          <NavLink href="/admin/global" exact icon={<Globe size={20} />} label="Lihat Global" pathname={pathname} onClick={closeMobileMenu} />
          <NavLink href="/admin/global/manage" icon={<Shield size={20} />} label="Kelola Global" pathname={pathname} onClick={closeMobileMenu} />
          <NavLink href="/admin/users" icon={<Users size={20} />} label="Kelola User" pathname={pathname} onClick={closeMobileMenu} />
          <NavLink href="/admin/cv-logs" icon={<FileText size={20} />} label="Log Generate CV" pathname={pathname} onClick={closeMobileMenu} />
          <NavLink href="/admin/messages" icon={<MessageSquare size={20} />} label="Semua Pesan" pathname={pathname} onClick={closeMobileMenu} />
          <NavLink href="/dashboard/portfolios" icon={<Folder size={20} />} label="Portofolio Admin" pathname={pathname} onClick={closeMobileMenu} />
          <NavLink href="/admin/activities" icon={<Activity size={20} />} label="Aktivitas Realtime" pathname={pathname} onClick={closeMobileMenu} />
          <NavLink href="/admin/backups" icon={<Archive size={20} />} label="Back Up Actifity" pathname={pathname} onClick={closeMobileMenu} />
          <NavLink href="/admin/feedbacks" icon={<Star size={20} />} label="Feedback User" pathname={pathname} onClick={closeMobileMenu} />
          <NavLink href="/admin/statistics" icon={<PieChart size={20} />} label="Statistik" pathname={pathname} onClick={closeMobileMenu} />
          <NavLink href="/admin/settings" icon={<Settings size={20} />} label="Pengaturan Akun" pathname={pathname} onClick={closeMobileMenu} />
        </>
      )}
    </>
  );

  return (
    <div className="flex h-screen bg-[#050B14] text-zinc-50 overflow-hidden relative">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[30%] -left-[10%] w-[50%] h-[50%] rounded-full bg-cyan-900/20 blur-[120px]" />
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[40%] rounded-full bg-purple-900/20 blur-[120px]" />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm md:hidden"
              onClick={closeMobileMenu}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="fixed inset-y-0 left-0 z-50 w-72 flex flex-col glass-panel md:hidden"
            >
              <div className="flex h-16 items-center justify-between px-6 border-b border-white/5">
                <Link href="/" className="text-xl font-bold flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-400 to-purple-500 flex items-center justify-center font-black text-xs text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                    HP
                  </div>
                  <span>
                    Hgz<span className="text-cyan-400">Port</span>
                  </span>
                </Link>
                <button onClick={closeMobileMenu} className="text-zinc-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto custom-scrollbar">
                {renderNavLinks()}
              </nav>
              <UserFooter user={user} onSignOut={onSignOut} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-col glass-panel md:flex z-20 border-r-0 border-r-white/5">
        <div className="flex h-20 items-center px-6 border-b border-white/5">
          <Link href="/" className="text-xl font-bold flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 to-purple-600 flex items-center justify-center font-black text-xs text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] group-hover:shadow-[0_0_25px_rgba(176,38,255,0.5)] transition-all">
              HP
            </div>
            <span className="tracking-wide">
              Hgz<span className="text-cyan-400">Port</span>
            </span>
          </Link>
        </div>
        <nav className="flex-1 space-y-1 px-4 py-6 relative overflow-y-auto custom-scrollbar">
          {renderNavLinks()}
        </nav>
        <UserFooter user={user} onSignOut={onSignOut} />
      </aside>

      {/* Main Content */}
      <main className="flex flex-1 flex-col overflow-hidden z-10">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-white/5 glass-panel px-6 backdrop-blur-md bg-transparent">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden text-zinc-400 hover:text-zinc-100"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-lg font-medium hidden md:block">
              {role === 'USER' ? 'Dashboard' : 'Admin Panel'}
            </h1>
          </div>
          <div className="flex items-center gap-4 relative">
            <button 
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="text-zinc-400 hover:text-zinc-100 relative p-1.5 rounded-md hover:bg-zinc-800 transition-colors"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-zinc-950"></span>
              )}
            </button>

            <AnimatePresence>
              {isNotificationOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsNotificationOpen(false)}></div>
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-12 w-80 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden"
                  >
                    <div className="p-3 border-b border-zinc-800 flex justify-between items-center">
                      <h3 className="font-semibold text-zinc-100 text-sm">Notifikasi</h3>
                      {unreadCount > 0 && (
                        <button onClick={markAllAsRead} className="text-xs text-cyan-500 hover:text-cyan-400 font-medium transition-colors">Tandai semua dibaca</button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-zinc-500 text-sm">Belum ada notifikasi</div>
                      ) : (
                        notifications.map((notif) => (
                          <div 
                            key={notif.id} 
                            onClick={() => !notif.isRead && markAsRead(notif.id)}
                            className={`p-4 border-b border-zinc-800/50 hover:bg-zinc-800/50 transition-colors cursor-pointer flex gap-3 ${notif.isRead ? 'opacity-50' : ''}`}
                          >
                            <div className={`mt-1.5 flex-shrink-0 w-2 h-2 rounded-full ${notif.isRead ? 'bg-zinc-600' : 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]'}`}></div>
                            <div>
                              <p className="text-sm text-zinc-200 leading-snug">{notif.message}</p>
                              <p className="text-xs text-zinc-500 mt-1">
                                {new Date(notif.createdAt).toLocaleDateString('id-ID', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="p-3 text-center border-t border-zinc-800 bg-zinc-950/50">
                      <Link href={role === 'ADMIN' ? "/admin/activities" : "/dashboard/messages?tab=notifications"} onClick={() => setIsNotificationOpen(false)} className="text-sm font-medium text-cyan-500 hover:text-cyan-400 transition-colors w-full inline-block py-1">
                        {role === 'ADMIN' ? 'Lihat Semua Aktivitas' : 'Lihat Semua Notifikasi'}
                      </Link>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </header>

        <div className="flex-1 overflow-auto bg-transparent p-6 relative custom-scrollbar">
          <div className="h-full relative z-10">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}


