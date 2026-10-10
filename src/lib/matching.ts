import type { Location, Preferences } from './types';

export type MatchResult = {
  location: Location;
  score: number;
  reasonKeys: string[];
  warningKeys: string[];
};

function passesHardFilters(loc: Location, prefs: Preferences): boolean {
  if (prefs.wifi && loc.amenities.wifi === false) return false;
  if (prefs.outlet && loc.amenities.outlets === 'none') return false;

  const price = loc.price_level ?? 3;
  if (prefs.budget === 'free' && price > 0) return false;
  if (prefs.budget === 'under-100' && price > 1) return false;
  if (prefs.budget === 'under-300' && price > 2) return false;

  return true;
}

export function calculateMatch(loc: Location, prefs: Preferences): MatchResult {
  let score = 0;
  const reasonKeys: string[] = [];
  const warningKeys: string[] = [];

  const noise = loc.study_attributes.noise_level;
  if (prefs.noise === 'quiet') {
    if (noise === 'silent' || noise === 'quiet') {
      score += 35;
      reasonKeys.push('match.quietEnvironment');
    } else if (noise === 'moderate') {
      score += 15;
    } else if (noise === 'loud') {
      score += 0;
    } else {
      score += 15;
      warningKeys.push('match.noiseUnverified');
    }
  } else if (prefs.noise === 'some-noise') {
    if (noise === 'moderate') {
      score += 35;
      reasonKeys.push('match.someNoise');
    } else if (noise === 'quiet' || noise === 'silent') {
      score += 25;
      reasonKeys.push('match.quietEnvironment');
    } else if (noise === 'loud') {
      score += 15;
    } else {
      score += 15;
      warningKeys.push('match.noiseUnverified');
    }
  } else {
    score += 35;
  }

  const price = loc.price_level ?? 3;
  if (prefs.budget === 'free') {
    score += 25;
    reasonKeys.push('match.freeToUse');
  } else if (prefs.budget === 'under-100') {
    score += price <= 1 ? 25 : 15;
    if (price <= 1) reasonKeys.push('match.withinBudget');
  } else if (prefs.budget === 'under-300') {
    score += price <= 2 ? 25 : 15;
    if (price <= 2) reasonKeys.push('match.withinBudget');
  } else {
    score += price <= 1 ? 25 : price === 2 ? 20 : 15;
  }

  if (loc.amenities.wifi === true) {
    score += 20;
    reasonKeys.push('match.wifiAvailable');
  } else if (loc.amenities.wifi === null) {
    score += 10;
    if (prefs.wifi) warningKeys.push('match.wifiUnverified');
  }

  const outlets = loc.amenities.outlets;
  if (outlets === 'many') {
    score += 20;
    reasonKeys.push('match.manyOutlets');
  } else if (outlets === 'some') {
    score += 15;
    reasonKeys.push('match.someOutlets');
  } else if (outlets === null) {
    score += 8;
    if (prefs.outlet) warningKeys.push('match.outletsUnverified');
  }

  return {
    location: loc,
    score: Math.round(score),
    reasonKeys: reasonKeys.slice(0, 4),
    warningKeys: warningKeys.slice(0, 2),
  };
}

export function rankLocations(
  locations: Location[],
  prefs: Preferences
): MatchResult[] {
  return locations
    .filter((loc) => passesHardFilters(loc, prefs))
    .map((loc) => calculateMatch(loc, prefs))
    .sort((a, b) => b.score - a.score);
}