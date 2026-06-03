export type MapLayerId =
  | 'osm-standard'
  | 'osm-topo'
  | 'esri-imagery'
  | 'esri-hybrid'
  | 'carto-voyager'

export type MapLayerGroup = 'osm' | 'satellite' | 'other'

export interface MapLayerOverlay {
  url: string
  attribution?: string
}

export interface MapLayerConfig {
  id: MapLayerId
  group: MapLayerGroup
  nameKey: string
  url: string
  attribution: string
  maxZoom?: number
  overlay?: MapLayerOverlay
}

export const MAP_LAYER_GROUPS: MapLayerGroup[] = ['osm', 'satellite', 'other']

export const MAP_LAYERS: Record<MapLayerId, MapLayerConfig> = {
  'osm-standard': {
    id: 'osm-standard',
    group: 'osm',
    nameKey: 'mapLayers.osmStandard',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  },
  'osm-topo': {
    id: 'osm-topo',
    group: 'osm',
    nameKey: 'mapLayers.osmTopo',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="https://opentopomap.org">OpenTopoMap</a>, &copy; OpenStreetMap',
    maxZoom: 17,
  },
  'esri-imagery': {
    id: 'esri-imagery',
    group: 'satellite',
    nameKey: 'mapLayers.esriImagery',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, Maxar, Earthstar Geographics',
    maxZoom: 19,
  },
  'esri-hybrid': {
    id: 'esri-hybrid',
    group: 'satellite',
    nameKey: 'mapLayers.esriHybrid',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri',
    maxZoom: 19,
    overlay: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; Esri',
    },
  },
  'carto-voyager': {
    id: 'carto-voyager',
    group: 'other',
    nameKey: 'mapLayers.cartoVoyager',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap, &copy; CARTO',
    maxZoom: 20,
  },
}

export const DEFAULT_MAP_LAYER: MapLayerId = 'osm-standard'

export function getLayersByGroup(group: MapLayerGroup): MapLayerConfig[] {
  return Object.values(MAP_LAYERS).filter((layer) => layer.group === group)
}

export function loadStoredMapLayer(): MapLayerId {
  try {
    const stored = localStorage.getItem('mapLayer') as MapLayerId | null
    if (stored && MAP_LAYERS[stored]) return stored
  } catch {
    /* ignore */
  }
  return DEFAULT_MAP_LAYER
}

export function storeMapLayer(id: MapLayerId) {
  try {
    localStorage.setItem('mapLayer', id)
  } catch {
    /* ignore */
  }
}
