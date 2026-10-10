import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { getLatestReport } from '../lib/reports';
import type { Location, Report } from '../lib/types';
import LiveConditions from '../components/LiveConditions';
import ReportForm from '../components/ReportForm';
import TaxiLinks from '../components/TaxiLinks';
import SaveButton from '../components/SaveButton';
import StudyTimer from '../components/StudyTimer';
import { useSession } from '../lib/useSession';

export default function LocationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { session } = useSession();

  const [location, setLocation] = useState<Location | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const refreshReport = useCallback(async () => {
    if (!id) return;
    const latest = await getLatestReport(id);
    setReport(latest);
  }, [id]);

  useEffect(() => {
    async function load() {
      if (!id) return;
      setLoading(true);

      const [locRes, latestReport] = await Promise.all([
        supabase.from('locations').select('*').eq('id', id).single(),
        getLatestReport(id),
      ]);

      if (locRes.error) setError(locRes.error.message);
      else setLocation(locRes.data as Location);

      setReport(latestReport);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <main className="page-shell">
        <p style={{ paddingTop: 40, color: '#77817b' }}>{t('common.loading')}</p>
      </main>
    );
  }

  if (error || !location) {
    return (
      <main className="page-shell">
        <header className="topbar">
          <Link className="wordmark" to="/explore">
            <span className="wordmark-icon">F</span>
            <span>Focuz<span className="accent">Spot</span></span>
          </Link>
        </header>
        <div style={{ paddingTop: 40 }}>
          <h1 style={{ fontSize: 28 }}>{t('location.notFound')}</h1>
          <p style={{ color: '#77817b' }}>{error ?? t('location.notFoundCopy')}</p>
          <Link
            to="/explore"
            className="primary-button"
            style={{ textDecoration: 'none', maxWidth: 260 }}
          >
            {t('location.backToMap')}
          </Link>
        </div>
      </main>
    );
  }

  const priceLabel =
    location.price_level === 0
      ? t('common.free')
      : location.price_level === 1
      ? t('common.under100')
      : location.price_level === 2
      ? t('common.under300')
      : t('common.expensive');

  const todayKey = (['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const)[
    new Date().getDay()
  ];
  const todayHours = location.hours?.[todayKey] ?? t('common.unknown');

  return (
    <main className="page-shell" style={{ paddingBottom: 120 }}>
      <header className="topbar">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="wordmark"
          style={{ background: 'none', border: 0, cursor: 'pointer' }}
        >
          {t('location.back')}
        </button>
        <SaveButton locationId={location.id} />
      </header>

      <section style={{ paddingTop: 34 }}>
        <p className="eyebrow" style={{ textTransform: 'capitalize' }}>
          {t(`common.type.${location.type}`)}
        </p>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)' }}>{location.name}</h1>
        {location.address && (
          <p className="hero-copy" style={{ marginTop: 10 }}>
            {location.address}
          </p>
        )}
      </section>

      <LiveConditions report={report} />

      <div className="action-row">
        <button
          type="button"
          className="primary-button"
          onClick={() => setShowForm(true)}
        >
          {t('location.report')} <span aria-hidden="true">→</span>
        </button>
        {session && (
          <StudyTimer
            userId={session.userId}
            locationId={location.id}
            onEnded={refreshReport}
          />
        )}
      </div>

      <TaxiLinks
        latitude={location.latitude}
        longitude={location.longitude}
        name={location.name}
      />

      <section className="facts-grid" style={{ marginTop: 32 }}>
        <div className="fact">
          <span className="fact-label">{t('location.price')}</span>
          <span className="fact-value">{priceLabel}</span>
        </div>
        <div className="fact">
          <span className="fact-label">{t('location.todayHours')}</span>
          <span className="fact-value">{todayHours}</span>
        </div>
        <div className="fact">
          <span className="fact-label">{t('location.noiseLevel')}</span>
          <span className="fact-value">
            {location.study_attributes.noise_level
              ? t(`format.${location.study_attributes.noise_level}`)
              : t('common.unknown')}
          </span>
        </div>
        <div className="fact">
          <span className="fact-label">{t('location.wifi')}</span>
          <span className="fact-value">
            {formatBool(location.amenities.wifi, t)}
          </span>
        </div>
        <div className="fact">
          <span className="fact-label">{t('location.outlets')}</span>
          <span className="fact-value">
            {location.amenities.outlets
              ? t(`format.${location.amenities.outlets}`)
              : t('common.unknown')}
          </span>
        </div>
        <div className="fact">
          <span className="fact-label">{t('location.bathroom')}</span>
          <span className="fact-value">
            {formatBool(location.amenities.bathroom, t)}
          </span>
        </div>
        <div className="fact">
          <span className="fact-label">{t('location.food')}</span>
          <span className="fact-value">
            {formatBool(location.amenities.food, t)}
          </span>
        </div>
        <div className="fact">
          <span className="fact-label">{t('location.largeTable')}</span>
          <span className="fact-value">
            {formatBool(location.amenities.large_table, t)}
          </span>
        </div>
        <div className="fact">
          <span className="fact-label">{t('location.accessible')}</span>
          <span className="fact-value">
            {formatBool(location.amenities.accessible, t)}
          </span>
        </div>
      </section>

      <div className="two-col">
        <section>
          <h3 className="section-title">{t('location.bestFor')}</h3>
          <ul className="pill-list">
            {location.study_attributes.best_for.length > 0 ? (
              location.study_attributes.best_for.map((b) => (
                <li key={b} className="pill pill-good">
                  ✓ {t(`featureTags.${b}`, b)}
                </li>
              ))
            ) : (
              <li className="pill" style={{ opacity: 0.6 }}>
                {t('location.notSpecified')}
              </li>
            )}
          </ul>
        </section>

        <section>
          <h3 className="section-title">{t('location.notIdealFor')}</h3>
          <ul className="pill-list">
            {location.study_attributes.not_ideal_for.length > 0 ? (
              location.study_attributes.not_ideal_for.map((b) => (
                <li key={b} className="pill pill-warn">
                  ✗ {t(`featureTags.${b}`, b)}
                </li>
              ))
            ) : (
              <li className="pill" style={{ opacity: 0.6 }}>
                {t('location.notSpecified')}
              </li>
            )}
          </ul>
        </section>
      </div>

      <section style={{ marginTop: 34 }}>
        <h3 className="section-title">{t('location.hoursThisWeek')}</h3>
        <ul className="hours-list">
          {(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const).map(
            (d) => (
              <li key={d} className={d === todayKey ? 'hours-today' : ''}>
                <span>{d.toUpperCase()}</span>
                <span>{location.hours?.[d] ?? t('common.unknown')}</span>
              </li>
            )
          )}
        </ul>
      </section>

      {(location.source || location.last_verified || location.notes) && (
        <section
          style={{
            marginTop: 34,
            color: '#77817b',
            fontSize: 12,
            lineHeight: 1.7,
          }}
        >
          {location.source && (
            <p>
              {t('location.source')}: {location.source}
            </p>
          )}
          {location.last_verified && (
            <p>
              {t('location.lastVerified')}: {location.last_verified}
            </p>
          )}
          {location.notes && (
            <p>
              {t('location.note')}: {location.notes}
            </p>
          )}
        </section>
      )}

      {showForm && (
        <ReportForm
          locationId={location.id}
          onClose={() => setShowForm(false)}
          onSubmitted={refreshReport}
        />
      )}
    </main>
  );
}

function formatBool(
  v: boolean | null,
  t: (key: string) => string
): string {
  if (v === true) return t('common.yes');
  if (v === false) return t('common.no');
  return t('common.unknown');
}