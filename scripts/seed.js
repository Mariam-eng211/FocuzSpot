import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';
import ws from 'ws';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    realtime: { transport: ws }
  }
);

const locations = JSON.parse(fs.readFileSync('seed/locations.json', 'utf8'));

async function seed() {
  console.log(`Seeding ${locations.length} locations...`);

  const { error: delErr } = await supabase
    .from('locations')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (delErr) console.warn('Delete warning:', delErr.message);

  const { data, error } = await supabase
    .from('locations')
    .insert(locations)
    .select('id, name');

  if (error) {
    console.error('❌ Insert failed:');
    console.error(error);
    process.exit(1);
  }

  console.log(`✅ Inserted ${data.length} locations:`);
  data.forEach((l, i) => console.log(`  ${i + 1}. ${l.name}`));
}

seed();