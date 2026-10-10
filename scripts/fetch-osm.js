import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import ws from 'ws';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  { realtime: { transport: ws } }
);

// Bishkek bounding box
const BBOX = '42.80,74.50,42.95,74.70';

const OVERPASS_QUERY = `[out:json][timeout:90];(
  node["amenity"="cafe"](${BBOX});
  node["amenity"="library"](${BBOX});
  node["amenity"="coworking"](${BBOX});
  node["office"="coworking"](${BBOX});
  node["shop"="books"](${BBOX});
);out body;`;

function mapType(tags) {
  if (tags.amenity === 'cafe') return 'cafe';
  if (tags.amenity === 'library') return 'library';
  if (tags.amenity === 'coworking' || tags.office === 'coworking') return 'coworking';
  if (tags.shop === 'books') return 'bookstore';
  return 'other';
}

function pickName(tags) {
  return (
    tags['name:en'] ||
    tags.name ||
    tags['name:ru'] ||
    tags['name:ky'] ||
    null
  );
}

function buildAddress(tags) {
  const parts = [];
  if (tags['addr:street']) parts.push(tags['addr:street']);
  if (tags['addr:housenumber']) parts.push(tags['addr:housenumber']);
  return parts.join(' ') || null;
}

function buildHours(tags) {
  const raw = tags.opening_hours || null;
  return {
    mon: raw,
    tue: raw,
    wed: raw,
    thu: raw,
    fri: raw,
    sat: raw,
    sun: raw,
  };
}

function buildAmenities(tags) {
  return {
    wifi: tags.internet_access === 'wlan' || tags.internet_access === 'yes' ? true : null,
    outlets: null,
    bathroom: tags.toilets === 'yes' ? true : null,
    food: tags.amenity === 'cafe' ? true : null,
    large_table: null,
    accessible:
      tags.wheelchair === 'yes' ? true : tags.wheelchair === 'no' ? false : null,
  };
}

async function fetchOverpass() {
  console.log('Querying Overpass API…');
  const url =
    'https://overpass-api.de/api/interpreter?data=' +
    encodeURIComponent(OVERPASS_QUERY);

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'StudySpot-Bishkek/0.1',
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Overpass error: ${res.status} — ${txt.slice(0, 300)}`);
  }

  const json = await res.json();
  console.log(`Got ${json.elements.length} raw results`);
  return json.elements;
}

function normalize(elements) {
  const seen = new Set();
  const out = [];

  for (const el of elements) {
    if (!el.tags) continue;
    const name = pickName(el.tags);
    if (!name) continue;

    const type = mapType(el.tags);
    if (type === 'other') continue;

    const osmId = `${el.type}/${el.id}`;
    if (seen.has(osmId)) continue;
    seen.add(osmId);

    let price_level = null;
    if (type === 'library') price_level = 0;
    else if (el.tags['fee'] === 'no') price_level = 0;

    out.push({
      name,
      type,
      address: buildAddress(el.tags),
      latitude: el.lat,
      longitude: el.lon,
      hours: buildHours(el.tags),
      price_level,
      amenities: buildAmenities(el.tags),
      study_attributes: {
        noise_level: null,
        best_for: [],
        not_ideal_for: [],
      },
      source: 'OpenStreetMap',
      last_verified: new Date().toISOString().slice(0, 10),
      notes: el.tags.description || null,
      osm_id: osmId,
      verified: false,
    });
  }

  return out;
}

async function seed() {
  const elements = await fetchOverpass();
  const spots = normalize(elements);
  console.log(`Normalized ${spots.length} unique spots`);

  const { data: existing } = await supabase.from('locations').select('name');
  const existingNames = new Set(
    (existing || []).map((l) => l.name.toLowerCase())
  );

  const toInsert = spots.filter(
    (s) => !existingNames.has(s.name.toLowerCase())
  );
  console.log(
    `${toInsert.length} new spots to insert (skipping ${
      spots.length - toInsert.length
    } duplicates)`
  );

  if (toInsert.length === 0) {
    console.log('Nothing new to insert.');
    return;
  }

  for (let i = 0; i < toInsert.length; i += 50) {
    const batch = toInsert.slice(i, i + 50);
    const { error } = await supabase.from('locations').insert(batch);
    if (error) {
      console.error('Batch error:', error.message);
    } else {
      console.log(`  Inserted batch ${Math.floor(i / 50) + 1} (${batch.length} rows)`);
    }
  }

  console.log('Done.');
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});