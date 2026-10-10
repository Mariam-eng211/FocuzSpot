import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { signIn, signUp } from '../lib/auth';

export default function SignIn() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result =
      mode === 'signin'
        ? await signIn(email, password)
        : await signUp(email, password);

    setLoading(false);

    if (!result.ok) {
      setError(result.error ?? t('common.error'));
      return;
    }
    navigate('/profile');
  }

  return (
    <main className="page-shell" style={{ paddingBottom: 120 }}>
      <header className="topbar">
        <Link className="wordmark" to="/">
          <span className="wordmark-icon">F</span>
          <span>Focuz<span className="accent">Spot</span></span>
        </Link>
      </header>

      <section style={{ paddingTop: 34, maxWidth: 420 }}>
        <p className="eyebrow">{t('auth.signIn')}</p>
        <h1 style={{ fontSize: 'clamp(26px, 4vw, 36px)' }}>
          {mode === 'signin' ? t('auth.signIn') : t('auth.signUp')}
        </h1>

        <form
          onSubmit={handleSubmit}
          style={{ marginTop: 28, display: 'grid', gap: 16 }}
        >
          <label className="field">
            <span className="field-label">{t('auth.email')}</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-input"
              placeholder="you@example.com"
            />
          </label>

          <label className="field">
            <span className="field-label">{t('auth.password')}</span>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="text-input"
              placeholder="••••••"
            />
          </label>

          {error && <p className="form-error">{error}</p>}

          <button
            type="submit"
            className="primary-button"
            disabled={loading}
            style={{ marginTop: 8 }}
          >
            {loading ? t('common.loading') : t('auth.submit')}
          </button>
        </form>

        <p
          style={{
            marginTop: 20,
            color: '#77817b',
            fontSize: 13,
            textAlign: 'center',
          }}
        >
          {mode === 'signin' ? t('auth.noAccount') : t('auth.haveAccount')}{' '}
          <button
            type="button"
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            style={{
              background: 'none',
              border: 0,
              color: 'var(--green)',
              fontWeight: 700,
              cursor: 'pointer',
              padding: 0,
            }}
          >
            {mode === 'signin' ? t('auth.signUp') : t('auth.signIn')}
          </button>
        </p>
      </section>
    </main>
  );
}