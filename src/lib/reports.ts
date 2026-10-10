import { supabase } from './supabase';
import type { Report } from './types';

export async function getLatestReport(locationId: string): Promise<Report | null> {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('location_id', locationId)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('getLatestReport error:', error.message);
    return null;
  }
  return data as Report | null;
}

export async function createReport(input: {
  location_id: string;
  occupancy: Report['occupancy'];
  noise: Report['noise'];
  outlets_available: Report['outlets_available'];
  wifi_working: boolean | null;
  comment: string | null;
}): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.from('reports').insert(input);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export function formatFreshness(
  createdAt: string,
  t: (key: string, options?: Record<string, unknown>) => string
): string {
  const ms = Date.now() - new Date(createdAt).getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return t('freshness.justNow');
  if (min < 60) return t('freshness.minutesAgo', { count: min });
  const hours = Math.floor(min / 60);
  return t('freshness.hoursAgo', { count: hours });
}

export function freshnessLevel(createdAt: string): 'fresh' | 'recent' | 'stale' {
  const min = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
  if (min < 30) return 'fresh';
  if (min < 60) return 'recent';
  return 'stale';
}