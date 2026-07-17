'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Folder, Users, MessageSquare, LogOut, Bell, Menu, Settings, X, Activity, PieChart, FileText, Archive, Star } from 'lucide-react';
import { toast } from 'sonner';

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
          <NavLink href="/dashboard" icon={<Home size={20} />} label="Overview" pathname={pathname} onClick={closeMobileMenu} />
          <NavLink href="/dashboard/portfolios" icon={<Folder size={20} />} label="Portofolio Saya" pathname={pathname} onClick={closeMobileMenu} />
          <NavLink href="/dashboard/resume" icon={<FileText size={20} />} label="Studio Resume (CV)" pathname={pathname} onClick={closeMobileMenu} />
          <NavLink href="/dashboard/messages" icon={<MessageSquare size={20} />} label="Pesan & Notifikasi" pathname={pathname} onClick={closeMobileMenu} />
          <NavLink href="/dashboard/settings" icon={<Settings size={20} />} label="Pengaturan Akun" pathname={pathname} onClick={closeMobileMenu} />
        </>
      ) : (
        <>
          <NavLink href="/admin/dashboard" icon={<Home size={20} />} label="Overview" pathname={pathname} onClick={closeMobileMenu} />
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
    <div className="flex h-screen bg-zinc-950 text-zinc-50 overflow-hidden">
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
              className="fixed inset-y-0 left-0 z-50 w-64 flex flex-col border-r border-zinc-800/50 bg-zinc-950/90 backdrop-blur-xl md:hidden shadow-[4px_0_24px_rgba(0,0,0,0.5)]"
            >
              <div className="flex h-16 items-center justify-between px-6 border-b border-zinc-800">
                <Link href="/" className="text-xl font-bold flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-black text-xs text-zinc-950 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
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
              <nav className="flex-1 space-y-1 px-4 py-6">
                {renderNavLinks()}
              </nav>
              <UserFooter user={user} onSignOut={onSignOut} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl md:flex shadow-[4px_0_24px_rgba(0,0,0,0.2)]">
        <div className="flex h-16 items-center px-6 border-b border-zinc-800">
          <Link href="/" className="text-xl font-bold flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-black text-xs text-zinc-950 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              HP
            </div>
            <span>
              Hgz<span className="text-cyan-400">Port</span>
            </span>
          </Link>
        </div>
        <nav className="flex-1 space-y-1 px-4 py-6 relative">
          {renderNavLinks()}
        </nav>
        <UserFooter user={user} onSignOut={onSignOut} />
      </aside>

      {/* Main Content */}
      <main className="flex flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-950/80 px-6 backdrop-blur-sm">
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

        <div className="flex-1 overflow-auto bg-zinc-950 p-6 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function NavLink({ href, icon, label, pathname, onClick }: { href: string, icon: React.ReactNode, label: string, pathname: string, onClick?: () => void }) {
  const isActive = pathname === href || pathname.startsWith(`${href}/`);
  
  return (
    <Link 
      href={href} 
      onClick={onClick}
      className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-300 ${
        isActive ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)] font-semibold' : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-100'
      }`}
    >
      {isActive && (
        <motion.div
          layoutId="dashboardNavIndicator"
          className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/20 to-transparent border-l-2 border-cyan-400"
          initial={false}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}
      <div className={`relative z-10 flex items-center gap-3 transition-transform duration-300 ${!isActive ? 'group-hover:translate-x-1' : ''}`}>
        {icon}
        <span className="tracking-wide">{label}</span>
      </div>
    </Link>
  );
}

function UserFooter({ user, onSignOut }: { user: any, onSignOut: () => void }) {
  return (
    <div className="border-t border-zinc-800 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="h-8 w-8 rounded-full bg-cyan-500 flex items-center justify-center font-bold text-xs uppercase shrink-0 text-zinc-950">
            {user.name?.charAt(0) || 'U'}
          </div>
          <div className="truncate text-sm">
            <p className="font-medium truncate text-zinc-100">{user.name}</p>
          </div>
        </div>
        <button 
          onClick={onSignOut} 
          className="p-2 text-zinc-400 hover:text-red-400 transition-colors shrink-0" 
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );
}
