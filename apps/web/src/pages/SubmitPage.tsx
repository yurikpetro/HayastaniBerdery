import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet'
import type { Fortress } from '@hayastani/shared'
import { api } from '../api/client'
import { useAuth } from '../auth/AuthContext'

function PickPoint({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

const emptyFortress = (): Omit<Fortress, 'id' | 'updatedAt' | 'status'> => ({
  slug: 'new-fortress',
  name: { hy: '', ru: '', en: '' },
  alternativeNames: [],
  scope: 'republic-of-armenia',
  coordinates: { lat: 40.2, lng: 44.5 },
  coordinateAccuracy: 'approximate',
  marz: { hy: '', ru: '', en: '' },
  nearestSettlement: { hy: '', ru: '', en: '' },
  summary: { hy: '', ru: '', en: '' },
  history: { hy: '', ru: '', en: '' },
  foundation: '',
  period: 'unknown',
  condition: 'poorly-studied',
  type: 'fortress',
  accessibility: 'moderate',
  routeHint: { hy: '', ru: '', en: '' },
  evidenceLevel: 'needs-research',
  features: [],
  warnings: [],
  relatedPlaces: [],
  photos: [],
  sources: [],
})

export function SubmitPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [note, setNote] = useState('')
  const [draft, setDraft] = useState(emptyFortress())
  const [contact, setContact] = useState('')
  const [error, setError] = useState('')

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-white/60 bg-white/85 p-8 text-center shadow-xl shadow-stone-900/10 backdrop-blur-md">
        <h2 className="text-2xl font-bold text-stone-900">{t('submitForm.signInTitle')}</h2>
        <p className="mx-auto mt-3 max-w-md text-stone-600">{t('submitForm.signInIntro')}</p>
        <Link
          to="/login"
          className="mt-6 inline-flex rounded-full bg-terracotta px-6 py-2.5 font-medium text-white transition hover:bg-terracotta/90"
        >
          {t('nav.login')}
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-2xl border border-white/60 bg-white/80 p-6 shadow-lg shadow-stone-900/10 backdrop-blur-md">
        <h2 className="text-3xl font-bold text-stone-900">{t('submitForm.title')}</h2>
        <p className="mt-2 text-stone-600">{t('submitForm.intro')}</p>
      </div>

      <form
        className="space-y-4 rounded-2xl border border-white/60 bg-white/85 p-6 shadow-xl shadow-stone-900/10 backdrop-blur-md"
        onSubmit={async (event) => {
          event.preventDefault()
          try {
            const submitterNote = [
              note,
              contact ? `${t('submitForm.contact')}: ${contact}` : '',
            ].filter(Boolean).join('\n\n')
            const slug = draft.name.en.toLowerCase().replace(/\s+/g, '-') || `fort-${Date.now()}`
            await api.submissions.create({
              submitterNote,
              proposedFortress: {
                ...draft,
                slug,
                sources: [],
              },
            })
            navigate('/catalog')
          } catch (e) {
            setError(e instanceof Error ? e.message : t('submitForm.failed'))
          }
        }}
      >
        <label className="block text-sm">
          {t('submitForm.name')}
          <input
            className="mt-1 w-full rounded-xl border border-stone-300 bg-white/95 px-3 py-2"
            value={draft.name.ru}
            onChange={(e) => {
              const value = e.target.value
              setDraft({ ...draft, name: { hy: value, ru: value, en: value } })
            }}
          />
        </label>

        <label className="block text-sm">
          {t('submitForm.description')}
          <textarea
            className="mt-1 w-full rounded-xl border border-stone-300 bg-white/95 px-3 py-2"
            rows={4}
            value={draft.summary.ru}
            onChange={(e) => {
              const value = e.target.value
              setDraft({ ...draft, summary: { hy: value, ru: value, en: value } })
            }}
          />
        </label>

        <div className="space-y-3 border-t border-stone-200 pt-4">
          <p className="text-sm text-stone-600">{t('submitForm.pickCoordinates')}</p>
          <MapContainer center={[draft.coordinates.lat, draft.coordinates.lng]} zoom={9} className="h-[32rem] rounded-xl">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[draft.coordinates.lat, draft.coordinates.lng]} />
            <PickPoint
              onPick={(lat, lng) => setDraft({ ...draft, coordinates: { lat, lng } })}
            />
          </MapContainer>
          <div className="grid gap-3 sm:grid-cols-2">
            {(['lat', 'lng'] as const).map((coordinate) => (
              <label key={coordinate} className="block text-sm">
                {t(`submitForm.coordinates.${coordinate}`)}
                <input
                  type="number"
                  step="any"
                  className="mt-1 w-full rounded-xl border border-stone-300 bg-white/95 px-3 py-2"
                  value={draft.coordinates[coordinate]}
                  onChange={(e) => {
                    const value = e.currentTarget.valueAsNumber
                    if (!Number.isFinite(value)) return
                    setDraft({
                      ...draft,
                      coordinates: { ...draft.coordinates, [coordinate]: value },
                    })
                  }}
                />
              </label>
            ))}
          </div>
          <p className="text-sm">
            {draft.coordinates.lat.toFixed(4)}, {draft.coordinates.lng.toFixed(4)}
          </p>
        </div>

        <label className="block text-sm">
          {t('submitForm.note')}
          <textarea
            className="mt-1 w-full rounded-xl border border-stone-300 bg-white/95 px-3 py-2"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          {t('submitForm.contact')}
          <input
            className="mt-1 w-full rounded-xl border border-stone-300 bg-white/95 px-3 py-2"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
          />
        </label>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          className="rounded-full bg-forest px-5 py-2 text-white"
        >
          {t('submitForm.send')}
        </button>
      </form>
    </div>
  )
}
