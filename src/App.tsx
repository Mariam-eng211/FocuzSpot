import { useState } from 'react';

type Preferences = {
  budget: string;
  noise: string;
  wifi: boolean;
  outlet: boolean;
};

export default function App() {
  const [preferences, setPreferences] = useState<Preferences>({
    budget: 'free',
    noise: 'quiet',
    wifi: true,
    outlet: false,
  });
  const [submitted, setSubmitted] = useState(false);

  function update<K extends keyof Preferences>(key: K, value: Preferences[K]) {
    setPreferences((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="wordmark" href="#top" aria-label="FocuzSpot home">
          <span className="wordmark-icon" aria-hidden="true">F</span>
          <span>Focuz<span className="accent">Spot</span></span>
        </a>
        <span className="location-pill"><span className="status-dot" /> Bishkek, Kyrgyzstan</span>
      </header>

      <section className="hero" id="top">
        <p className="eyebrow">A better place to focus</p>
        <h1>Where should you <span>study?</span></h1>
        <p className="hero-copy">
          Find public and student-accessible study spaces in Bishkek that fit your needs.
        </p>
      </section>

      <section className="search-card" aria-labelledby="preferences-title">
        <div className="card-heading">
          <div>
            <p className="eyebrow">Make it yours</p>
            <h2 id="preferences-title">What do you need?</h2>
          </div>
          <span className="step-label">01 <span>/ 02</span></span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field-grid">
            <label className="field">
              <span className="field-label">Budget</span>
              <select value={preferences.budget} onChange={(event) => update('budget', event.target.value)}>
                <option value="free">Free</option>
                <option value="under-100">Up to 100 сом</option>
                <option value="under-300">Up to 300 сом</option>
                <option value="any">Any budget</option>
              </select>
            </label>

            <label className="field">
              <span className="field-label">Noise level</span>
              <select value={preferences.noise} onChange={(event) => update('noise', event.target.value)}>
                <option value="quiet">Quiet</option>
                <option value="some-noise">Some background noise</option>
                <option value="any">No preference</option>
              </select>
            </label>
          </div>

          <fieldset className="requirements">
            <legend>Must-have amenities</legend>
            <label className="check-option">
              <input type="checkbox" checked={preferences.wifi} onChange={(event) => update('wifi', event.target.checked)} />
              <span className="custom-check" aria-hidden="true">✓</span>
              <span>Wi-Fi</span>
            </label>
            <label className="check-option">
              <input type="checkbox" checked={preferences.outlet} onChange={(event) => update('outlet', event.target.checked)} />
              <span className="custom-check" aria-hidden="true">✓</span>
              <span>Power outlet</span>
            </label>
          </fieldset>

          <button className="primary-button" type="submit">
            Find my spot <span aria-hidden="true">→</span>
          </button>
        </form>

        {submitted && (
          <p className="prototype-note" role="status">
            Preferences saved. Verified study-space matches will appear here as the directory is added.
          </p>
        )}
      </section>

      <footer className="page-footer">
        <span>Built for students in Bishkek</span>
        <span>Only recent user reports will be shown as current conditions.</span>
      </footer>
    </main>
  );
}
