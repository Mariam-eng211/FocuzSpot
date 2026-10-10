import { supabase } from './supabase';

export type StudySession = {
  id: string;
  user_id: string;
  location_id: string | null;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number | null;
  notes: string | null;
};

export async function startSession(
  userId: string,
  locationId: string | null
): Promise<StudySession | null> {
  const { data, error } = await supabase
    .from('study_sessions')
    .insert({ user_id: userId, location_id: locationId })
    .select()
    .single();

  if (error) {
    console.error('startSession:', error.message);
    return null;
  }
  return data as StudySession;
}

export async function endSession(sessionId: string, minutes: number) {
  return supabase
    .from('study_sessions')
    .update({
      ended_at: new Date().toISOString(),
      duration_minutes: Math.max(1, Math.round(minutes)),
    })
    .eq('id', sessionId);
}

export async function getUserSessions(userId: string): Promise<StudySession[]> {
  const { data, error } = await supabase
    .from('study_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .limit(20);

  if (error) return [];
  return (data ?? []) as StudySession[];
}

export async function getUserStats(userId: string) {
  const { data, error } = await supabase
    .from('study_sessions')
    .select('duration_minutes')
    .eq('user_id', userId);

  if (error || !data) return { totalMinutes: 0, totalSessions: 0 };

  const totalMinutes = data.reduce(
    (sum, r) => sum + (r.duration_minutes ?? 0),
    0
  );
  return { totalMinutes, totalSessions: data.length };
}