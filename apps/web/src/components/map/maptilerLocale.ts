import { Language } from '@maptiler/leaflet-maptilersdk'
import type { Locale } from '@hayastani/shared'
import type { MapTilerStyleId } from './mapLayers'

/** Актуальные ID стилей MapTiler Cloud (v4 где доступно) */
const MAPTILER_STYLE_IDS: Record<MapTilerStyleId, string> = {
  streets: 'streets-v4',
  hybrid: 'hybrid-v4',
  outdoor: 'outdoor-v4',
  satellite: 'satellite-v4',
}

export function mapLocaleToMaptilerLanguage(locale: Locale) {
  if (locale === 'hy') return Language.ARMENIAN
  if (locale === 'ru') return Language.RUSSIAN
  return Language.ENGLISH
}

export function resolveMaptilerStyle(styleId: MapTilerStyleId): string {
  return MAPTILER_STYLE_IDS[styleId] ?? MAPTILER_STYLE_IDS.streets
}
