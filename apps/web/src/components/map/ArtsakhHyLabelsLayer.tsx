import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import type { Locale } from '@hayastani/shared'
import {
  artsakhToponyms,
  mapIntersectsArtsakh,
  minZoomForRank,
} from '../../data/artsakh-toponyms'
import { localized } from '../../lib/labels'

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function createLabelIcon(text: string, rank: 'city' | 'town' | 'village') {
  const sizeClass =
    rank === 'city'
      ? 'artsakh-label artsakh-label--city'
      : rank === 'town'
        ? 'artsakh-label artsakh-label--town'
        : 'artsakh-label artsakh-label--village'

  return L.divIcon({
    className: 'artsakh-label-wrap',
      html: `<span class="${sizeClass}">${escapeHtml(text)}</span>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  })
}

interface ArtsakhHyLabelsLayerProps {
  enabled: boolean
  locale: Locale
}

export function ArtsakhHyLabelsLayer({ enabled, locale }: ArtsakhHyLabelsLayerProps) {
  const map = useMap()

  useEffect(() => {
    if (!enabled) return

    const paneName = 'artsakhLabelsPane'
    if (!map.getPane(paneName)) {
      const pane = map.createPane(paneName)
      pane.style.zIndex = '650'
      pane.style.pointerEvents = 'none'
    }

    const layerGroup = L.layerGroup()

    const refresh = () => {
      layerGroup.clearLayers()

      if (!mapIntersectsArtsakh(map.getBounds())) return

      const zoom = map.getZoom()

      for (const place of artsakhToponyms) {
        if (zoom < minZoomForRank(place.rank)) continue

        const label = localized(place.name, locale)
        const marker = L.marker([place.lat, place.lng], {
          icon: createLabelIcon(label, place.rank),
          interactive: false,
          keyboard: false,
          pane: paneName,
        })
        layerGroup.addLayer(marker)
      }
    }

    refresh()
    layerGroup.addTo(map)

    map.on('moveend', refresh)
    map.on('zoomend', refresh)

    return () => {
      map.off('moveend', refresh)
      map.off('zoomend', refresh)
      map.removeLayer(layerGroup)
    }
  }, [enabled, locale, map])

  return null
}
