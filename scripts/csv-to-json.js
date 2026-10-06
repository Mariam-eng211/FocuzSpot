import fs from 'fs';
import Papa from 'papaparse';

const csv = fs.readFileSync('locations.csv', 'utf8');
const { data } = Papa.parse(csv, { header: true, skipEmptyLines: true });

const toBool = (v) => v === 'yes' ? true : v === 'no' ? false : null;
const toArr  = (v) => v && v !== 'unknown'
  ? v.split(',').map(s => s.trim()).filter(Boolean)
  : [];

const locations = data.map(row => ({
  name: row.name,
  type: row.type,
  address: row.address,
  latitude: parseFloat(row.latitude),
  longitude: parseFloat(row.longitude),
  hours: {
    mon: row.hours_mon, tue: row.hours_tue, wed: row.hours_wed,
    thu: row.hours_thu, fri: row.hours_fri, sat: row.hours_sat,
    sun: row.hours_sun
  },
  price_level: parseInt(row.price_level),
  amenities: {
    wifi: toBool(row.wifi),
    outlets: row.outlets === 'unknown' ? null : row.outlets,
    bathroom: toBool(row.bathroom),
    food: toBool(row.food),
    large_table: toBool(row.large_table),
    accessible: toBool(row.accessible)
  },
  study_attributes: {
    noise_level: row.noise_level === 'unknown' ? null : row.noise_level,
    best_for: toArr(row.best_for),
    not_ideal_for: toArr(row.not_ideal_for)
  },
  source: row.source,
  last_verified: row.last_verified || null,
  notes: row.notes || null
}));

fs.writeFileSync('seed/locations.json', JSON.stringify(locations, null, 2));
console.log(`✅ Converted ${locations.length} locations → seed/locations.json`);