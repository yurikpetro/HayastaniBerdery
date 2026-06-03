import { hasGoogleMaps, hasYandexMaps, yandexMapsApiKey } from './mapEnv'

export type MapLayerId =
  | 'osm-standard'
  | 'osm-topo'
  | 'google-roadmap'
  | 'google-satellite'
  | 'google-hybrid'
  | 'yandex-map'
  | 'yandex-satellite'
  | 'yandex-hybrid'
  | 'esri-imagery'
  | 'esri-hybrid'
  | 'carto-voyager'

export type MapLayerGroup = 'osm' | 'google' | 'yandex' | 'satellite' | 'other'

export type MapLayerProvider = 'tile' | 'google' | 'yandex'

export type GoogleMutantType = 'roadmap' | 'satellite' | 'hybrid'

export type YandexTileType = 'map' | 'sat'

export interface MapLayerOverlay {
  url: string
  attribution?: string
  opacity?: number
}

export interface MapLayerConfig {
  id: MapLayerId
  group: MapLayerGroup
  nameKey: string
  provider: MapLayerProvider
  attribution: string
  maxZoom?: number
  url?: string
  overlay?: MapLayerOverlay
  googleType?: GoogleMutantType
  yandexType?: YandexTileType
}

const YANDEX_TILE_BASE = 'https://tiles.api-maps.yandex.ru/v1/tiles/'

function yandexTileUrl(layerType: 'map' | 'sat'): string {
  const params = new URLSearchParams({
    apikey: yandexMapsApiKey,
    x: '{x}',
    y: '{y}',
    z: '{z}',
    lang: 'ru_RU',
    l: layerType,
  })
  return `${YANDEX_TILE_BASE}?${params.toString()}`
}

function buildLayerCatalog(): Record<MapLayerId, MapLayerConfig> {
  const layers: Record<string, MapLayerConfig> = {
    'osm-standard': {
      id: 'osm-standard',
      group: 'osm',
      nameKey: 'mapLayers.osmStandard',
      provider: 'tile',
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    },
    'osm-topo': {
      id: 'osm-topo',
      group: 'osm',
      nameKey: 'mapLayers.osmTopo',
      provider: 'tile',
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attribution:
        '&copy; <a href="https://opentopomap.org">OpenTopoMap</a>, &copy; OpenStreetMap',
      maxZoom: 17,
    },
    'esri-imagery': {
      id: 'esri-imagery',
      group: 'satellite',
      nameKey: 'mapLayers.esriImagery',
      provider: 'tile',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; Esri, Maxar, Earthstar Geographics',
      maxZoom: 19,
    },
    'esri-hybrid': {
      id: 'esri-hybrid',
      group: 'satellite',
      nameKey: 'mapLayers.esriHybrid',
      provider: 'tile',
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
      provider: 'tile',
      url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      attribution: '&copy; OpenStreetMap, &copy; CARTO',
      maxZoom: 20,
    },
  }

  if (hasGoogleMaps) {
    layers['google-roadmap'] = {
      id: 'google-roadmap',
      group: 'google',
      nameKey: 'mapLayers.googleRoadmap',
      provider: 'google',
      googleType: 'roadmap',
      attribution: '&copy; Google',
      maxZoom: 21,
    }
    layers['google-satellite'] = {
      id: 'google-satellite',
      group: 'google',
      nameKey: 'mapLayers.googleSatellite',
      provider: 'google',
      googleType: 'satellite',
      attribution: '&copy; Google',
      maxZoom: 21,
    }
    layers['google-hybrid'] = {
      id: 'google-hybrid',
      group: 'google',
      nameKey: 'mapLayers.googleHybrid',
      provider: 'google',
      googleType: 'hybrid',
      attribution: '&copy; Google',
      maxZoom: 21,
    }
  }

  if (hasYandexMaps) {
    layers['yandex-map'] = {
      id: 'yandex-map',
      group: 'yandex',
      nameKey: 'mapLayers.yandexMap',
      provider: 'yandex',
      yandexType: 'map',
      url: yandexTileUrl('map'),
      attribution: '&copy; <a href="https://yandex.ru/maps/">Яндекс</a>',
      maxZoom: 19,
    }
    layers['yandex-satellite'] = {
      id: 'yandex-satellite',
      group: 'yandex',
      nameKey: 'mapLayers.yandexSatellite',
      provider: 'yandex',
      yandexType: 'sat',
      url: yandexTileUrl('sat'),
      attribution: '&copy; <a href="https://yandex.ru/maps/">Яндекс</a>',
      maxZoom: 19,
    }
    layers['yandex-hybrid'] = {
      id: 'yandex-hybrid',
      group: 'yandex',
      nameKey: 'mapLayers.yandexHybrid',
      provider: 'yandex',
      yandexType: 'sat',
      url: yandexTileUrl('sat'),
      attribution: '&copy; <a href="https://yandex.ru/maps/">Яндекс</a>',
      maxZoom: 19,
      overlay: {
        url: yandexTileUrl('map'),
        opacity: 0.65,
      },
    }
  }

  return layers as Record<MapLayerId, MapLayerConfig>
}

export const MAP_LAYERS = buildLayerCatalog()

export function getMapLayerGroups(): MapLayerGroup[] {
  const groups: MapLayerGroup[] = ['osm']
  if (hasGoogleMaps) groups.push('google')
  if (hasYandexMaps) groups.push('yandex')
  groups.push('satellite', 'other')
  return groups
}

export const DEFAULT_MAP_LAYER: MapLayerId = 'osm-standard'

export function getLayersByGroup(group: MapLayerGroup): MapLayerConfig[] {
  return Object.values(MAP_LAYERS).filter((layer) => layer.group === group)
}

export function isValidMapLayer(id: string): id is MapLayerId {
  return id in MAP_LAYERS
}

export function loadStoredMapLayer(): MapLayerId {
  try {
    const stored = localStorage.getItem('mapLayer')
    if (stored && isValidMapLayer(stored)) return stored
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
