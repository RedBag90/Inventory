'use client';

// Hook: returns the currently authenticated Supabase user.
// Client-side only — uses Supabase's onAuthStateChange listener via useEffect.
import { useEffect, useState } from 'react';
import { type User } from '@supabase/supabase-js';
import { createClient } from '@/shared/lib/supabase/client';

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, isLoading };
}
