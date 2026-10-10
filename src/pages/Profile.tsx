import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { signOut } from '../lib/auth';
import { useSession } from '../lib/useSession';
import { getUserPoints, levelFromPoints } from '../lib/points';
import { getUserSessions, getUserStats, type StudySession } from '../lib/studySessions';
import { getSavedIds } from '../lib/savedSpots';

export default function Profile() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { session, loading: authLoading } = useSession();

  const [points, setPoints] = useState(0);
  const [stats, setStats] = useState({ totalMinutes: 0, totalSessions: 0 });
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    if (!session) return;
    const uid = session.userId;
    Promise.all([
      getUserPoints(uid),
      getUserStats(uid),
      getUserSessions(uid),
      getSavedIds(uid),
    ]).then(([p, s, list, saved]) => {
      setPoints(p);
      setStats(s);
      setSessions(list);
      setSavedCount(saved.length);
    });
  }, [session]);

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  if (authLoading) {
    return (
      <main className="page-shell" style={{ paddingBottom: 120 }}>
        <p style={{ paddingTop: 40, color: '#77817b' }}>{t('common.loading')}</p>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="page-shell" style={{ paddingBottom: 120 }}>
        <header className="topbar">
          <span className="wordmark">
            <span className="wordmark-icon">F</span>
            <span>Focuz<span className="accent">Spot</span></span>
          </span>
        </header>
        <section style={{ paddingTop: 34 }}>
          <p className="eyebrow">{t('profile.title')}</p>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)' }}>{t('profile.signIn')}</h1>
          <p className="hero-copy">
            {t('saved.signInPrompt')} · {t('profile.points')} · {t('profile.sessions')}
          </p>
          <Link
            to="/signin"
            className="primary-button"
            style={{ textDecoration: 'none', maxWidth: 260, marginTop: 20, display: 'inline-flex' }}
          >
            {t('auth.signIn')} →
          </Link>
        </section>
      </main>
    );
  }

  const { level, nextAt } = levelFromPoints(points);
  const hours = Math.floor(stats.totalMinutes / 60);

  return (
    <main className="page-shell" style={{ paddingBottom: 120 }}>
      <header className="topbar">
        <span className="wordmark">
          <span className="wordmark-icon">F</span>
          <span>Focuz<span className="accent">Spot</span></span>
        </span>
        <button
          type="button"
          className="secondary-button"
          onClick={handleSignOut}
          style={{ padding: '8px 14px', minHeight: 36, fontSize: 12 }}
        >
          {t('profile.signOut')}
        </button>
      </header>

      <section style={{ paddingTop: 34 }}>
        <p className="eyebrow">{t('profile.title')}</p>
        <h1 style={{ fontSize: 'clamp(26px, 4vw, 36px)' }}>{session.email}</h1>
        <p className="hero-copy">
          <span className="badge">{level}</span> · {points} {t('profile.points')} →{' '}
          {nextAt}
        </p>
      </section>

      <section className="stats-grid" style={{ marginTop: 28 }}>
        <div className="stat-card">
          <span className="stat-value">{points}</span>
          <span className="stat-label">{t('profile.points')}</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.totalSessions}</span>
          <span className="stat-label">{t('profile.sessions')}</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{hours}</span>
          <span className="stat-label">{t('profile.hours')}</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{savedCount}</span>
          <span className="stat-label">{t('profile.savedCount')}</span>
        </div>
      </section>

      <section style={{ marginTop: 34 }}>
        <h3 className="section-title">{t('profile.recentSessions')}</h3>
        {sessions.length === 0 ? (
          <p style={{ color: '#77817b', fontSize: 13 }}>
            No sessions yet. Open a location and tap "Start study session".
          </p>
        ) : (
          <ul className="hours-list">
            {sessions.map((s) => (
              <li key={s.id}>
                <span>
                  {new Date(s.started_at).toLocaleDateString()}{' '}
                  {new Date(s.started_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <span>{s.duration_minutes ?? 0} min</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}