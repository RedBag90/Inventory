'use client';

// Browser-side Supabase client — safe to use in Client Components.
// Uses process.env.NEXT_PUBLIC_* directly: Next.js statically inlines these
// at build time, so they are available in the browser without server-side
// env validation.
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    // eslint-disable-next-line no-restricted-syntax
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    // eslint-disable-next-line no-restricted-syntax
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
