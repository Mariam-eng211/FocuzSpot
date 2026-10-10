import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Preferences } from '../lib/types';
import LanguageToggle from '../components/LanguageToggle';

export default function Home() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [preferences, setPreferences] = useState<Preferences>({
    budget: 'free',
    noise: 'quiet',
    wifi: true,
    outlet: false,
  });

  function update<K extends keyof Preferences>(key: K, value: Preferences[K]) {
    setPreferences((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    localStorage.setItem('studyspot_prefs', JSON.stringify(preferences));
    navigate('/results', { state: { preferences } });
  }

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="wordmark" href="/" aria-label="FocuzSpot home">
          <span className="wordmark-icon" aria-hidden="true">F</span>
          <span>Focuz<span className="accent">Spot</span></span>
        </a>
        <nav style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link
            to="/explore"
            className="location-pill"
            style={{ textDecoration: 'none' }}
          >
            🗺 {t('nav.map')}
          </Link>
          <LanguageToggle />
        </nav>
      </header>

      <section className="hero" id="top">
        <p className="eyebrow">{t('home.eyebrow')}</p>
        <h1>
          {t('home.title1')} <span>{t('home.title2')}</span>
        </h1>
        <p className="hero-copy">{t('home.copy')}</p>
      </section>

      <section className="search-card" aria-labelledby="preferences-title">
        <div className="card-heading">
          <div>
            <p className="eyebrow">{t('home.makeItYours')}</p>
            <h2 id="preferences-title">{t('home.whatYouNeed')}</h2>
          </div>
          <span className="step-label">01 <span>/ 02</span></span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field-grid">
            <label className="field">
              <span className="field-label">{t('prefs.budget')}</span>
              <select
                value={preferences.budget}
                onChange={(event) =>
                  update('budget', event.target.value as Preferences['budget'])
                }
              >
                <option value="free">{t('prefs.budgetFree')}</option>
                <option value="under-100">{t('prefs.budget100')}</option>
                <option value="under-300">{t('prefs.budget300')}</option>
                <option value="any">{t('prefs.budgetAny')}</option>
              </select>
            </label>

            <label className="field">
              <span className="field-label">{t('prefs.noise')}</span>
              <select
                value={preferences.noise}
                onChange={(event) =>
                  update('noise', event.target.value as Preferences['noise'])
                }
              >
                <option value="quiet">{t('prefs.noiseQuiet')}</option>
                <option value="some-noise">{t('prefs.noiseSome')}</option>
                <option value="any">{t('prefs.noiseAny')}</option>
              </select>
            </label>
          </div>

          <fieldset className="requirements">
            <legend>{t('prefs.requirements')}</legend>
            <label className="check-option">
              <input
                type="checkbox"
                checked={preferences.wifi}
                onChange={(event) => update('wifi', event.target.checked)}
              />
              <span className="custom-check" aria-hidden="true">✓</span>
              <span>{t('prefs.wifi')}</span>
            </label>
            <label className="check-option">
              <input
                type="checkbox"
                checked={preferences.outlet}
                onChange={(event) => update('outlet', event.target.checked)}
              />
              <span className="custom-check" aria-hidden="true">✓</span>
              <span>{t('prefs.outlet')}</span>
            </label>
          </fieldset>

          <button className="primary-button" type="submit">
            {t('prefs.find')} <span aria-hidden="true">→</span>
          </button>
        </form>
      </section>

      <footer className="page-footer">
        <span>Built for students in Bishkek</span>
        <span>Only recent user reports will be shown as current conditions.</span>
      </footer>
    </main>
  );
}