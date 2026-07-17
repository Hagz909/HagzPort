'use client';

import { useState, useEffect } from 'react';
import { Search, Loader2, Filter, Trash2, Shield, Eye } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { DataTable, Column } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import Link from 'next/link';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [isRoleFilterOpen, setIsRoleFilterOpen] = useState(false);
  
  // Modals state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'delete' | 'toggleRole' | 'toggleActive';
    userId: string | null;
    userName: string;
  }>({
    isOpen: false,
    type: 'delete',
    userId: null,
    userName: ''
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchUsers();
  }, [debouncedSearch, roleFilter]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams();
      if (debouncedSearch) query.append('search', debouncedSearch);
      if (roleFilter) query.append('role', roleFilter);
      
      const res = await fetch(`/api/admin/users?${query.toString()}`);
      if (!res.ok) throw new Error('Gagal memuat pengguna');
      const data = await res.json();
      setUsers(data.users);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (actionFn: () => Promise<Response>, successMessage: string) => {
    try {
      const res = await actionFn();
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Terjadi kesalahan');
      }
      toast.success(successMessage);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleToggleActive = async (userId: string) => {
    await handleAction(
      () => fetch(`/api/admin/users/${userId}/toggle-active`, { method: 'PATCH' }),
      'Status pengguna berhasil diubah'
    );
  };

  const handleToggleRole = async (userId: string) => {
    await handleAction(
      () => fetch(`/api/admin/users/${userId}/toggle-role`, { method: 'PATCH' }),
      'Peran pengguna berhasil diubah'
    );
  };

  const handleDeleteUser = async (userId: string) => {
    await handleAction(
      () => fetch(`/api/admin/users/${userId}`, { method: 'DELETE' }),
      'Pengguna berhasil dihapus'
    );
  };

  const openConfirmDialog = (type: 'delete' | 'toggleRole' | 'toggleActive', userId: string, userName: string) => {
    setConfirmDialog({ isOpen: true, type, userId, userName });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const columns: Column<any>[] = [
    {
      header: 'Pengguna',
      cell: (user) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-cyan-500/20 border border-white/10 shrink-0">
            {getInitials(user.name)}
          </div>
          <div>
            <div className="font-bold text-white text-sm">{user.name}</div>
            <div className="text-xs text-zinc-400 font-medium">{user.email}</div>
            {user.portfolios?.[0]?.username && (
              <div className="text-[10px] font-mono text-cyan-400 mt-1 bg-cyan-500/10 inline-block px-1.5 py-0.5 rounded border border-cyan-500/20">
                @{user.portfolios[0].username}
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      header: 'Peran',
      cell: (user) => <StatusBadge type="role" value={user.role} />
    },
    {
      header: 'Status',
      cell: (user) => <StatusBadge type="active" value={user.isActive} />
    },
    {
      header: 'Tgl Bergabung',
      cell: (user) => (
        <span className="text-zinc-400">
          {new Date(user.createdAt).toLocaleDateString('id-ID')}
        </span>
      )
    },
    {
      header: 'Aksi & Kontrol',
      className: 'text-right',
      cell: (user) => (
        <div className="flex items-center justify-end space-x-4">
          
          {/* Role Switch Toggle */}
          <div className="flex items-center gap-2 mr-2">
            <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Admin</span>
            <button 
              onClick={() => openConfirmDialog('toggleRole', user.id, user.name)}
              className={`w-9 h-5 rounded-full transition-all relative ${user.role === 'ADMIN' ? 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]' : 'bg-zinc-700/50 hover:bg-zinc-600'}`}
              title={user.role === 'ADMIN' ? 'Turunkan ke User' : 'Jadikan Admin'}
            >
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${user.role === 'ADMIN' ? 'left-[18px]' : 'left-0.5'}`} />
            </button>
          </div>

          <Link 
            href={`/admin/users/${user.id}`}
            title="Lihat Detail"
            className="p-1.5 text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-700 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" />
          </Link>
          
          <button 
            onClick={() => openConfirmDialog('delete', user.id, user.name)}
            title="Hapus Akun (Kill)"
            className="p-1.5 text-red-500/70 hover:text-white hover:bg-red-500 bg-red-500/10 rounded-lg border border-red-500/20 hover:shadow-[0_0_15px_rgba(239,68,68,0.6)] transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-sky-600 drop-shadow-md mb-1">Kelola Pengguna</h1>
          <p className="text-sm text-zinc-400">Atur peran, status, dan data pengguna terdaftar.</p>
        </div>
      </div>

      <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row gap-4 relative z-20">
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[80px] rounded-full" />
        </div>
        <div className="relative flex-1 z-10 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-cyan-400 transition-colors" />
          <input
            type="text"
            placeholder="Cari nama atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-950/60 backdrop-blur-sm border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/70 focus:ring-1 focus:ring-cyan-500/50 transition-all shadow-inner"
          />
        </div>
        <div className="relative z-10">
          <button
            onClick={() => setIsRoleFilterOpen(!isRoleFilterOpen)}
            className={`w-full sm:w-[180px] flex items-center justify-between bg-zinc-950/60 backdrop-blur-sm border ${isRoleFilterOpen ? 'border-cyan-500/70 shadow-[0_0_15px_rgba(6,182,212,0.2)]' : 'border-zinc-800'} hover:border-zinc-700 hover:bg-zinc-900/60 rounded-xl px-4 py-2.5 text-sm text-white transition-all shadow-inner`}
          >
            <span>{roleFilter === 'ADMIN' ? 'Admin' : roleFilter === 'USER' ? 'User' : 'Semua Peran'}</span>
            <Filter className={`h-4 w-4 transition-colors ${isRoleFilterOpen || roleFilter ? 'text-cyan-400' : 'text-zinc-500'}`} />
          </button>

          {/* Invisible Overlay to click outside */}
          {isRoleFilterOpen && (
            <div 
              className="fixed inset-0 z-20" 
              onClick={() => setIsRoleFilterOpen(false)} 
            />
          )}

          {/* Dropdown Menu */}
          <div className={`absolute right-0 sm:left-0 mt-2 w-[180px] bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/50 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] z-30 overflow-hidden transform origin-top transition-all duration-200 ${isRoleFilterOpen ? 'opacity-100 scale-100 translate-y-0 visible' : 'opacity-0 scale-95 -translate-y-2 invisible'}`}>
            {[
              { value: '', label: 'Semua Peran' },
              { value: 'ADMIN', label: 'Admin' },
              { value: 'USER', label: 'User' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setRoleFilter(option.value);
                  setIsRoleFilterOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${roleFilter === option.value ? 'bg-cyan-500/10 text-cyan-400 font-medium' : 'text-zinc-300 hover:bg-zinc-800'}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={users} 
        isLoading={isLoading} 
        emptyMessage="Tidak ada pengguna yang ditemukan."
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={async () => {
          if (!confirmDialog.userId) return;
          if (confirmDialog.type === 'delete') await handleDeleteUser(confirmDialog.userId);
          else if (confirmDialog.type === 'toggleRole') await handleToggleRole(confirmDialog.userId);
          else if (confirmDialog.type === 'toggleActive') await handleToggleActive(confirmDialog.userId);
        }}
        title={
          confirmDialog.type === 'delete' ? 'Hapus Pengguna' : 
          confirmDialog.type === 'toggleRole' ? 'Ubah Peran Pengguna' : 
          'Ubah Status Pengguna'
        }
        message={
          confirmDialog.type === 'delete' ? `Apakah Anda yakin ingin menghapus akun ${confirmDialog.userName} secara permanen? Semua portofolionya akan ikut terhapus.` : 
          confirmDialog.type === 'toggleRole' ? `Ubah hak akses untuk ${confirmDialog.userName}?` : 
          `Ubah status aktif untuk ${confirmDialog.userName}?`
        }
        type={confirmDialog.type === 'delete' ? 'danger' : 'warning'}
        confirmText={confirmDialog.type === 'delete' ? 'Ya, Hapus' : 'Ya, Ubah'}
        requireInput={confirmDialog.type === 'delete' ? confirmDialog.userName : undefined}
      />
    </div>
  );
}
