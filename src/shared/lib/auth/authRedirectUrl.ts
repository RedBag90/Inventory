// Callback-URL für Supabase-Auth-Mails (Registrierung, Passwort-Reset, Magic Link).
//
// Bewusst NICHT window.location.origin: Wird der Flow über eine Preview- oder
// *.vercel.app-Domain ausgelöst, landet diese fremde Domain im Link der Mail.
// Absenderdomain (flohmarkt-olympiade.de) und Link-Domain fallen dann
// auseinander — ein starkes Spam-Signal.
//
// process.env.NEXT_PUBLIC_* direkt wie in shared/lib/supabase/client.ts:
// Next.js inlined diese Werte zur Build-Zeit, env.ts ist server-only.
export function getAuthCallbackUrl(next?: string): string {
  // eslint-disable-next-line no-restricted-syntax
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const origin = (appUrl ?? window.location.origin).replace(/\/$/, '');
  const base   = `${origin}/auth/callback`;
  return next ? `${base}?next=${encodeURIComponent(next)}` : base;
}
