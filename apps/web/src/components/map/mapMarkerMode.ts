export type MapMarkerMode = 'pins' | 'photos'

export const DEFAULT_MAP_MARKER_MODE: MapMarkerMode = 'pins'

const STORAGE_KEY = 'mapMarkerMode'

export function isValidMapMarkerMode(value: string): value is MapMarkerMode {
  return value === 'pins' || value === 'photos'
}

export function loadStoredMapMarkerMode(): MapMarkerMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && isValidMapMarkerMode(stored)) return stored
  } catch {
    /* ignore */
  }
  return DEFAULT_MAP_MARKER_MODE
}

export function storeMapMarkerMode(mode: MapMarkerMode) {
  try {
    localStorage.setItem(STORAGE_KEY, mode)
  } catch {
    /* ignore */
  }
}
