import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getSavedIds, saveSpot, unsaveSpot } from '../lib/savedSpots';
import { useSession } from '../lib/useSession';

export default function SaveButton({ locationId }: { locationId: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { session } = useSession();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!session) {
      // Fallback to localStorage for guests
      const ids: string[] = JSON.parse(localStorage.getItem('studyspot_saved') || '[]');
      setSaved(ids.includes(locationId));
      return;
    }
    getSavedIds(session.userId).then((ids) => setSaved(ids.includes(locationId)));
  }, [session, locationId]);

  async function toggle() {
    if (busy) return;
    setBusy(true);

    if (!session) {
      // Guest mode — localStorage
      const ids: string[] = JSON.parse(localStorage.getItem('studyspot_saved') || '[]');
      const next = ids.includes(locationId)
        ? ids.filter((id) => id !== locationId)
        : [...ids, locationId];
      localStorage.setItem('studyspot_saved', JSON.stringify(next));
      setSaved(next.includes(locationId));
      setBusy(false);
      return;
    }

    if (saved) {
      await unsaveSpot(session.userId, locationId);
      setSaved(false);
    } else {
      await saveSpot(session.userId, locationId);
      setSaved(true);
    }
    setBusy(false);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`save-button ${saved ? 'saved' : ''}`}
      aria-label={saved ? t('saved.savedLabel') : t('saved.save')}
    >
      <span className="save-icon">{saved ? '❤️' : '🤍'}</span>
      <span>{saved ? t('saved.savedLabel') : t('saved.save')}</span>
    </button>
  );
}