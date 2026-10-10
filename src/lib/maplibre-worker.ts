import { setWorkerUrl } from 'maplibre-gl';
// @ts-ignore - Vite resolves this at build time
import workerUrl from 'maplibre-gl/dist/maplibre-gl-csp-worker.js?url';

setWorkerUrl(workerUrl);

export {};