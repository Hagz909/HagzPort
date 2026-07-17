import { SkeletonPortfolioCard } from '@/components/ui/skeletons';
import { PageHeader } from '@/components/dashboard/PageHeader';

export default function PortfoliosLoading() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Loading Portfolios..." 
        description="Memuat daftar portofolio Anda." 
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SkeletonPortfolioCard />
        <SkeletonPortfolioCard />
        <SkeletonPortfolioCard />
      </div>
    </div>
  );
}
