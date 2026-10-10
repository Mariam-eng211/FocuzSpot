import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { rankLocations, type MatchResult } from '../lib/matching';
import type { Location, Preferences } from '../lib/types';

export default function Results() {
  const routerLocation = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const routerState = routerLocation.state as {
    preferences: Preferences;
  } | null;
  const preferences: Preferences | null =
    routerState?.preferences ??
    (localStorage.getItem('studyspot_prefs')
      ? JSON.parse(localStorage.getItem('studyspot_prefs')!)
      : null);

  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(20);

  useEffect(() => {
    if (!preferences) navigate('/', { replace: true });
  }, [preferences, navigate]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data, error } = await supabase.from('locations').select('*');
      if (error) setError(error.message);
      else setLocations(data as Location[]);
      setLoading(false);
    }
    load();
  }, []);

  const allResults: MatchResult[] = useMemo(() => {
    if (!preferences || locations.length === 0) return [];
    return rankLocations(locations, preferences);
  }, [locations, preferences]);

  const results = allResults.slice(0, visibleCount);

  if (!preferences) return null;

  const headerLabel = loading
    ? t('results.finding')
    : allResults.length === 0
    ? t('results.none')
    : t('results.other', { count: allResults.length });

  const budgetLabel =
    preferences.budget === 'free'
      ? t('prefs.budgetFree')
      : preferences.budget === 'under-100'
      ? t('prefs.budget100')
      : preferences.budget === 'under-300'
      ? t('prefs.budget300')
      : t('prefs.budgetAny');

  const noiseLabel =
    preferences.noise === 'quiet'
      ? t('prefs.noiseQuiet')
      : preferences.noise === 'some-noise'
      ? t('prefs.noiseSome')
      : t('prefs.noiseAny');

  return (
    <main className="page-shell" style={{ paddingBottom: 100 }}>
      <header className="topbar">
        <Link className="wordmark" to="/">
          <span className="wordmark-icon">F</span>
          <span>Focuz<span className="accent">Spot</span></span>
        </Link>
        <nav style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Link
            to="/explore"
            className="location-pill"
            style={{ textDecoration: 'none' }}
          >
            {t('results.exploreLink')}
          </Link>
          <Link
            to="/"
            className="location-pill"
            style={{ textDecoration: 'none' }}
          >
            {t('results.change')}
          </Link>
        </nav>
      </header>

      <section className="hero" style={{ paddingTop: 44, paddingBottom: 24 }}>
        <p className="eyebrow">{t('results.eyebrow')}</p>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)' }}>{headerLabel}</h1>
        <p className="hero-copy">
          {budgetLabel}
          {' · '}
          {noiseLabel}
          {preferences.wifi && ` · ${t('prefs.wifi')}`}
          {preferences.outlet && ` · ${t('prefs.outlet')}`}
        </p>
      </section>

      <section>
        {loading && <p style={{ color: '#77817b' }}>{t('results.loading')}</p>}
        {error && <p style={{ color: 'crimson' }}>Error: {error}</p>}

        {!loading && !error && allResults.length === 0 && (
          <div className="no-matches">
            <h2>{t('results.emptyTitle')}</h2>
            <p>{t('results.emptyCopy')}</p>
            <Link
              to="/"
              className="primary-button"
              style={{ textDecoration: 'none' }}
            >
              {t('results.adjust')} <span aria-hidden="true">→</span>
            </Link>
          </div>
        )}

        {!loading && !error && allResults.length > 0 && (
          <>
            <div className="results-list">
              {results.map((r, i) => (
                <MatchCard key={r.location.id} result={r} rank={i + 1} />
              ))}
            </div>
            {visibleCount < allResults.length && (
              <button
                type="button"
                className="primary-button"
                style={{ marginTop: 20, maxWidth: 320 }}
                onClick={() => setVisibleCount((c) => c + 20)}
              >
                {t('results.loadMore', {
                  count: allResults.length - visibleCount,
                })}
              </button>
            )}
          </>
        )}
      </section>
    </main>
  );
}

function MatchCard({ result, rank }: { result: MatchResult; rank: number }) {
  const { t } = useTranslation();
  const { location, score, reasonKeys, warningKeys } = result;

  const scoreClass =
    score >= 80 ? 'score-high' : score >= 60 ? 'score-mid' : 'score-low';

  const rankBadge =
    rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;

  const priceLabel =
    location.price_level === 0
      ? t('common.free')
      : location.price_level === 1
      ? t('common.under100')
      : location.price_level === 2
      ? t('common.under300')
      : t('common.expensive');

  return (
    <Link
      to={`/location/${location.id}`}
      className="result-card"
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <div className="result-head">
        <span className="result-rank">{rankBadge}</span>
        <div className="result-title">
          <h3>{location.name}</h3>
          <p className="result-meta">
            {t(`common.type.${location.type}`)} · {priceLabel}
          </p>
        </div>
        <div className={`result-score ${scoreClass}`}>{score}%</div>
      </div>

      {(reasonKeys.length > 0 || warningKeys.length > 0) && (
        <div className="result-tags">
          {reasonKeys.map((k) => (
            <span key={k} className="tag tag-good">
              ✓ {t(k)}
            </span>
          ))}
          {warningKeys.map((k) => (
            <span key={k} className="tag tag-warn">
              ⚠ {t(k)}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}