import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type {
  AccessibilityLevel,
  CoordinateAccuracy,
  EvidenceLevel,
  Fortress,
  FortressCondition,
  FortressType,
  GeographicScope,
  HistoricalPeriod,
  Locale,
  LocalizedText,
  PhotoAsset,
  PublicationStatus,
  SourceLink,
  SourceType,
} from '@hayastani/shared'
import { api } from '../../api/client'

const locales: Locale[] = ['hy', 'ru', 'en']
const statuses: PublicationStatus[] = ['draft', 'review', 'published', 'rejected', 'archived']
const scopes: GeographicScope[] = ['republic-of-armenia', 'artsakh', 'historical-armenia']
const coordinateAccuracies: CoordinateAccuracy[] = ['exact', 'approximate', 'unverified']
const evidenceLevels: EvidenceLevel[] = ['verified', 'partially-verified', 'oral', 'needs-research']
const accessibilityLevels: AccessibilityLevel[] = ['easy', 'moderate', 'hard', 'guide-required']
const conditions: FortressCondition[] = ['preserved', 'ruins', 'fragments', 'poorly-studied', 'inaccessible']
const periods: HistoricalPeriod[] = [
  'bronze-age',
  'urartian',
  'antique',
  'early-medieval',
  'medieval',
  'late-medieval',
  'unknown',
]
const fortressTypes: FortressType[] = [
  'fortress',
  'fortified-settlement',
  'citadel',
  'tower',
  'fortified-monastery',
  'defensive-wall',
]
const sourceTypes: SourceType[] = [
  'book',
  'article',
  'academic',
  'website',
  'social',
  'video',
  'oral',
  'archive',
]
const sourceLanguages: Array<Locale | 'other'> = ['hy', 'ru', 'en', 'other']

type LocalizedField = 'name' | 'marz' | 'nearestSettlement' | 'summary' | 'history' | 'routeHint'
type LocalizedListField = 'features' | 'warnings' | 'relatedPlaces'

const emptyLocalizedText = (): LocalizedText => ({ hy: '', ru: '', en: '' })

const makeId = (prefix: string) =>
  `${prefix}-${typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Date.now()}`

export const createEmptyFortress = (): Fortress => ({
  id: makeId('fortress'),
  slug: '',
  name: emptyLocalizedText(),
  alternativeNames: [],
  scope: 'republic-of-armenia',
  coordinates: { lat: 40.2, lng: 44.5 },
  coordinateAccuracy: 'approximate',
  marz: emptyLocalizedText(),
  nearestSettlement: emptyLocalizedText(),
  summary: emptyLocalizedText(),
  history: emptyLocalizedText(),
  foundation: '',
  period: 'unknown',
  condition: 'poorly-studied',
  type: 'fortress',
  accessibility: 'moderate',
  routeHint: emptyLocalizedText(),
  evidenceLevel: 'needs-research',
  features: [],
  warnings: [],
  relatedPlaces: [],
  photos: [],
  sources: [],
  status: 'draft',
  updatedAt: new Date().toISOString().slice(0, 10),
})

interface FortressFormProps {
  fortress: Fortress
  mode: 'create' | 'edit'
  isSaving?: boolean
  onSubmit: (fortress: Fortress) => void
}

