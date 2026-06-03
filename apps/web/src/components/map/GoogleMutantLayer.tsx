import { useEffect, useState } from 'react'
import type { Layer } from 'leaflet'
import { useMap } from 'react-leaflet'
import { googleMapsApiKey } from './mapEnv'
import { ensureGoogleMutantPlugin } from './googleMutantPlugin'
import type { Locale } from '@hayastani/shared'
import type { GoogleMutantType } from './mapLayers'

const googleLangByLocale: Record<Locale, string> = {
  hy: 'hy',
  ru: 'ru',
  en: 'en',
}

let googleScriptPromise: Promise<void> | null = null
let loadedGoogleLang: string | null = null

function loadGoogleMapsScript(language: string): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject()
  if (window.google?.maps && loadedGoogleLang === language) return Promise.resolve()

  googleScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    const params = new URLSearchParams({
      key: googleMapsApiKey,
      language,
      region: 'AM',
    })
    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`
    script.async = true
    script.defer = true
    script.onload = () => {
      loadedGoogleLang = language
      resolve()
    }
    script.onerror = () => reject(new Error('Failed to load Google Maps'))
    document.head.appendChild(script)
  })

  return googleScriptPromise
}

export function GoogleMutantLayer({
  type,
  locale,
}: {
  type: GoogleMutantType
  locale: Locale
}) {
  const map = useMap()
  const [ready, setReady] = useState(Boolean(window.google?.maps))

  useEffect(() => {
    if (!googleMapsApiKey) return
    let cancelled = false
    const language = googleLangByLocale[locale] ?? 'en'
    loadGoogleMapsScript(language)
      .then(() => {
        if (!cancelled) setReady(true)
      })
      .catch(() => {
        if (!cancelled) setReady(false)
      })
    return () => {
      cancelled = true
    }
  }, [locale])

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
