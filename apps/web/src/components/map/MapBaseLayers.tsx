import { lazy, Suspense, useEffect } from 'react'
import { TileLayer, useMap } from 'react-leaflet'
import type { Locale } from '@hayastani/shared'
import { DEFAULT_MAP_LAYER, MAP_LAYERS, type MapLayerId } from './mapLayers'
import { MapTilerLayerStack } from './MapTilerLayerStack'

const GoogleMutantLayer = lazy(() =>
  import('./GoogleMutantLayer').then((m) => ({ default: m.GoogleMutantLayer })),
)

function InvalidateOnLayerChange({ layerId }: { layerId: MapLayerId }) {
  const map = useMap()
  useEffect(() => {
    const t = window.setTimeout(() => map.invalidateSize({ animate: false }), 50)
    return () => window.clearTimeout(t)
  }, [layerId, map])
  return null
}

export function MapBaseLayers({
  layerId,
  locale,
}: {
  layerId: MapLayerId
  locale: Locale
}) {
  const layer = MAP_LAYERS[layerId] ?? MAP_LAYERS[DEFAULT_MAP_LAYER]

  if (layer.provider === 'maptiler' && layer.maptilerStyle) {
    return (
      <>
        <InvalidateOnLayerChange layerId={layerId} />
        <MapTilerLayerStack styleId={layer.maptilerStyle} locale={locale} />
      </>
    )
  }

  if (layer.provider === 'google' && layer.googleType) {
    return (
      <>
        <InvalidateOnLayerChange layerId={layerId} />
        <Suspense fallback={null}>
          <GoogleMutantLayer type={layer.googleType} locale={locale} />
        </Suspense>
      </>
    )
  }

  if (layer.provider === 'yandex' || layer.provider === 'tile') {
    if (!layer.url) return null

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
            attribution={layer.overlay.attribution ?? layer.attribution}
            maxZoom={layer.maxZoom}
            opacity={layer.overlay.opacity ?? 1}
            pane="overlayPane"
          />
        ) : null}
      </>
    )
  }

  return null
}
