# StudySpot Bishkek

**Find your perfect study spot in Bishkek — right now.** Bilingual (EN / RU).

Live app: **https://focuzspot-3.vercel.app/**

---

## The Problem

Students in Bishkek struggle to find suitable study locations. Google Maps shows cafés, but not whether they're quiet, have working Wi-Fi, available outlets, or room to sit — **right now**. Reviews from 2024 don't tell you if you can actually study there today.

## The Solution

StudySpot matches students with study locations based on their individual needs and shows live conditions reported by other users. Instead of "4.5 stars, 842 reviews," you get:

> **"Quiet · 60% full · Wi-Fi working — reported 12 minutes ago"**

---

## Features

###  Personalized Matching
- Enter your needs: budget, noise level, Wi-Fi, power outlets
- Get **ranked results** with match scores (0–100%)
- Each result explains **why** it matched (reasons) and what's unknown (warnings)

###  Interactive Map
- **120+ verified study spots** across Bishkek
- Libraries, cafés, coworking spaces, bookstores, university spaces
- Auto-clustering when zoomed out, individual pins when zoomed in
- Category filters (All / Libraries / Cafés / Coworking / Other)

###  Rich Location Pages
- Live conditions (from user reports — see below)
- Static amenities: Wi-Fi, outlets, bathroom, food, large tables, accessibility
- Hours for every day of the week
- Price level, address, "Best for" / "Not ideal for" tags
- Direct integration with Yandex Taxi, Namba Taxi, 2GIS, Google Maps

###  Live Condition Reports
- Users report **occupancy, noise, outlets, Wi-Fi, and a comment**
- Reports **expire after 2 hours** — no stale data
- Freshness indicator: "Just now" / "23 min ago" / "No recent update"
- Automatic "No recent update" state when nothing fresh exists

###  User Accounts & Reputation
- Sign up with email (Supabase Auth)
- **Save favourite spots** (synced across devices)
- **Study timer** — start a session, stop it, earn points
- **Reputation system**: Rookie → Newcomer → Bronze → Silver → Gold Scout
- Profile dashboard: points, sessions, hours studied, saved spots

###  Bilingual (English / Russian)
- Full UI translation with `i18next`
- One-tap language toggle in the header
- Translations persist per user

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19 + Vite + TypeScript |
| Styling | Custom CSS with responsive breakpoints |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (email/password) |
| Row Level Security | Supabase RLS policies |
| Maps | MapLibre GL + react-map-gl + OpenFreeMap tiles |
| i18n | i18next + react-i18next |
| Routing | React Router v7 |
| Deployment | Vercel |

---

## How Matching Works

Every location goes through two layers:

### 1. Hard Filters (removes locations that fail)

- Wi-Fi required but location says no Wi-Fi → excluded
- Outlet required but location has none → excluded
- Budget = Free but location isn't free → excluded
- Budget = ≤100 but location is more expensive → excluded

### 2. Soft Scoring (0–100%)

| Criterion | Points |
|-----------|--------|
| Noise fit | 35 |
| Price fit | 25 |
| Wi-Fi availability | 20 |
| Outlet availability | 20 |

Unknown data (e.g., `noise_level: null`) receives **partial credit** and is shown to the user as an "unverified" warning — never treated as a failure.

---

## Data & Freshness

- **120+ locations** in Bishkek
- Sources: OpenStreetMap Overpass API (automated) + manual research (curated)
- **Stable facts** (address, coordinates, amenities) stored separately from **temporary conditions** (live reports)
- **Reports expire after 2 hours** automatically
- No non-expired report → "No recent update" displayed honestly

---

## Architecture

```
              User (browser)
                    │
        ┌───────────┼───────────┐
        ↓           ↓           ↓
    Preferences  Live Reports  Auth
        │           │           │
        └───────────┼───────────┘
                    ↓
            Supabase (PostgreSQL)
             ├── locations
             ├── reports (2h expiry)
             ├── saved_locations
             ├── study_sessions
             └── user_points
                    │
                    ↓
          Client-side Matching Engine
                    │
                    ↓
         Ranked Results + Live Conditions
```

- The **matching engine runs client-side** — instant results, no server round-trip
- **Supabase RLS** enforces that users only see and modify their own data
- **Reports insert directly** from the browser with an automatic 2-hour expiry timestamp

---

## Run Locally

### 1. Clone the repo

```bash
git clone https://github.com/Mariam-eng211/FocuzSpot.git
cd FocuzSpot
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create `.env`

```bash
cp .env.example .env
```

Fill in your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Start the dev server

```bash
npm run dev
```

Open **http://localhost:5173**

### 5. (Optional) Re-seed the database

```bash
# Load the base 20 curated locations
npm run seed

# Or fetch 100+ more from OpenStreetMap
node scripts/fetch-osm.js
```

---

## Database Schema

**`locations`** — study spots
- `id`, `name`, `type`, `address`, `latitude`, `longitude`
- `hours` (JSONB) — one string per day
- `price_level` — 0 (free) to 3 (expensive)
- `amenities` (JSONB) — Wi-Fi, outlets, bathroom, food, large table, accessible
- `study_attributes` (JSONB) — noise level, best for, not ideal for
- `rating`, `report_count`, `verified`, `source`, `osm_id`

**`reports`** — live conditions
- `location_id`, `occupancy`, `noise`, `outlets_available`, `wifi_working`, `comment`
- `created_at`, `expires_at` (auto = created_at + 2 hours)

**`saved_locations`** — user favourites (RLS: user-scoped)

**`study_sessions`** — timer history (RLS: user-scoped)

**`user_points`** — reputation (RLS: user-scoped writes, public reads for leaderboard)

---

## Limitations

- **Coverage:** Bishkek only
- **Live reports:** only appear when someone has reported within the last 2 hours
- **Automated data:** OSM-sourced locations may have unknown noise/outlets/Wi-Fi — shown honestly as "unverified"
- **No photo uploads** yet
- **No push notifications** yet
- **No AI natural-language search** yet

---

## Roadmap (Next Steps)

-  Photo uploads per location
-  Push notifications when saved spots get fresh reports
-  AI natural-language search ("quiet spot with Wi-Fi for 3 hours")
-  Study groups + buddy finder
-  Public leaderboard for top scouts
-  Multi-stop study day planner
-  Expansion to Almaty, Tashkent

---

## Credits

- **Location data:** OpenStreetMap contributors (ODbL) + manual research
- **Map tiles:** © OpenStreetMap via [OpenFreeMap](https://openfreemap.org/)
- **Icons:** Unicode emoji
- Built solo for the hackathon

---

## License

MIT
