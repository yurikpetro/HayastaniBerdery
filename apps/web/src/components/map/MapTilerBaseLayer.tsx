import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import { MaptilerLayer } from '@maptiler/leaflet-maptilersdk'
import { config } from '@maptiler/sdk'
import '@maptiler/sdk/dist/maptiler-sdk.css'
import type { Locale } from '@hayastani/shared'
import { maptilerApiKey } from './mapEnv'
import type { MapTilerStyleId } from './mapLayers'
import { mapLocaleToMaptilerLanguage, resolveMaptilerStyle } from './maptilerLocale'

interface MapTilerBaseLayerProps {
  styleId: MapTilerStyleId
  locale: Locale
}

type MaptilerLeafletLayer = L.Layer & {
  _update?: () => void
  setLanguage?: (language: ReturnType<typeof mapLocaleToMaptilerLanguage>) => void
  getMaptilerSDKMap?: () => { setLanguage?: (language: ReturnType<typeof mapLocaleToMaptilerLanguage>) => void }
  on: (type: string, fn: () => void) => void
  off: (type: string, fn: () => void) => void
}

function refreshMaptilerLayer(map: L.Map) {
  map.invalidateSize({ animate: false })
  map.eachLayer((layer) => {
    const gl = layer as MaptilerLeafletLayer
    if (typeof gl._update === 'function') {
      gl._update()
    }
  })
}

function applyMaptilerLanguage(layer: MaptilerLeafletLayer, locale: Locale) {
  const language = mapLocaleToMaptilerLanguage(locale)
  try {
    layer.setLanguage?.(language)
    layer.getMaptilerSDKMap?.()?.setLanguage?.(language)
  } catch {
    /* SDK ещё не инициализирован */
  }
}

export function MapTilerBaseLayer({ styleId, locale }: MapTilerBaseLayerProps) {
  const map = useMap()

  useEffect(() => {
    if (!maptilerApiKey) return

    config.apiKey = maptilerApiKey

    let cancelled = false
    const language = mapLocaleToMaptilerLanguage(locale)

    const layer = new MaptilerLayer({
      apiKey: maptilerApiKey,
      style: resolveMaptilerStyle(styleId),
      language,
    }) as MaptilerLeafletLayer

    const onLayerReady = () => {
      if (cancelled) return
      applyMaptilerLanguage(layer, locale)
      refreshMaptilerLayer(map)
      window.setTimeout(() => {
        if (!cancelled) {
          applyMaptilerLanguage(layer, locale)
          refreshMaptilerLayer(map)
        }
      }, 200)
      window.setTimeout(() => {
        if (!cancelled) refreshMaptilerLayer(map)
      }, 800)
    }

    const onResize = () => {
      if (!cancelled) refreshMaptilerLayer(map)
    }

    layer.on('ready', onLayerReady)
    map.on('resize', onResize)

    const attach = () => {
      if (cancelled) return
      layer.addTo(map)
      refreshMaptilerLayer(map)
      window.setTimeout(() => {
        if (!cancelled) refreshMaptilerLayer(map)
      }, 0)
      window.setTimeout(() => {
        if (!cancelled) refreshMaptilerLayer(map)
      }, 400)
    }

    map.whenReady(attach)

    return () => {
      cancelled = true
      layer.off('ready', onLayerReady)
      map.off('resize', onResize)
      if (map.hasLayer(layer)) {
        map.removeLayer(layer)
      }
    }
  }, [map, styleId, locale])

  return null
}
