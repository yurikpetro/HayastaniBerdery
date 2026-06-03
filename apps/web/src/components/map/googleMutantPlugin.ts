import L from 'leaflet'
import type { GoogleMutantType } from './mapLayers'

type GoogleMutantFactory = (options: {
  type: GoogleMutantType
  maxZoom?: number
}) => L.Layer

let registerPromise: Promise<GoogleMutantFactory> | null = null

/** Регистрирует L.gridLayer.googleMutant через ESM-сборку (не UMD dist — ломается в Vite). */
export function ensureGoogleMutantPlugin(): Promise<GoogleMutantFactory> {
  const gridLayer = L.gridLayer as typeof L.gridLayer & {
    googleMutant?: GoogleMutantFactory
  }

  if (gridLayer.googleMutant) {
    return Promise.resolve(gridLayer.googleMutant)
  }

  if (!registerPromise) {
    registerPromise = import(
      'leaflet.gridlayer.googlemutant/src/Leaflet.GoogleMutant.mjs'
    ).then((mod) => {
      const GoogleMutantClass = mod.default
      const factory: GoogleMutantFactory = (options) =>
        new GoogleMutantClass(options) as unknown as L.Layer
      gridLayer.googleMutant = factory
      return factory
    })
  }

  return registerPromise
}
