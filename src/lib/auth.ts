import { supabase } from './supabase';

export type Session = {
  userId: string;
  email: string | null;
};

export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  if (!data.session) return null;
  return {
    userId: data.session.user.id,
    email: data.session.user.email ?? null,
  };
}

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { ok: false, error: error.message };
  return { ok: true, session: data.session };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true, session: data.session };
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function awardPoints(userId: string, amount: number) {
  await supabase.rpc('award_points', {
    p_user_id: userId,
    p_amount: amount,
  });
}