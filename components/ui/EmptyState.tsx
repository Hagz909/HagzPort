import { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { ReactNode } from 'react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  actionOnClick?: () => void;
  children?: ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  actionOnClick,
  children
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-zinc-900/50 border border-zinc-800/50 rounded-2xl border-dashed">
      <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-500 mb-4">
        <Icon size={32} />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-zinc-400 max-w-sm mb-6">{description}</p>
      
      {actionHref && actionLabel && (
        <Link href={actionHref} className="btn btn-primary">
          {actionLabel}
        </Link>
      )}
      
      {actionOnClick && actionLabel && (
        <button onClick={actionOnClick} className="btn btn-primary">
          {actionLabel}
        </button>
      )}
      
      {children}
    </div>
  );
}
