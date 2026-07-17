'use client';

import { CheckCircle2, XCircle, ShieldAlert, User, Mail, MailOpen } from 'lucide-react';

interface StatusBadgeProps {
  type: 'active' | 'role' | 'message';
  value: boolean | string;
}

export function StatusBadge({ type, value }: StatusBadgeProps) {
  if (type === 'active') {
    const isActive = value === true;
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] uppercase tracking-wider font-bold border transition-all ${isActive ? 'bg-green-500/10 text-green-400 border-green-500/30 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]' : 'bg-red-500/10 text-red-400 border-red-500/30 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]'}`}>
        {isActive ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
        {isActive ? 'Aktif' : 'Nonaktif'}
      </span>
    );
  }

  if (type === 'role') {
    const isAdmin = value === 'ADMIN';
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] uppercase tracking-wider font-bold border transition-all ${isAdmin ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]'}`}>
        {isAdmin ? <ShieldAlert className="w-3 h-3 mr-1" /> : <User className="w-3 h-3 mr-1" />}
        {isAdmin ? 'Admin' : 'User'}
      </span>
    );
  }

  if (type === 'message') {
    const isRead = value === true;
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] uppercase tracking-wider font-bold border transition-all ${isRead ? 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30 drop-shadow-[0_0_8px_rgba(251,113,133,0.5)]'}`}>
        {isRead ? <MailOpen className="w-3 h-3 mr-1" /> : <Mail className="w-3 h-3 mr-1" />}
        {isRead ? 'Dibaca' : 'Baru'}
      </span>
    );
  }

  return null;
}
