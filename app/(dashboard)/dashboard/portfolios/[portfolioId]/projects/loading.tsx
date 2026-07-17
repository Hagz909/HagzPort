import { SkeletonProjectCard } from '@/components/ui/skeletons';
import { PageHeader } from '@/components/dashboard/PageHeader';

export default function ProjectsLoading() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Loading Projects..." 
        description="Memuat daftar proyek Anda." 
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SkeletonProjectCard />
        <SkeletonProjectCard />
        <SkeletonProjectCard />
        <SkeletonProjectCard />
      </div>
    </div>
  );
}
