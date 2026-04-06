// Server-side Supabase client — uses cookies() for session management.
// Use this in Server Components, Route Handlers, and Server Actions.
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { env } from '@/shared/config/env';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // setAll is called from Server Components where cookies are read-only.
            // This is safe to ignore — the middleware handles session refresh.
          }
        },
      },
    },
  );
}
