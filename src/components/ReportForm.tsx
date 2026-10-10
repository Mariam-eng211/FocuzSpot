import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Report } from '../lib/types';
import { createReport } from '../lib/reports';

type Props = {
  locationId: string;
  onClose: () => void;
  onSubmitted: () => void;
};

type FormState = {
  occupancy: Report['occupancy'];
  noise: Report['noise'];
  outlets_available: Report['outlets_available'];
  wifi_working: boolean | null;
  comment: string;
};

export default function ReportForm({ locationId, onClose, onSubmitted }: Props) {
  const { t } = useTranslation();

  const [form, setForm] = useState<FormState>({
    occupancy: 'half',
    noise: 'quiet',
    outlets_available: 'some',
    wifi_working: true,
    comment: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const result = await createReport({
      location_id: locationId,
      occupancy: form.occupancy,
      noise: form.noise,
      outlets_available: form.outlets_available,
      wifi_working: form.wifi_working,
      comment: form.comment.trim() || null,
    });

    setSubmitting(false);

    if (!result.ok) {
      setError(result.error ?? t('common.error'));
      return;
    }

    onSubmitted();
    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <p className="eyebrow" style={{ margin: 0 }}>{t('report.eyebrow')}</p>
            <h2 style={{ fontSize: 20, margin: '4px 0 0' }}>{t('report.title')}</h2>
          </div>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="report-form">
          <fieldset className="report-group">
            <legend>{t('report.occupancy')}</legend>
            {(
              [
                ['empty', t('report.occEmpty')],
                ['half', t('report.occHalf')],
                ['busy', t('report.occBusy')],
                ['full', t('report.occFull')],
              ] as [Report['occupancy'], string][]
            ).map(([v, label]) => (
              <label key={v} className="radio-option">
                <input
                  type="radio"
                  name="occupancy"
                  value={v}
                  checked={form.occupancy === v}
                  onChange={() => setForm((f) => ({ ...f, occupancy: v }))}
                />
                <span>{label}</span>
              </label>
            ))}
          </fieldset>

          <fieldset className="report-group">
            <legend>{t('report.noise')}</legend>
            {(
              [
                ['very_quiet', t('report.noiseVeryQuiet')],
                ['quiet', t('report.noiseQuiet')],
                ['moderate', t('report.noiseModerate')],
                ['loud', t('report.noiseLoud')],
              ] as [Report['noise'], string][]
            ).map(([v, label]) => (
              <label key={v} className="radio-option">
                <input
                  type="radio"
                  name="noise"
                  value={v}
                  checked={form.noise === v}
                  onChange={() => setForm((f) => ({ ...f, noise: v }))}
                />
                <span>{label}</span>
              </label>
            ))}
          </fieldset>

          <fieldset className="report-group">
            <legend>{t('report.outlets')}</legend>
            {(
              [
                ['many', t('report.outletsMany')],
                ['some', t('report.outletsSome')],
                ['none', t('report.outletsNone')],
                ['unknown', t('report.outletsUnknown')],
              ] as [Report['outlets_available'], string][]
            ).map(([v, label]) => (
              <label key={v} className="radio-option">
                <input
                  type="radio"
                  name="outlets"
                  value={v}
                  checked={form.outlets_available === v}
                  onChange={() =>
                    setForm((f) => ({ ...f, outlets_available: v }))
                  }
                />
                <span>{label}</span>
              </label>
            ))}
          </fieldset>

          <fieldset className="report-group">
            <legend>{t('report.wifi')}</legend>
            {(
              [
                [true, t('report.wifiWorking')],
                [false, t('report.wifiBroken')],
                [null, t('report.wifiUnknown')],
              ] as [boolean | null, string][]
            ).map(([v, label]) => (
              <label key={String(v)} className="radio-option">
                <input
                  type="radio"
                  name="wifi"
                  checked={form.wifi_working === v}
                  onChange={() => setForm((f) => ({ ...f, wifi_working: v }))}
                />
                <span>{label}</span>
              </label>
            ))}
          </fieldset>

          <label className="report-group">
            <span className="report-label">{t('report.comment')}</span>
            <textarea
              value={form.comment}
              onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
              placeholder={t('report.commentPlaceholder')}
              maxLength={200}
              rows={3}
              className="report-textarea"
            />
          </label>

          {error && <p className="form-error">{error}</p>}

          <div className="report-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
              disabled={submitting}
            >
              {t('report.cancel')}
            </button>
            <button
              type="submit"
              className="primary-button"
              disabled={submitting}
              style={{ width: 'auto', minWidth: 140 }}
            >
              {submitting ? t('report.submitting') : t('report.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}