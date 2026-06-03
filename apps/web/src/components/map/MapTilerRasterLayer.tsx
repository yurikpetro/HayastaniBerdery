import { TileLayer } from 'react-leaflet'
import { maptilerApiKey } from './mapEnv'
import type { MapTilerStyleId } from './mapLayers'
import { resolveMaptilerStyle } from './maptilerLocale'

interface MapTilerRasterLayerProps {
  styleId: MapTilerStyleId
}

/**
 * Растровые тайлы MapTiler — надёжная подложка, пока грузится WebGL-вектор.
 */
export function MapTilerRasterLayer({ styleId }: MapTilerRasterLayerProps) {
  if (!maptilerApiKey) return null

  const style = resolveMaptilerStyle(styleId)
  const url = `https://api.maptiler.com/maps/${style}/{z}/{x}/{y}.png?key=${maptilerApiKey}`

  return (
    <TileLayer
      key={`maptiler-raster-${style}`}
      url={url}
      tileSize={512}
      zoomOffset={-1}
      maxZoom={22}
      attribution='&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; OpenStreetMap contributors'
    />
  )
}
