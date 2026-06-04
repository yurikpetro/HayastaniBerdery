import type {
  Fortress as SharedFortress,
  FortressComment,
  FortressSubmission,
  LocalizedText,
  Locale,
} from '@hayastani/shared'
import type {
  Fortress,
  FortressComment as PrismaComment,
  FortressPhoto,
  FortressSource,
  FortressSubmission as PrismaSubmission,
  FortressTranslation,
} from '@prisma/client'

type FortressWithRelations = Fortress & {
  translations: FortressTranslation[]
  photos: FortressPhoto[]
  sources: FortressSource[]
}

const scopeToApi = {
  republic_of_armenia: 'republic-of-armenia',
  artsakh: 'artsakh',
  historical_armenia: 'historical-armenia',
} as const

const scopeFromApi = {
  'republic-of-armenia': 'republic_of_armenia',
  artsakh: 'artsakh',
  'historical-armenia': 'historical_armenia',
} as const

export function toLocalized(
  translations: FortressTranslation[],
  field: keyof Pick<
    FortressTranslation,
    'name' | 'summary' | 'history' | 'marz' | 'nearestSettlement' | 'routeHint'
  >,
): LocalizedText {
  const result: LocalizedText = { hy: '', ru: '', en: '' }
  for (const tr of translations) {
    if (tr.locale === 'hy' || tr.locale === 'ru' || tr.locale === 'en') {
      result[tr.locale] = tr[field] as string
    }
  }
  return result
}

export function toLocalizedList(
  translations: FortressTranslation[],
  field: 'features' | 'warnings' | 'relatedPlaces',
): LocalizedText[] {
  const hy = translations.find((t) => t.locale === 'hy')
  const ru = translations.find((t) => t.locale === 'ru')
  const en = translations.find((t) => t.locale === 'en')
  const hyList = (hy?.[field] as string[] | undefined) ?? []
  const ruList = (ru?.[field] as string[] | undefined) ?? []
  const enList = (en?.[field] as string[] | undefined) ?? []
  const max = Math.max(hyList.length, ruList.length, enList.length, 0)
  return Array.from({ length: max }, (_, i) => ({
    hy: hyList[i] ?? '',
    ru: ruList[i] ?? '',
    en: enList[i] ?? '',
  }))
}

export function mapFortress(record: FortressWithRelations): SharedFortress {
  return {
    id: record.id,
    slug: record.slug,
    name: toLocalized(record.translations, 'name'),
    alternativeNames: record.alternativeNames,
    scope: scopeToApi[record.scope],
    coordinates: { lat: record.lat, lng: record.lng },
    coordinateAccuracy: record.coordinateAccuracy.replace('_', '-') as SharedFortress['coordinateAccuracy'],
    marz: toLocalized(record.translations, 'marz'),
    nearestSettlement: toLocalized(record.translations, 'nearestSettlement'),
    summary: toLocalized(record.translations, 'summary'),
    history: toLocalized(record.translations, 'history'),
    foundation: record.foundation,
    period: record.period.replace(/_/g, '-') as SharedFortress['period'],
    condition: record.condition.replace(/_/g, '-') as SharedFortress['condition'],
    type: record.type.replace(/_/g, '-') as SharedFortress['type'],
    accessibility: record.accessibility.replace(/_/g, '-') as SharedFortress['accessibility'],
    routeHint: toLocalized(record.translations, 'routeHint'),
    altitudeMeters: record.altitudeMeters ?? undefined,
    evidenceLevel: record.evidenceLevel.replace(/_/g, '-') as SharedFortress['evidenceLevel'],
    features: toLocalizedList(record.translations, 'features'),
    warnings: toLocalizedList(record.translations, 'warnings'),
    relatedPlaces: toLocalizedList(record.translations, 'relatedPlaces'),
    photos: record.photos.map((photo) => ({
      id: photo.id,
      url: photo.url,
      author: photo.author,
      takenAt: photo.takenAt ?? undefined,
      caption: { hy: photo.captionHy, ru: photo.captionRu, en: photo.captionEn },
      isPrimary: photo.isPrimary,
      status: photo.status.replace('_', '-') as SharedFortress['photos'][0]['status'],
    })),
    sources: record.sources.map((source) => ({
      id: source.id,
      type: source.type as SharedFortress['sources'][0]['type'],
      title: source.title,
      author: source.author ?? undefined,
      url: source.url ?? undefined,
      language: source.language as Locale | 'other',
      editorNote: source.editorNote ?? undefined,
    })),
    status: record.status as SharedFortress['status'],
    updatedAt: record.updatedAt.toISOString().slice(0, 10),
  }
}

export function mapComment(comment: PrismaComment): FortressComment {
  return {
    id: comment.id,
    fortressId: comment.fortressId,
    parentId: comment.parentId,
    author: comment.authorName,
    body: comment.body,
    status: comment.status as FortressComment['status'],
    createdAt: comment.createdAt.toISOString(),
  }
}

export function mapSubmission(submission: PrismaSubmission): FortressSubmission {
  return {
    id: submission.id,
    submittedBy: submission.submittedByName,
    status: submission.status.replace(/_/g, '-') as FortressSubmission['status'],
    proposedFortress: submission.payload as unknown as SharedFortress,
    submitterNote: submission.submitterNote,
    moderatorNote: submission.moderatorNote ?? undefined,
    createdAt: submission.createdAt.toISOString().slice(0, 10),
  }
}

export { scopeFromApi, scopeToApi }
