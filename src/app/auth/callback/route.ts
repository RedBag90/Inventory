// Supabase auth callback — handles two flows:
// 1. PKCE code exchange (OAuth, password reset)
// 2. token_hash verification (email confirmation, magic link)
import { NextResponse } from 'next/server';
import { createClient } from '@/shared/lib/supabase/server';
import type { EmailOtpType } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code      = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type      = searchParams.get('type') as EmailOtpType | null;
  const next      = searchParams.get('next') ?? '/dashboard/inventory';

  const supabase = await createClient();

  // Strategy 1: PKCE code exchange (password reset, OAuth)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Strategy 2: token_hash (email confirmation, magic link)
  // Works cross-browser/cross-device — no code verifier cookie required.
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/sign-in?error=auth_callback_failed`);
}
