import { lazy, Suspense } from 'react'
import type { Locale } from '@hayastani/shared'
import type { MapTilerStyleId } from './mapLayers'
import { MapTilerRasterLayer } from './MapTilerRasterLayer'

const MapTilerBaseLayer = lazy(() =>
  import('./MapTilerBaseLayer').then((m) => ({ default: m.MapTilerBaseLayer })),
)

interface MapTilerLayerStackProps {
  styleId: MapTilerStyleId
  locale: Locale
}

/**
 * Растр — сразу на экране; вектор (арм. подписи) поверх, когда WebGL загрузится.
 * Растр не скрываем: если вектор не отрисуется, карта всё равно видна.
 */
export function MapTilerLayerStack({ styleId, locale }: MapTilerLayerStackProps) {
  return (
    <>
      <MapTilerRasterLayer styleId={styleId} />
      <Suspense fallback={null}>
        <MapTilerBaseLayer styleId={styleId} locale={locale} />
      </Suspense>
    </>
  )
}
