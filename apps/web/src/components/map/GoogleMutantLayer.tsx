import { useEffect, useState } from 'react'
import type { Layer } from 'leaflet'
import { useMap } from 'react-leaflet'
import { googleMapsApiKey } from './mapEnv'
import { ensureGoogleMutantPlugin } from './googleMutantPlugin'
import type { GoogleMutantType } from './mapLayers'

let googleScriptPromise: Promise<void> | null = null

function loadGoogleMapsScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject()
  if (window.google?.maps) return Promise.resolve()
  if (googleScriptPromise) return googleScriptPromise

  googleScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(googleMapsApiKey)}`
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google Maps'))
    document.head.appendChild(script)
  })

  return googleScriptPromise
}

export function GoogleMutantLayer({ type }: { type: GoogleMutantType }) {
  const map = useMap()
  const [ready, setReady] = useState(Boolean(window.google?.maps))

  useEffect(() => {
    if (!googleMapsApiKey) return
    let cancelled = false
    loadGoogleMapsScript()
      .then(() => {
        if (!cancelled) setReady(true)
      })
      .catch(() => {
        if (!cancelled) setReady(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!ready || !googleMapsApiKey) return

    let layer: Layer | null = null
    let cancelled = false

    ensureGoogleMutantPlugin()
      .then((googleMutant) => {
        if (cancelled) return
        layer = googleMutant({ type, maxZoom: 21 })
        layer.addTo(map)
      })
      .catch(() => {
        /* плагин или Google API недоступны */
      })

    return () => {
      cancelled = true
      if (layer) map.removeLayer(layer)
    }
  }, [map, type, ready])

  return null
}
