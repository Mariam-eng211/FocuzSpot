import { useTranslation } from 'react-i18next';
import type { Report } from '../lib/types';
import { formatFreshness, freshnessLevel } from '../lib/reports';

export default function LiveConditions({ report }: { report: Report | null }) {
  const { t } = useTranslation();

  if (!report) {
    return (
      <section className="live-card">
        <div className="live-head">
          <h2 style={{ fontSize: 18 }}>{t('location.liveConditions')}</h2>
          <span className="live-freshness live-freshness-empty">
            {t('location.noUpdate')}
          </span>
        </div>
        <p className="live-empty">{t('location.noUpdateCopy')}</p>
      </section>
    );
  }

  const level = freshnessLevel(report.created_at);
  const freshnessText = formatFreshness(report.created_at, t);

  const wifiLabel =
    report.wifi_working === true
      ? t('report.wifiWorking')
      : report.wifi_working === false
      ? t('report.wifiBroken')
      : t('report.wifiUnknown');

  return (
    <section className="live-card">
      <div className="live-head">
        <h2 style={{ fontSize: 18 }}>{t('location.liveConditions')}</h2>
        <span className={`live-freshness live-freshness-${level}`}>
          {freshnessText}
        </span>
      </div>

      <div className="live-grid">
        <div className="live-stat">
          <span className="live-label">{t('report.occupancy')}</span>
          <span className="live-value">
            {t(`occupancyLabel.${report.occupancy}`)}
          </span>
        </div>
        <div className="live-stat">
          <span className="live-label">{t('report.noise')}</span>
          <span className="live-value">{t(`noiseLabel.${report.noise}`)}</span>
        </div>
        <div className="live-stat">
          <span className="live-label">{t('report.outlets')}</span>
          <span className="live-value">
            {t(`outletsLabel.${report.outlets_available}`)}
          </span>
        </div>
        <div className="live-stat">
          <span className="live-label">{t('report.wifi')}</span>
          <span className="live-value">{wifiLabel}</span>
        </div>
      </div>

      {report.comment && <p className="live-comment">"{report.comment}"</p>}
    </section>
  );
}