import type { Fortress, LocalizedText } from '@hayastani/shared'

type FortressSeedInput = {
  slug: string
  name: LocalizedText
  alternativeNames?: string[]
  scope: Fortress['scope']
  lat: number
  lng: number
  coordinateAccuracy?: Fortress['coordinateAccuracy']
  marz: LocalizedText
  nearestSettlement: LocalizedText
  summary: LocalizedText
  history: LocalizedText
  foundation: string
  period: Fortress['period']
  condition: Fortress['condition']
  type: Fortress['type']
  accessibility: Fortress['accessibility']
  routeHint: LocalizedText
  altitudeMeters?: number
  evidenceLevel?: Fortress['evidenceLevel']
  features?: LocalizedText[]
  warnings?: LocalizedText[]
  relatedPlaces?: LocalizedText[]
  photoUrl: string
  photoCaption: LocalizedText
  sources?: Fortress['sources']
}

export function mkFortress(input: FortressSeedInput): Fortress {
  return {
    id: input.slug,
    slug: input.slug,
    name: input.name,
    alternativeNames: input.alternativeNames ?? [],
    scope: input.scope,
    coordinates: { lat: input.lat, lng: input.lng },
    coordinateAccuracy: input.coordinateAccuracy ?? 'exact',
    marz: input.marz,
    nearestSettlement: input.nearestSettlement,
    summary: input.summary,
    history: input.history,
    foundation: input.foundation,
    period: input.period,
    condition: input.condition,
    type: input.type,
    accessibility: input.accessibility,
    routeHint: input.routeHint,
    altitudeMeters: input.altitudeMeters,
    evidenceLevel: input.evidenceLevel ?? 'verified',
    features: input.features ?? [],
    warnings: input.warnings ?? [],
    relatedPlaces: input.relatedPlaces ?? [],
    photos: [
      {
        id: `${input.slug}-photo`,
        url: input.photoUrl,
        author: 'Wikimedia Commons',
        caption: input.photoCaption,
        isPrimary: true,
        status: 'published',
      },
    ],
    sources: input.sources ?? [
      {
        id: `${input.slug}-wiki`,
        type: 'website',
        title: 'Wikipedia',
        url: `https://en.wikipedia.org/wiki/${input.slug.replace(/-/g, '_')}`,
        language: 'en',
      },
    ],
    status: 'published',
    updatedAt: '2026-06-04',
  }
}
