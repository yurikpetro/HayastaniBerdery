import L from 'leaflet'
import type { Fortress, Locale, LocalizedText } from '@hayastani/shared'

type PhotoClusterGroup = {
  getChildCount(): number
  getAllChildMarkers(): L.Marker[]
}
import { primaryPhoto } from '../../lib/labels'
import type { MapMarkerMode } from './mapMarkerMode'

export const PIN_MARKER_ICON = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const PHOTO_SIZE = 52
const PHOTO_ANCHOR = PHOTO_SIZE / 2

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

export function fortressCoverUrl(fortress: Fortress): string | null {
  return primaryPhoto(fortress)?.url ?? null
}

export function createFortressMarkerIcon(
  fortress: Fortress,
  mode: MapMarkerMode,
  selected: boolean,
): L.Icon | L.DivIcon {
  if (mode === 'pins') {
    return PIN_MARKER_ICON
  }

  const cover = fortressCoverUrl(fortress)
  const selectedClass = selected ? ' fortress-photo-marker--selected' : ''

  if (cover) {
    return L.divIcon({
      className: 'fortress-photo-marker-wrap',
      html: `<div class="fortress-photo-marker${selectedClass}" title="${escapeHtml(fortress.slug)}"><img src="${escapeHtml(cover)}" alt="" loading="lazy" decoding="async" /></div>`,
      iconSize: [PHOTO_SIZE, PHOTO_SIZE],
      iconAnchor: [PHOTO_ANCHOR, PHOTO_ANCHOR],
      popupAnchor: [0, -PHOTO_ANCHOR + 4],
    })
  }

  return L.divIcon({
    className: 'fortress-photo-marker-wrap',
    html: `<div class="fortress-photo-marker fortress-photo-marker--empty${selectedClass}"><span aria-hidden="true">🏰</span></div>`,
    iconSize: [PHOTO_SIZE, PHOTO_SIZE],
    iconAnchor: [PHOTO_ANCHOR, PHOTO_ANCHOR],
    popupAnchor: [0, -PHOTO_ANCHOR + 4],
  })
}

export function createPhotoClusterIcon(cluster: PhotoClusterGroup): L.DivIcon {
  const count = cluster.getChildCount()
  const markers = cluster.getAllChildMarkers()
  let cover: string | null = null

  for (const marker of markers) {
    const url = (marker.options as { coverUrl?: string | null }).coverUrl
    if (url) {
      cover = url
      break
    }
  }

  const countLabel = count > 999 ? `${Math.floor(count / 1000)}k` : String(count)

  if (cover) {
    return L.divIcon({
      className: 'fortress-photo-cluster-wrap',
      html: `<div class="fortress-photo-cluster"><img src="${escapeHtml(cover)}" alt="" loading="lazy" /><span class="fortress-photo-cluster__count">${countLabel}</span></div>`,
      iconSize: [56, 56],
      iconAnchor: [28, 28],
    })
  }

  return L.divIcon({
    className: 'fortress-photo-cluster-wrap',
    html: `<div class="fortress-photo-cluster fortress-photo-cluster--empty"><span class="fortress-photo-cluster__glyph">🏰</span><span class="fortress-photo-cluster__count">${countLabel}</span></div>`,
    iconSize: [56, 56],
    iconAnchor: [28, 28],
  })
}

export function buildFortressPopupHtml(
  fortress: Fortress,
  locale: Locale,
  localizedFn: (text: LocalizedText, locale: Locale) => string,
) {
  const photo = primaryPhoto(fortress)
  const name = localizedFn(fortress.name, locale)
  const summary = localizedFn(fortress.summary, locale)

  return `
    <div style="min-width:200px">
      ${photo ? `<img src="${escapeHtml(photo.url)}" alt="" style="width:100%;height:100px;object-fit:cover;border-radius:8px;margin-bottom:8px"/>` : ''}
      <strong>${escapeHtml(name)}</strong>
      <p style="margin:8px 0;font-size:13px">${escapeHtml(summary)}</p>
    </div>
  `
}
