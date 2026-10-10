import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import type { Location } from '../lib/types';

const KEY = 'studyspot_saved';

export default function Saved() {
  const { t } = useTranslation();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const ids: string[] = JSON.parse(localStorage.getItem(KEY) || '[]');
      if (ids.length === 0) {
        setLoading(false);
        return;
      }
      const { data } = await supabase.from('locations').select('*').in('id', ids);
      setLocations((data as Location[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <main className="page-shell" style={{ paddingBottom: 120 }}>
      <header className="topbar">
        <span className="wordmark">
          <span className="wordmark-icon">F</span>
          <span>Focuz<span className="accent">Spot</span></span>
        </span>
      </header>

      <section style={{ paddingTop: 34 }}>
        <p className="eyebrow">{t('saved.title')}</p>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)' }}>
          {locations.length > 0
            ? `${locations.length} ${t('saved.title').toLowerCase()}`
            : t('saved.empty')}
        </h1>
      </section>

      {loading && <p style={{ color: '#77817b' }}>{t('common.loading')}</p>}

      {!loading && locations.length === 0 && (
        <>
          <p className="hero-copy">{t('saved.emptyCopy')}</p>
          <Link
            to="/explore"
            className="primary-button"
            style={{ textDecoration: 'none', maxWidth: 260, marginTop: 20 }}
          >
            {t('saved.exploreLink')}
          </Link>
        </>
      )}

      {locations.length > 0 && (
        <div className="results-list">
          {locations.map((loc) => (
            <Link
              key={loc.id}
              to={`/location/${loc.id}`}
              className="result-card"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className="result-head">
                <span className="result-rank">⭐</span>
                <div className="result-title">
                  <h3>{loc.name}</h3>
                  <p className="result-meta">
                    {t(`common.type.${loc.type}`)} · {loc.address}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}