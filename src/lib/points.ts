import { supabase } from './supabase';

export async function getUserPoints(userId: string): Promise<number> {
  const { data } = await supabase
    .from('user_points')
    .select('points')
    .eq('user_id', userId)
    .maybeSingle();

  return data?.points ?? 0;
}

export async function awardPoints(userId: string, amount: number) {
  await supabase.rpc('award_points', {
    p_user_id: userId,
    p_amount: amount,
  });
}

export function levelFromPoints(points: number): {
  level: string;
  nextAt: number;
} {
  if (points >= 1000) return { level: 'Gold Scout', nextAt: 5000 };
  if (points >= 300) return { level: 'Silver Scout', nextAt: 1000 };
  if (points >= 100) return { level: 'Bronze Scout', nextAt: 300 };
  if (points >= 30) return { level: 'Newcomer', nextAt: 100 };
  return { level: 'Rookie', nextAt: 30 };
}