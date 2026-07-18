import { prisma } from '@/lib/prisma';

export interface CompletenessResult {
  isComplete: boolean;
  percentage: number;
  missing: string[];
}

/**
 * Memeriksa kelengkapan data portfolio untuk syarat publish ke Global Showcase.
 * Portfolio harus memiliki 100% data lengkap sebelum bisa tampil di halaman global.
 */
export async function checkPortfolioCompleteness(portfolioId: string): Promise<CompletenessResult> {
  const portfolio = await prisma.portfolio.findUnique({
    where: { id: portfolioId },
    include: {
      educations: { select: { id: true } },
      workExperiences: { select: { id: true } },
      projects: { select: { id: true } },
    },
  });

  if (!portfolio) {
    return { isComplete: false, percentage: 0, missing: ['Portfolio tidak ditemukan'] };
  }

  const checks: { label: string; passed: boolean }[] = [
    { label: 'Nama Lengkap (Biodata)', passed: !!portfolio.fullName },
    { label: 'Nomor Telepon (Biodata)', passed: !!portfolio.phone },
    { label: 'Alamat (Biodata)', passed: !!portfolio.address },
    { label: 'Tagline (Hero)', passed: !!portfolio.tagline },
    { label: 'Foto Profil (Hero)', passed: !!portfolio.profileImageUrl },
    { label: 'Bio / Tentang Saya', passed: !!portfolio.bio },
    { label: 'Minimal 1 Skill/Keahlian', passed: portfolio.skills.length > 0 },
    { label: 'Minimal 1 Riwayat Pendidikan', passed: portfolio.educations.length > 0 },
    { label: 'Minimal 1 Pengalaman Kerja', passed: portfolio.workExperiences.length > 0 },
    { label: 'Minimal 1 Proyek', passed: portfolio.projects.length > 0 },
    { label: 'Portfolio sudah dipublikasikan', passed: portfolio.isPublished },
  ];

  const passed = checks.filter(c => c.passed).length;
  const total = checks.length;
  const missing = checks.filter(c => !c.passed).map(c => c.label);

  return {
    isComplete: passed === total,
    percentage: Math.round((passed / total) * 100),
    missing,
  };
}
