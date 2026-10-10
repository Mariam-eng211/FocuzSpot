// Shape of a location row from Supabase
export type Location = {
  id: string;
  name: string;
  type: 'library' | 'cafe' | 'coworking' | 'university' | 'bookstore' | 'youth_center';
  address: string | null;
  latitude: number;
  longitude: number;
  hours: Record<string, string | null>;
  price_level: 0 | 1 | 2 | 3;
  amenities: {
    wifi: boolean | null;
    outlets: 'many' | 'some' | 'none' | null;
    bathroom: boolean | null;
    food: boolean | null;
    large_table: boolean | null;
    accessible: boolean | null;
  };
  study_attributes: {
    noise_level: 'silent' | 'quiet' | 'moderate' | 'loud' | null;
    best_for: string[];
    not_ideal_for: string[];
  };
  source: string | null;
  last_verified: string | null;
  notes: string | null;
};

// User preferences from the form
export type Preferences = {
  budget: 'free' | 'under-100' | 'under-300' | 'any';
  noise: 'quiet' | 'some-noise' | 'any';
  wifi: boolean;
  outlet: boolean;
};

// Report row (used later on Day 7)
export type Report = {
  id: string;
  location_id: string;
  occupancy: 'empty' | 'half' | 'busy' | 'full';
  noise: 'very_quiet' | 'quiet' | 'moderate' | 'loud';
  outlets_available: 'many' | 'some' | 'none' | 'unknown';
  wifi_working: boolean | null;
  comment: string | null;
  created_at: string;
  expires_at: string;
};