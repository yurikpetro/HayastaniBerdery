import { useEffect } from 'react'
import { TileLayer, useMap } from 'react-leaflet'
import { MAP_LAYERS, type MapLayerId } from './mapLayers'

function InvalidateOnLayerChange({ layerId }: { layerId: MapLayerId }) {
  const map = useMap()
  useEffect(() => {
    const t = window.setTimeout(() => map.invalidateSize({ animate: false }), 50)
    return () => window.clearTimeout(t)
  }, [layerId, map])
  return null
}

export function MapBaseLayers({ layerId }: { layerId: MapLayerId }) {
  const layer = MAP_LAYERS[layerId] ?? MAP_LAYERS['osm-standard']

  return (
    <>
      <InvalidateOnLayerChange layerId={layerId} />
      <TileLayer
        key={layer.id}
        url={layer.url}
        attribution={layer.attribution}
        maxZoom={layer.maxZoom}
      />
      {layer.overlay ? (
        <TileLayer
          key={`${layer.id}-overlay`}
          url={layer.overlay.url}
          attribution={layer.overlay.attribution ?? ''}
          maxZoom={layer.maxZoom}
          pane="overlayPane"
        />
      ) : null}
    </>
  )
}
