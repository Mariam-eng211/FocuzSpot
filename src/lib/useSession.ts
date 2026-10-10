import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import { getSession, type Session } from './auth';

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSession().then((s) => {
      setSession(s);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      getSession().then(setSession);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  return { session, loading };
}