export function FortressForm({ fortress, mode, isSaving = false, onSubmit }: FortressFormProps) {
  const { t } = useTranslation()
  const [draft, setDraft] = useState<Fortress>(fortress)
  const [uploadingPhotoId, setUploadingPhotoId] = useState<string | null>(null)

  const tr = (key: string) => t(`adminForm.${key}`)
  const optionLabel = (value: string) => t(`adminOptions.${value}`, value)

  const setLocalizedField = (field: LocalizedField, locale: Locale, value: string) => {
    setDraft((current) => ({
      ...current,
      [field]: { ...current[field], [locale]: value },
    }))
  }

  const addLocalizedListItem = (field: LocalizedListField) => {
    setDraft((current) => ({ ...current, [field]: [...current[field], emptyLocalizedText()] }))
  }

  const updateLocalizedListItem = (
    field: LocalizedListField,
    index: number,
    locale: Locale,
    value: string,
  ) => {
    setDraft((current) => ({
      ...current,
      [field]: current[field].map((item, itemIndex) =>
        itemIndex === index ? { ...item, [locale]: value } : item,
      ),
    }))
  }

  const removeLocalizedListItem = (field: LocalizedListField, index: number) => {
    setDraft((current) => ({
      ...current,
      [field]: current[field].filter((_, itemIndex) => itemIndex !== index),
    }))
  }

  const addPhoto = () => {
    const photo: PhotoAsset = {
      id: makeId('photo'),
      url: '',
      author: '',
      caption: emptyLocalizedText(),
      isPrimary: draft.photos.length === 0,
      status: 'published',
    }
    setDraft((current) => ({ ...current, photos: [...current.photos, photo] }))
  }

  const updatePhoto = (id: string, patch: Partial<PhotoAsset>) => {
    setDraft((current) => ({
      ...current,
      photos: current.photos.map((photo) => (photo.id === id ? { ...photo, ...patch } : photo)),
    }))
  }

  const updatePhotoCaption = (id: string, locale: Locale, value: string) => {
    setDraft((current) => ({
      ...current,
      photos: current.photos.map((photo) =>
        photo.id === id
          ? { ...photo, caption: { ...photo.caption, [locale]: value } }
          : photo,
      ),
    }))
  }

  const setPrimaryPhoto = (id: string) => {
    setDraft((current) => ({
      ...current,
      photos: current.photos.map((photo) => ({ ...photo, isPrimary: photo.id === id })),
    }))
  }

  const removePhoto = (id: string) => {
    setDraft((current) => {
      const photos = current.photos.filter((photo) => photo.id !== id)
      if (photos.length > 0 && !photos.some((photo) => photo.isPrimary)) {
        photos[0] = { ...photos[0], isPrimary: true }
      }
      return { ...current, photos }
    })
  }

  const uploadPhoto = async (id: string, file: File) => {
    setUploadingPhotoId(id)
    try {
      const { url } = await api.media.upload(file)
      updatePhoto(id, { url })
    } finally {
      setUploadingPhotoId(null)
    }
  }

  const addSource = () => {
    const source: SourceLink = {
      id: makeId('source'),
      type: 'website',
      title: '',
      language: 'ru',
    }
    setDraft((current) => ({ ...current, sources: [...current.sources, source] }))
  }

  const updateSource = (id: string, patch: Partial<SourceLink>) => {
    setDraft((current) => ({
      ...current,
      sources: current.sources.map((source) =>
        source.id === id ? { ...source, ...patch } : source,
      ),
    }))
  }

  const removeSource = (id: string) => {
    setDraft((current) => ({
      ...current,
      sources: current.sources.filter((source) => source.id !== id),
    }))
  }

  const submit = () => {
    const photos = draft.photos.map((photo, index) => ({
      ...photo,
      isPrimary: draft.photos.some((item) => item.isPrimary) ? photo.isPrimary : index === 0,
    }))
    onSubmit({ ...draft, photos, updatedAt: new Date().toISOString().slice(0, 10) })
  }

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault()
        submit()
      }}
    >
      <section className="rounded-2xl border border-stone-200 p-4">
        <h4 className="text-lg font-bold">{tr('sections.identity')}</h4>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block text-sm">
            {tr('slug')}
            <input
              required
              className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2"
              value={draft.slug}
              onChange={(event) => setDraft({ ...draft, slug: event.target.value })}
            />
          </label>
          <label className="block text-sm">
            {tr('status')}
            <select
              className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2"
              value={draft.status}
              onChange={(event) =>
                setDraft({ ...draft, status: event.target.value as PublicationStatus })
              }
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {optionLabel(status)}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm md:col-span-2">
            {tr('alternativeNames')}
            <input
              className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2"
              value={draft.alternativeNames.join(', ')}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  alternativeNames: event.target.value
                    .split(',')
                    .map((item) => item.trim())
                    .filter(Boolean),
                })
              }
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-stone-200 p-4">
        <h4 className="text-lg font-bold">{tr('sections.localized')}</h4>
        <div className="mt-4 space-y-5">
          {locales.map((locale) => (
            <div key={locale} className="rounded-xl bg-stone-50 p-4">
              <h5 className="font-semibold uppercase text-stone-600">{locale}</h5>
              <div className="mt-3 grid gap-4 md:grid-cols-2">
                {(['name', 'marz', 'nearestSettlement'] as LocalizedField[]).map((field) => (
                  <label key={field} className="block text-sm">
                    {tr(field)}
                    <input
                      className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2"
                      value={draft[field][locale]}
                      onChange={(event) => setLocalizedField(field, locale, event.target.value)}
                    />
                  </label>
                ))}
              </div>
              <div className="mt-4 grid gap-4">
                {(['summary', 'history', 'routeHint'] as LocalizedField[]).map((field) => (
                  <label key={field} className="block text-sm">
                    {tr(field)}
                    <textarea
                      className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2"
                      rows={field === 'history' ? 6 : 3}
                      value={draft[field][locale]}
                      onChange={(event) => setLocalizedField(field, locale, event.target.value)}
                    />
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-stone-200 p-4">
        <h4 className="text-lg font-bold">{tr('sections.classification')}</h4>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <SelectField
            label={tr('scope')}
            value={draft.scope}
            options={scopes}
            optionLabel={optionLabel}
            onChange={(value) => setDraft({ ...draft, scope: value as GeographicScope })}
          />
          <SelectField
            label={tr('period')}
            value={draft.period}
            options={periods}
            optionLabel={optionLabel}
            onChange={(value) => setDraft({ ...draft, period: value as HistoricalPeriod })}
          />
          <SelectField
            label={tr('type')}
            value={draft.type}
            options={fortressTypes}
            optionLabel={optionLabel}
            onChange={(value) => setDraft({ ...draft, type: value as FortressType })}
          />
          <SelectField
            label={tr('condition')}
            value={draft.condition}
            options={conditions}
            optionLabel={optionLabel}
            onChange={(value) => setDraft({ ...draft, condition: value as FortressCondition })}
          />
          <SelectField
            label={tr('accessibility')}
            value={draft.accessibility}
            options={accessibilityLevels}
            optionLabel={optionLabel}
            onChange={(value) => setDraft({ ...draft, accessibility: value as AccessibilityLevel })}
          />
          <SelectField
            label={tr('evidenceLevel')}
            value={draft.evidenceLevel}
            options={evidenceLevels}
            optionLabel={optionLabel}
            onChange={(value) => setDraft({ ...draft, evidenceLevel: value as EvidenceLevel })}
          />
          <label className="block text-sm md:col-span-3">
            {tr('foundation')}
            <input
              className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2"
              value={draft.foundation}
              onChange={(event) => setDraft({ ...draft, foundation: event.target.value })}
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-stone-200 p-4">
        <h4 className="text-lg font-bold">{tr('sections.location')}</h4>
        <div className="mt-4 grid gap-4 md:grid-cols-4">
          <label className="block text-sm">
            {tr('lat')}
            <input
              type="number"
              step="any"
              className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2"
              value={draft.coordinates.lat}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  coordinates: { ...draft.coordinates, lat: event.currentTarget.valueAsNumber },
                })
              }
            />
          </label>
          <label className="block text-sm">
            {tr('lng')}
            <input
              type="number"
              step="any"
              className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2"
              value={draft.coordinates.lng}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  coordinates: { ...draft.coordinates, lng: event.currentTarget.valueAsNumber },
                })
              }
            />
          </label>
          <label className="block text-sm">
            {tr('altitudeMeters')}
            <input
              type="number"
              className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2"
              value={draft.altitudeMeters ?? ''}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  altitudeMeters:
                    event.target.value === '' ? undefined : event.currentTarget.valueAsNumber,
                })
              }
            />
          </label>
          <SelectField
            label={tr('coordinateAccuracy')}
            value={draft.coordinateAccuracy}
            options={coordinateAccuracies}
            optionLabel={optionLabel}
            onChange={(value) =>
              setDraft({ ...draft, coordinateAccuracy: value as CoordinateAccuracy })
            }
          />
        </div>
      </section>

      {(['features', 'warnings', 'relatedPlaces'] as LocalizedListField[]).map((field) => (
        <section key={field} className="rounded-2xl border border-stone-200 p-4">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-lg font-bold">{tr(field)}</h4>
            <button
              type="button"
              className="rounded-full bg-stone-900 px-4 py-2 text-sm text-white"
              onClick={() => addLocalizedListItem(field)}
            >
              {tr('add')}
            </button>
          </div>
          <div className="mt-4 space-y-4">
            {draft[field].map((item, index) => (
              <div key={index} className="rounded-xl bg-stone-50 p-4">
                <div className="flex justify-between gap-3">
                  <span className="text-sm font-medium text-stone-500">#{index + 1}</span>
                  <button
                    type="button"
                    className="text-sm text-red-700"
                    onClick={() => removeLocalizedListItem(field, index)}
                  >
                    {tr('remove')}
                  </button>
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-3">
                  {locales.map((locale) => (
                    <label key={locale} className="block text-sm">
                      {locale}
                      <input
                        className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2"
                        value={item[locale]}
                        onChange={(event) =>
                          updateLocalizedListItem(field, index, locale, event.target.value)
                        }
                      />
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      <section className="rounded-2xl border border-stone-200 p-4">
        <div className="flex items-center justify-between gap-3">
          <h4 className="text-lg font-bold">{tr('photos')}</h4>
          <button
            type="button"
            className="rounded-full bg-stone-900 px-4 py-2 text-sm text-white"
            onClick={addPhoto}
          >
            {tr('addPhoto')}
          </button>
        </div>
        <div className="mt-4 space-y-4">
          {draft.photos.map((photo) => (
            <div key={photo.id} className="rounded-xl bg-stone-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    checked={Boolean(photo.isPrimary)}
                    onChange={() => setPrimaryPhoto(photo.id)}
                  />
                  {tr('primaryPhoto')}
                </label>
                <button
                  type="button"
                  className="text-sm text-red-700"
                  onClick={() => removePhoto(photo.id)}
                >
                  {tr('remove')}
                </button>
              </div>
              <div className="mt-3 grid gap-4 md:grid-cols-2">
                <label className="block text-sm md:col-span-2">
                  {tr('photoUrl')}
                  <input
                    className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2"
                    value={photo.url}
                    onChange={(event) => updatePhoto(photo.id, { url: event.target.value })}
                  />
                </label>
                <label className="block text-sm">
                  {tr('uploadPhoto')}
                  <input
                    type="file"
                    accept="image/*"
                    className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2"
                    disabled={uploadingPhotoId === photo.id}
                    onChange={(event) => {
                      const file = event.currentTarget.files?.[0]
                      if (file) void uploadPhoto(photo.id, file)
                    }}
                  />
                </label>
                <SelectField
                  label={tr('photoStatus')}
                  value={photo.status}
                  options={statuses}
                  optionLabel={optionLabel}
                  onChange={(value) => updatePhoto(photo.id, { status: value as PublicationStatus })}
                />
                <label className="block text-sm">
                  {tr('photoAuthor')}
                  <input
                    className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2"
                    value={photo.author}
                    onChange={(event) => updatePhoto(photo.id, { author: event.target.value })}
                  />
                </label>
                <label className="block text-sm">
                  {tr('takenAt')}
                  <input
                    className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2"
                    value={photo.takenAt ?? ''}
                    onChange={(event) =>
                      updatePhoto(photo.id, { takenAt: event.target.value || undefined })
                    }
                  />
                </label>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                {locales.map((locale) => (
                  <label key={locale} className="block text-sm">
                    {tr('caption')} {locale}
                    <input
                      className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2"
                      value={photo.caption[locale]}
                      onChange={(event) =>
                        updatePhotoCaption(photo.id, locale, event.target.value)
                      }
                    />
                  </label>
                ))}
              </div>
              {photo.url ? (
                <img
                  src={photo.url}
                  alt=""
                  className="mt-3 h-32 w-full rounded-xl object-cover md:w-64"
                />
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-stone-200 p-4">
        <div className="flex items-center justify-between gap-3">
          <h4 className="text-lg font-bold">{tr('sources')}</h4>
          <button
            type="button"
            className="rounded-full bg-stone-900 px-4 py-2 text-sm text-white"
            onClick={addSource}
          >
            {tr('addSource')}
          </button>
        </div>
        <div className="mt-4 space-y-4">
          {draft.sources.map((source) => (
            <div key={source.id} className="rounded-xl bg-stone-50 p-4">
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-sm text-red-700"
                  onClick={() => removeSource(source.id)}
                >
                  {tr('remove')}
                </button>
              </div>
              <div className="mt-3 grid gap-4 md:grid-cols-2">
                <SelectField
                  label={tr('sourceType')}
                  value={source.type}
                  options={sourceTypes}
                  optionLabel={optionLabel}
                  onChange={(value) => updateSource(source.id, { type: value as SourceType })}
                />
                <SelectField
                  label={tr('sourceLanguage')}
                  value={source.language}
                  options={sourceLanguages}
                  optionLabel={optionLabel}
                  onChange={(value) =>
                    updateSource(source.id, { language: value as Locale | 'other' })
                  }
                />
                <label className="block text-sm">
                  {tr('sourceTitle')}
                  <input
                    className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2"
                    value={source.title}
                    onChange={(event) => updateSource(source.id, { title: event.target.value })}
                  />
                </label>
                <label className="block text-sm">
                  {tr('sourceAuthor')}
                  <input
                    className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2"
                    value={source.author ?? ''}
                    onChange={(event) =>
                      updateSource(source.id, { author: event.target.value || undefined })
                    }
                  />
                </label>
                <label className="block text-sm md:col-span-2">
                  {tr('sourceUrl')}
                  <input
                    className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2"
                    value={source.url ?? ''}
                    onChange={(event) =>
                      updateSource(source.id, { url: event.target.value || undefined })
                    }
                  />
                </label>
                <label className="block text-sm md:col-span-2">
                  {tr('editorNote')}
                  <textarea
                    className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2"
                    rows={2}
                    value={source.editorNote ?? ''}
                    onChange={(event) =>
                      updateSource(source.id, { editorNote: event.target.value || undefined })
                    }
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="sticky bottom-4 flex justify-end rounded-2xl border border-stone-200 bg-white/95 p-4 shadow-lg">
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-full bg-forest px-6 py-2.5 font-medium text-white disabled:opacity-60"
        >
          {isSaving ? tr('saving') : mode === 'create' ? tr('create') : tr('save')}
        </button>
      </div>
    </form>
  )
}

function SelectField({
  label,
  value,
  options,
  optionLabel,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  optionLabel: (value: string) => string
  onChange: (value: string) => void
}) {
  return (
    <label className="block text-sm">
      {label}
      <select
        className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {optionLabel(option)}
          </option>
        ))}
      </select>
    </label>
  )
}
