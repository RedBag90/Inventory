'use client';

export function useLocale(): 'de' | 'en' {
  if (typeof document === 'undefined') return 'de';
  const match = document.cookie.match(/(?:^|;\s*)NEXT_LOCALE=([^;]+)/);
  const value = match?.[1];
  return value === 'en' ? 'en' : 'de';
}

export function useSetLocale() {
  return (locale: 'de' | 'en') => {
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`;
    window.location.reload();
  };
}
