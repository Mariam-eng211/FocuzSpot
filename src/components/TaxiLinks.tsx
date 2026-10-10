import { useTranslation } from 'react-i18next';

type Props = {
  latitude: number;
  longitude: number;
  name: string;
};

export default function TaxiLinks({ latitude, longitude, name }: Props) {
  const { t } = useTranslation();

  const providers = [
    {
      label: t('taxi.yandex'),
      icon: '🚕',
      url: `https://3.redirect.appmetrica.yandex.com/route?end-lat=${latitude}&end-lon=${longitude}&appmetrica_tracking_id=1178268795219780156&lang=en`,
    },
    {
      label: t('taxi.namba'),
      icon: '🚖',
      url: `https://namba.kg/taxi`,
    },
    {
      label: t('taxi.twogis'),
      icon: '🧭',
      url: `https://2gis.kg/bishkek/search/${encodeURIComponent(name)}`,
    },
    {
      label: t('taxi.google'),
      icon: '🗺️',
      url: `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`,
    },
  ];

  return (
    <section className="taxi-block">
      <h3 className="section-title">{t('taxi.title')}</h3>
      <div className="taxi-grid">
        {providers.map((p) => (
          <a
            key={p.label}
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            className="taxi-button"
          >
            <span className="taxi-icon">{p.icon}</span>
            <span>{p.label}</span>
          </a>
        ))}
      </div>
      <p className="taxi-note">{t('taxi.estCost')}</p>
    </section>
  );
}