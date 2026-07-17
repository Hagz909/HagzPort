import { SkeletonTable } from '@/components/ui/skeletons';
import { PageHeader } from '@/components/dashboard/PageHeader';

export default function UsersLoading() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Manajemen Pengguna" 
        description="Kelola pengguna platform dan hak akses."
      />
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <SkeletonTable />
      </div>
    </div>
  );
}
