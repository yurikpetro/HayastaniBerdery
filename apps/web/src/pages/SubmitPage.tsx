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
  const [step, setStep] = useState(1)
  const [note, setNote] = useState('')
  const [draft, setDraft] = useState(emptyFortress())
  const [socialUrl, setSocialUrl] = useState('')
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

      <div className="flex gap-2 text-sm">
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            className={`rounded-full px-3 py-1 ${step === n ? 'bg-terracotta text-white' : 'bg-stone-200'}`}
          >
            {n}
          </span>
        ))}
      </div>

      {step === 1 ? (
        <div className="space-y-3 rounded-2xl border border-white/60 bg-white/85 p-6 shadow-xl shadow-stone-900/10 backdrop-blur-md">
          {(['hy', 'ru', 'en'] as const).map((locale) => (
            <label key={locale} className="block text-sm">
              Name ({locale.toUpperCase()})
              <input
                className="mt-1 w-full rounded-xl border border-stone-300 bg-white/95 px-3 py-2"
                value={draft.name[locale]}
                onChange={(e) =>
                  setDraft({ ...draft, name: { ...draft.name, [locale]: e.target.value } })
                }
              />
            </label>
          ))}
          <label className="block text-sm">
            Summary (RU)
            <textarea
              className="mt-1 w-full rounded-xl border border-stone-300 bg-white/95 px-3 py-2"
              rows={3}
              value={draft.summary.ru}
              onChange={(e) =>
                setDraft({ ...draft, summary: { ...draft.summary, ru: e.target.value } })
              }
            />
          </label>
          <button
            type="button"
            onClick={() => setStep(2)}
            className="rounded-full bg-terracotta px-5 py-2 text-white"
          >
            Next
          </button>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-3 rounded-2xl border border-white/60 bg-white/85 p-6 shadow-xl shadow-stone-900/10 backdrop-blur-md">
          <p className="text-sm text-stone-600">Click on the map to set coordinates</p>
          <MapContainer center={[draft.coordinates.lat, draft.coordinates.lng]} zoom={9} className="h-72 rounded-xl">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[draft.coordinates.lat, draft.coordinates.lng]} />
            <PickPoint
              onPick={(lat, lng) => setDraft({ ...draft, coordinates: { lat, lng } })}
            />
          </MapContainer>
          <p className="text-sm">
            {draft.coordinates.lat.toFixed(4)}, {draft.coordinates.lng.toFixed(4)}
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={() => setStep(1)} className="rounded-full border px-5 py-2">
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="rounded-full bg-terracotta px-5 py-2 text-white"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="space-y-3 rounded-2xl border border-white/60 bg-white/85 p-6 shadow-xl shadow-stone-900/10 backdrop-blur-md">
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
            Social / reel URL
            <input
              className="mt-1 w-full rounded-xl border border-stone-300 bg-white/95 px-3 py-2"
              value={socialUrl}
              onChange={(e) => setSocialUrl(e.target.value)}
            />
          </label>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button
            type="button"
            className="rounded-full bg-forest px-5 py-2 text-white"
            onClick={async () => {
              try {
                const slug = draft.name.en.toLowerCase().replace(/\s+/g, '-') || `fort-${Date.now()}`
                await api.submissions.create({
                  submitterNote: note,
                  proposedFortress: {
                    ...draft,
                    slug,
                    sources: socialUrl
                      ? [
                          {
                            id: 'social',
                            type: 'social',
                            title: 'Social reference',
                            url: socialUrl,
                            language: 'ru',
                          },
                        ]
                      : [],
                  },
                })
                navigate('/catalog')
              } catch (e) {
                setError(e instanceof Error ? e.message : 'Failed')
              }
            }}
          >
            {t('submitForm.send')}
          </button>
        </div>
      ) : null}
    </div>
  )
}
