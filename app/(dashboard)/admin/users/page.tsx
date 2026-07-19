'use client';

import { useState, useEffect } from 'react';
import { Search, Loader2, Filter, Trash2, Shield, Eye } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { DataTable, Column } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import Link from 'next/link';
import { CustomSelect } from '@/components/ui/CustomSelect';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  
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

      <div className="glass-panel rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row gap-4 relative z-20 overflow-visible">
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
            className="w-full pl-10 pr-4 py-2.5 glass-panel rounded-xl text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500/50 focus:shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-all"
          />
        </div>
        <div className="w-full sm:w-48 flex-shrink-0 z-20">
          <CustomSelect
            value={roleFilter}
            onChange={setRoleFilter}
            options={[
              { value: '', label: 'Semua Peran' },
              { value: 'ADMIN', label: 'Admin' },
              { value: 'USER', label: 'User' }
            ]}
          />
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
