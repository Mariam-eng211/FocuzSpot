import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { endSession, startSession } from '../lib/studySessions';
import { awardPoints } from '../lib/points';

type Props = {
  userId: string;
  locationId: string;
  onEnded?: (minutes: number) => void;
};

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m
    .toString()
    .padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function StudyTimer({ userId, locationId, onEnded }: Props) {
  const { t } = useTranslation();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [starting, setStarting] = useState(false);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    const tick = setInterval(() => {
      if (startRef.current) {
        setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
      }
    }, 1000);
    return () => clearInterval(tick);
  }, [sessionId]);

  async function start() {
    setStarting(true);
    const session = await startSession(userId, locationId);
    setStarting(false);
    if (!session) return;

    setSessionId(session.id);
    startRef.current = Date.now();
    setElapsed(0);
  }

  async function stop() {
    if (!sessionId) return;
    const minutes = elapsed / 60;
    await endSession(sessionId, minutes);
    await awardPoints(userId, 10);
    setSessionId(null);
    startRef.current = null;
    if (onEnded) onEnded(minutes);
    setElapsed(0);
  }

  if (!sessionId) {
    return (
      <button
        type="button"
        className="secondary-button"
        onClick={start}
        disabled={starting}
      >
        ⏱ {starting ? t('common.loading') : 'Start study session'}
      </button>
    );
  }

  return (
    <div className="study-timer-active">
      <span className="timer-display">{formatTime(elapsed)}</span>
      <button type="button" className="secondary-button" onClick={stop}>
        ⏹ Stop & save (+10 pts)
      </button>
    </div>
  );
}