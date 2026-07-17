import { SkeletonFormPage } from '@/components/ui/skeletons';
import { PageHeader } from '@/components/dashboard/PageHeader';

export default function BiodataLoading() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Biodata & Profil" 
        description="Informasi dasar untuk ditampilkan pada halaman portofolio Anda."
      />
      <SkeletonFormPage />
    </div>
  );
}
