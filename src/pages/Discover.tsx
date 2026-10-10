import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import type { Location } from '../lib/types';

export default function Discover() {
  const { t } = useTranslation();
  const [allLocations, setAllLocations] = useState<Location[]>([]);
  const [trendingIds, setTrendingIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      // All locations for top/new sections
      const { data: locs } = await supabase
        .from('locations')
        .select('*')
        .limit(500);

      // Recent reports (last 24h) to compute trending
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: reports } = await supabase
        .from('reports')
        .select('location_id, created_at')
        .gt('created_at', since);

      setAllLocations((locs as Location[]) ?? []);

      // Count reports per location, sort desc, take top 8 IDs
      if (reports) {
        const counts: Record<string, number> = {};
        for (const r of reports) {
          counts[r.location_id] = (counts[r.location_id] ?? 0) + 1;
        }
        const top = Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .map(([id]) => id);
        setTrendingIds(top);
      }

      setLoading(false);
    }
    load();
  }, []);

  const topRated = useMemo(() => {
    return [...allLocations]
      .sort((a, b) => {
        const ra = a.rating ?? -1;
        const rb = b.rating ?? -1;
        if (rb !== ra) return rb - ra;
        // Fallback: locations with a report count rank higher
        const ca = a.report_count ?? 0;
        const cb = b.report_count ?? 0;
        return cb - ca;
      })
      .slice(0, 8);
  }, [allLocations]);

  const newThisWeek = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return [...allLocations]
      .filter((l) => {
        const t = l as Location & { created_at?: string };
        return t.created_at ? new Date(t.created_at).getTime() > weekAgo : false;
      })
      .sort((a, b) => {
        const ta = new Date((a as Location & { created_at: string }).created_at).getTime();
        const tb = new Date((b as Location & { created_at: string }).created_at).getTime();
        return tb - ta;
      })
      .slice(0, 8);
  }, [allLocations]);

  const trending = useMemo(() => {
    return trendingIds
      .map((id) => allLocations.find((l) => l.id === id))
      .filter((x): x is Location => !!x);
  }, [trendingIds, allLocations]);

  if (loading) {
    return (
      <main className="page-shell" style={{ paddingBottom: 120 }}>
        <Header />
        <p style={{ paddingTop: 34, color: '#77817b' }}>{t('common.loading')}</p>
      </main>
    );
  }

  return (
    <main className="page-shell" style={{ paddingBottom: 120 }}>
      <Header />

      <section style={{ paddingTop: 34 }}>
        <p className="eyebrow">{t('discover.title')}</p>
        <h1 style={{ fontSize: 'clamp(26px, 4vw, 38px)' }}>
          {t('discover.title')}
        </h1>
      </section>

      <Section
        title={t('discover.trending')}
        empty="No reports in the last 24 hours. Be the first to report a spot!"
        locations={trending}
      />

      <Section
        title={t('discover.top')}
        empty="No ratings yet. Report on a location to help rank it."
        locations={topRated}
      />

      <Section
        title={t('discover.new')}
        empty="No new spots added in the last week."
        locations={newThisWeek}
      />
    </main>
  );
}

function Header() {
  return (
    <header className="topbar">
      <span className="wordmark">
        <span className="wordmark-icon">F</span>
        <span>
          Focuz<span className="accent">Spot</span>
        </span>
      </span>
    </header>
  );
}

function Section({
  title,
  empty,
  locations,
}: {
  title: string;
  empty: string;
  locations: Location[];
}) {
  const { t } = useTranslation();

  return (
    <section style={{ marginTop: 34 }}>
      <h3 className="section-title">{title}</h3>

      {locations.length === 0 ? (
        <p style={{ color: '#77817b', fontSize: 13 }}>{empty}</p>
      ) : (
        <div className="results-list">
          {locations.map((loc) => (
            <Link
              key={loc.id}
              to={`/location/${loc.id}`}
              className="result-card"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className="result-head">
                <div className="result-title">
                  <h3>{loc.name}</h3>
                  <p className="result-meta">
                    {t(`common.type.${loc.type}`)}
                    {loc.address ? ` · ${loc.address}` : ''}
                  </p>
                </div>
                {loc.rating != null && (
                  <div className="result-score score-high">
                    {loc.rating.toFixed(1)}★
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}