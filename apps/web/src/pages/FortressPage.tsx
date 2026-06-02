import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Locale } from '@hayastani/shared'
import { MapContainer, Marker, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import { api } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { useFortress } from '../hooks/useFortresses'
import {
  accessibilityLabels,
  accuracyLabels,
  conditionLabels,
  evidenceLabels,
  localized,
  periodLabels,
  primaryPhoto,
  scopeLabels,
} from '../lib/labels'

const icon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

export function FortressPage() {
  const { slug = '' } = useParams()
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { data: fortress, isLoading } = useFortress(slug)
  const [comment, setComment] = useState('')

  const commentsQuery = useQuery({
    queryKey: ['comments', fortress?.id],
    queryFn: () => api.comments.list(fortress!.id),
    enabled: Boolean(fortress?.id),
  })

  const addComment = useMutation({
    mutationFn: () => api.comments.create(fortress!.id, { body: comment }),
    onSuccess: () => {
      setComment('')
      void queryClient.invalidateQueries({ queryKey: ['comments', fortress?.id] })
    },
  })

  if (isLoading) return <p>{t('loading')}</p>
  if (!fortress) return <p>{t('empty')}</p>

  const hero = primaryPhoto(fortress)
  const title = localized(fortress.name, locale)

  return (
    <>
      <Helmet>
        <title>{title} — Hayastani Berdry</title>
        <meta name="description" content={localized(fortress.summary, locale)} />
        {hero ? <meta property="og:image" content={hero.url} /> : null}
      </Helmet>

      <article className="space-y-8">
        <Link to={`/?fortress=${fortress.slug}`} className="text-sm text-terracotta hover:underline">
          ← {t('nav.map')}
        </Link>

        {hero ? (
          <img src={hero.url} alt={title} className="h-[420px] w-full rounded-3xl object-cover" />
        ) : null}

        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-widest text-terracotta">
              {localized(scopeLabels[fortress.scope], locale)}
            </p>
            <h1 className="text-4xl font-bold md:text-5xl">{title}</h1>
            <p className="mt-2 text-stone-600">{fortress.alternativeNames.join(' · ')}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-forest/10 px-3 py-1 text-sm text-forest">
              {localized(evidenceLabels[fortress.evidenceLevel], locale)}
            </span>
            <span className="rounded-full bg-stone-200 px-3 py-1 text-sm">
              {localized(accuracyLabels[fortress.coordinateAccuracy], locale)}
            </span>
          </div>
        </header>

        <p className="max-w-3xl text-lg text-stone-700">{localized(fortress.summary, locale)}</p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            [t('filters'), localized(fortress.marz, locale)],
            ['Period', localized(periodLabels[fortress.period], locale)],
            [t('warnings'), localized(conditionLabels[fortress.condition], locale)],
            ['Access', localized(accessibilityLabels[fortress.accessibility], locale)],
            [
              'Coords',
              `${fortress.coordinates.lat.toFixed(4)}, ${fortress.coordinates.lng.toFixed(4)}`,
            ],
            ['Founded', fortress.foundation],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-stone-200 bg-white p-4">
              <p className="text-xs uppercase tracking-wide text-stone-500">{label}</p>
              <p className="mt-1 font-semibold">{value}</p>
            </div>
          ))}
        </div>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6">
            <h2 className="text-2xl font-bold">{t('history')}</h2>
            <p className="text-stone-700">{localized(fortress.history, locale)}</p>
            <h3 className="font-semibold">{t('route')}</h3>
            <p className="text-stone-700">{localized(fortress.routeHint, locale)}</p>
          </div>
          <div className="overflow-hidden rounded-2xl border border-stone-200">
            <MapContainer
              center={[fortress.coordinates.lat, fortress.coordinates.lng]}
              zoom={12}
              className="h-80 w-full"
              scrollWheelZoom={false}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker
                position={[fortress.coordinates.lat, fortress.coordinates.lng]}
                icon={icon}
              />
            </MapContainer>
          </div>
        </section>

        {fortress.photos.length > 1 ? (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {fortress.photos.map((photo) => (
              <img
                key={photo.id}
                src={photo.url}
                alt={localized(photo.caption, locale)}
                className="h-56 w-full rounded-2xl object-cover"
              />
            ))}
          </section>
        ) : null}

        <section className="rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="text-2xl font-bold">{t('sources')}</h2>
          <ul className="mt-4 space-y-3">
            {fortress.sources.map((source) => (
              <li key={source.id} className="border-b border-stone-100 pb-3">
                <strong>{source.title}</strong>
                {source.author ? <span className="text-stone-600"> — {source.author}</span> : null}
                {source.url ? (
                  <a href={source.url} className="ml-2 text-terracotta" target="_blank" rel="noreferrer">
                    link
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="text-2xl font-bold">{t('comments')}</h2>
          <div className="mt-4 space-y-3">
            {commentsQuery.data?.map((item) => (
              <div key={item.id} className="rounded-xl bg-stone-50 p-4">
                <strong>{item.author}</strong>
                <p className="mt-1 text-stone-700">{item.body}</p>
              </div>
            ))}
          </div>
          {user ? (
            <form
              className="mt-4 flex flex-col gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                addComment.mutate()
              }}
            >
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="rounded-xl border border-stone-300 p-3"
                rows={3}
              />
              <button type="submit" className="self-start rounded-full bg-terracotta px-5 py-2 text-white">
                Post
              </button>
            </form>
          ) : (
            <p className="mt-4 text-sm text-stone-600">
              <Link to="/login" className="text-terracotta">
                {t('nav.login')}
              </Link>{' '}
              to comment
            </p>
          )}
        </section>
      </article>
    </>
  )
}
