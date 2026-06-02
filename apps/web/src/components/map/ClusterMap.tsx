import { useEffect } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet.markercluster'
import type { Fortress } from '@hayastani/shared'
import { Link } from 'react-router-dom'
import { localized, primaryPhoto } from '../../lib/labels'

const icon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

function ClusterLayer({
  fortresses,
  locale,
  selectedSlug,
  onSelect,
}: {
  fortresses: Fortress[]
  locale: 'hy' | 'ru' | 'en'
  selectedSlug?: string
  onSelect: (slug: string) => void
}) {
  const map = useMap()

  useEffect(() => {
    const cluster = L.markerClusterGroup()
    fortresses.forEach((fortress) => {
      const marker = L.marker([fortress.coordinates.lat, fortress.coordinates.lng], { icon })
      const photo = primaryPhoto(fortress)
      marker.bindPopup(`
        <div style="min-width:200px">
          ${photo ? `<img src="${photo.url}" alt="" style="width:100%;height:100px;object-fit:cover;border-radius:8px;margin-bottom:8px"/>` : ''}
          <strong>${localized(fortress.name, locale)}</strong>
          <p style="margin:8px 0;font-size:13px">${localized(fortress.summary, locale)}</p>
        </div>
      `)
      marker.on('click', () => onSelect(fortress.slug))
      cluster.addLayer(marker)
    })
    map.addLayer(cluster)
    return () => {
      map.removeLayer(cluster)
    }
  }, [fortresses, locale, map, onSelect])

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
}

export function ClusterMap({
  fortresses,
  locale,
  selectedSlug,
  onSelect,
  className = 'fortress-map',
}: ClusterMapProps) {
  return (
    <MapContainer center={[40.2, 44.5]} zoom={8} scrollWheelZoom className={className}>
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClusterLayer
        fortresses={fortresses}
        locale={locale}
        selectedSlug={selectedSlug}
        onSelect={onSelect}
      />
      {fortresses.map((fortress) => (
        <Marker
          key={`hidden-${fortress.id}`}
          position={[fortress.coordinates.lat, fortress.coordinates.lng]}
          opacity={0}
          eventHandlers={{ click: () => onSelect(fortress.slug) }}
        >
          <Popup>
            <Link to={`/fortress/${fortress.slug}`}>{localized(fortress.name, locale)}</Link>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
