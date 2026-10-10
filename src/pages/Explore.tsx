import '../lib/maplibre-worker';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Map, { Popup, Source, Layer } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { supabase } from '../lib/supabase';
import type { Location } from '../lib/types';

type Category = 'all' | 'library' | 'cafe' | 'coworking' | 'other';

const BISHKEK_CENTER = { latitude: 42.8746, longitude: 74.5698, zoom: 11.5 };

const clusterLayer = {
  id: 'clusters',
  type: 'circle' as const,
  filter: ['has', 'point_count'],
  paint: {
    'circle-color': '#267a58',
    'circle-radius': ['step', ['get', 'point_count'], 16, 10, 22, 50, 28],
    'circle-opacity': 0.85,
  },
};

const clusterCountLayer = {
  id: 'cluster-count',
  type: 'symbol' as const,
  filter: ['has', 'point_count'],
  layout: {
    'text-field': '{point_count_abbreviated}',
    'text-size': 12,
  },
  paint: { 'text-color': '#ffffff' },
};

const unclusteredLayer = {
  id: 'unclustered-point',
  type: 'circle' as const,
  filter: ['!', ['has', 'point_count']],
  paint: {
    'circle-color': '#267a58',
    'circle-radius': 6,
    'circle-stroke-width': 2,
    'circle-stroke-color': '#fff',
  },
};

export default function Explore() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [locations, setLocations] = useState<Location[]>([]);
  const [category, setCategory] = useState<Category>('all');
  const [selected, setSelected] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data, error } = await supabase.from('locations').select('*');
      if (error) setError(error.message);
      else setLocations(data as Location[]);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    if (category === 'all') return locations;
    if (category === 'other') {
      return locations.filter(
        (l) => !['library', 'cafe', 'coworking'].includes(l.type)
      );
    }
    return locations.filter((l) => l.type === category);
  }, [locations, category]);

  const geojson = useMemo(
    () => ({
      type: 'FeatureCollection' as const,
      features: filtered.map((loc) => ({
        type: 'Feature' as const,
        properties: { id: loc.id, name: loc.name },
        geometry: {
          type: 'Point' as const,
          coordinates: [loc.longitude, loc.latitude],
        },
      })),
    }),
    [filtered]
  );

  function onMapClick(e: {
    features?: { properties?: { id?: string } }[];
  }) {
    const f = e.features?.[0];
    if (!f?.properties?.id) return;
    const loc = filtered.find((l) => l.id === f.properties!.id);
    if (loc) setSelected(loc);
  }

  return (
    <main className="page-shell" style={{ paddingBottom: 100 }}>
      <header className="topbar">
        <Link className="wordmark" to="/">
          <span className="wordmark-icon">F</span>
          <span>Focuz<span className="accent">Spot</span></span>
        </Link>
      </header>

      <section style={{ padding: '24px 0 14px' }}>
        <p className="eyebrow">{t('explore.eyebrow')}</p>
        <h1 style={{ fontSize: 'clamp(24px, 4vw, 34px)' }}>
          {t('explore.title1')} <span>{t('explore.title2')}</span>
        </h1>
        <p className="hero-copy">
          {t('explore.placesCount', { count: filtered.length })}
        </p>
      </section>

      <div className="filter-row">
        {(
          [
            ['all', t('explore.all')],
            ['library', t('explore.libraries')],
            ['cafe', t('explore.cafes')],
            ['coworking', t('explore.coworking')],
            ['other', t('explore.other')],
          ] as [Category, string][]
        ).map(([value, label]) => (
          <button
            key={value}
            className={`filter-chip ${category === value ? 'active' : ''}`}
            onClick={() => setCategory(value)}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>

      {loading && <p style={{ color: '#77817b' }}>{t('explore.loading')}</p>}
      {error && <p style={{ color: 'crimson' }}>Error: {error}</p>}

      {!loading && !error && (
        <div className="map-wrap">
          <Map
            initialViewState={BISHKEK_CENTER}
            mapStyle="https://tiles.openfreemap.org/styles/liberty"
            style={{ width: '100%', height: '100%' }}
            interactiveLayerIds={['clusters', 'unclustered-point']}
            onClick={onMapClick}
          >
            <Source
              id="spots"
              type="geojson"
              data={geojson}
              cluster
              clusterMaxZoom={14}
              clusterRadius={50}
            >
              <Layer {...clusterLayer} />
              <Layer {...clusterCountLayer} />
              <Layer {...unclusteredLayer} />
            </Source>

            {selected && (
              <Popup
                longitude={selected.longitude}
                latitude={selected.latitude}
                anchor="top"
                onClose={() => setSelected(null)}
                closeOnClick={false}
                offset={14}
              >
                <div className="map-popup">
                  <strong>{selected.name}</strong>
                  <p>
                    {t(`common.type.${selected.type}`)} ·{' '}
                    {selected.address ?? '—'}
                  </p>
                  <button
                    type="button"
                    className="popup-button"
                    onClick={() => navigate(`/location/${selected.id}`)}
                  >
                    {t('explore.viewDetails')}
                  </button>
                </div>
              </Popup>
            )}
          </Map>
        </div>
      )}

      <p className="map-credit">{t('explore.mapCredit')}</p>
    </main>
  );
}