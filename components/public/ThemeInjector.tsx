'use client';

const THEME_MAP: Record<string, { primary400: string, primary500: string, primary600: string, secondary500: string, secondary600: string }> = {
  cyan: { primary400: '#22d3ee', primary500: '#06b6d4', primary600: '#0891b2', secondary500: '#3b82f6', secondary600: '#2563eb' },
  emerald: { primary400: '#34d399', primary500: '#10b981', primary600: '#059669', secondary500: '#14b8a6', secondary600: '#0d9488' },
  amethyst: { primary400: '#e879f9', primary500: '#d946ef', primary600: '#c026d3', secondary500: '#8b5cf6', secondary600: '#7c3aed' },
  sunset: { primary400: '#fb923c', primary500: '#f97316', primary600: '#ea580c', secondary500: '#f43f5e', secondary600: '#e11d48' },
};

const FONT_MAP: Record<string, { heading: string, body: string }> = {
  modern: { heading: '"Montenegrin Gothic One", serif', body: '"Google Sans Flex", sans-serif' },
  sans: { heading: '"Inter", sans-serif', body: '"Inter", sans-serif' },
  serif: { heading: '"Playfair Display", serif', body: '"Inter", sans-serif' },
  mono: { heading: '"JetBrains Mono", monospace', body: '"JetBrains Mono", monospace' },
};

export function ThemeInjector({ theme = 'cyan', font = 'modern' }: { theme?: string, font?: string }) {
  const colors = THEME_MAP[theme] || THEME_MAP['cyan'];
  const fonts = FONT_MAP[font] || FONT_MAP['modern'];

  return (
    <style dangerouslySetInnerHTML={{
      __html: `
        :root, .portfolio-theme {
          --theme-primary-400: ${colors.primary400};
          --theme-primary-500: ${colors.primary500};
          --theme-primary-600: ${colors.primary600};
          --theme-secondary-500: ${colors.secondary500};
          --theme-secondary-600: ${colors.secondary600};
          --theme-font-heading: ${fonts.heading};
          --theme-font-body: ${fonts.body};
        }
      `
    }} />
  );
}
