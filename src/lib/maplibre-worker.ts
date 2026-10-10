import { setWorkerUrl } from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';

// Register the worker URL before any map is created.
// Without this, MapLibre v6+ can't find its worker in Vite builds.
setWorkerUrl(workerUrl);

export {};