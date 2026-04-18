import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value ?? 'de';
  const validLocale = ['de', 'en'].includes(locale) ? locale : 'de';
  return {
    locale: validLocale,
    messages: (await import(`@/locales/${validLocale}.json`)).default,
  };
});
