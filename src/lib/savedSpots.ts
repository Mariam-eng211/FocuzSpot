import { supabase } from './supabase';

export async function getSavedIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('saved_locations')
    .select('location_id')
    .eq('user_id', userId);

  if (error) {
    console.error('getSavedIds:', error.message);
    return [];
  }
  return (data ?? []).map((row) => row.location_id);
}

export async function saveSpot(userId: string, locationId: string) {
  return supabase
    .from('saved_locations')
    .insert({ user_id: userId, location_id: locationId });
}

export async function unsaveSpot(userId: string, locationId: string) {
  return supabase
    .from('saved_locations')
    .delete()
    .eq('user_id', userId)
    .eq('location_id', locationId);
}