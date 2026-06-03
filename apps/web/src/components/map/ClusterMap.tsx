import { useEffect } from 'react'
import { MapContainer, useMap } from 'react-leaflet'
import { MapBaseLayers } from './MapBaseLayers'
import type { MapLayerId } from './mapLayers'
import type { MapMarkerMode } from './mapMarkerMode'
import L from 'leaflet'
import 'leaflet.markercluster'
import type { Fortress } from '@hayastani/shared'
import { localized } from '../../lib/labels'
import {
  buildFortressPopupHtml,
  createFortressMarkerIcon,
  createPhotoClusterIcon,
  fortressCoverUrl,
} from './fortressMarkers'

function MapResizeFix() {
  const map = useMap()

  useEffect(() => {
    const fix = () => {
      map.invalidateSize({ animate: false })
    }
    fix()
    const t1 = window.setTimeout(fix, 0)
    const t2 = window.setTimeout(fix, 200)
    const t3 = window.setTimeout(fix, 600)
    window.addEventListener('resize', fix)

    const container = map.getContainer().parentElement
    const observer =
      container &&
      new ResizeObserver(() => {
        fix()
      })
    if (observer && container) observer.observe(container)

    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      window.clearTimeout(t3)
      window.removeEventListener('resize', fix)
      observer?.disconnect()
    }
  }, [map])

  return null
}

function ClusterLayer({
  fortresses,
  locale,
  selectedSlug,
  onSelect,
  markerMode,
}: {
  fortresses: Fortress[]
  locale: 'hy' | 'ru' | 'en'
  selectedSlug?: string
  onSelect: (slug: string) => void
  markerMode: MapMarkerMode
}) {
  const map = useMap()

  useEffect(() => {
    const cluster =
      markerMode === 'photos'
        ? L.markerClusterGroup({
            showCoverageOnHover: false,
            maxClusterRadius: 56,
            spiderfyOnMaxZoom: true,
            iconCreateFunction: (group) => createPhotoClusterIcon(group),
          })
        : L.markerClusterGroup()

    fortresses.forEach((fortress) => {
      const selected = selectedSlug === fortress.slug
      const marker = L.marker(
        [fortress.coordinates.lat, fortress.coordinates.lng],
        {
          icon: createFortressMarkerIcon(fortress, markerMode, selected),
          coverUrl: fortressCoverUrl(fortress),
        } as L.MarkerOptions & { coverUrl?: string | null },
      )

      marker.bindPopup(buildFortressPopupHtml(fortress, locale, localized))
      marker.on('click', () => onSelect(fortress.slug))
      cluster.addLayer(marker)
    })

    map.addLayer(cluster)
    return () => {
      map.removeLayer(cluster)
    }
  }, [fortresses, locale, map, onSelect, markerMode, selectedSlug])

  useEffect(() => {
    if (!selectedSlug) return
    const fortress = fortresses.find((f) => f.slug === selectedSlug)
    if (fortress) {
      map.flyTo([fortress.coordinates.lat, fortress.coordinates.lng], 11, { duration: 0.8 })
    }
  }, [selectedSlug, fortresses, map])

  return null
}

interface ClusterMapProps {
  fortresses: Fortress[]
  locale: 'hy' | 'ru' | 'en'
  selectedSlug?: string
  onSelect: (slug: string) => void
  className?: string
  mapLayerId: MapLayerId
  markerMode: MapMarkerMode
}

export function ClusterMap({
  fortresses,
  locale,
  selectedSlug,
  onSelect,
  className = 'fortress-map',
  mapLayerId,
  markerMode,
}: ClusterMapProps) {
  return (
    <MapContainer
      center={[40.2, 44.5]}
      zoom={8}
      scrollWheelZoom
      className={className}
      style={{ height: '100%', width: '100%' }}
    >
      <MapResizeFix />
      <MapBaseLayers layerId={mapLayerId} />
      <ClusterLayer
        fortresses={fortresses}
        locale={locale}
        selectedSlug={selectedSlug}
        onSelect={onSelect}
        markerMode={markerMode}
      />
    </MapContainer>
  )
}
