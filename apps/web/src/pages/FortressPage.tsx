import { type ReactNode, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Locale } from '@hayastani/shared'
import { MapContainer, Marker, TileLayer } from 'react-leaflet'
import { FortressComments } from '../components/fortress/FortressComments'
import { FORTRESS_MARKER_ICON } from '../components/map/fortressMarkers'
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
  typeLabels,
} from '../lib/labels'
import { formatFoundation } from '../lib/formatFoundation'

function MetaBadge({
  children,
  variant = 'stone',
}: {
  children: ReactNode
  variant?: 'forest' | 'stone' | 'terracotta' | 'amber'
}) {
  const styles = {
    forest: 'bg-forest/12 text-forest',
    stone: 'bg-stone-200/90 text-stone-800',
    terracotta: 'bg-terracotta/12 text-terracotta-dark',
    amber: 'bg-amber-100/90 text-amber-950',
  }
  return (
    <span className={`rounded-full px-3 py-1 text-sm font-medium ${styles[variant]}`}>
      {children}
    </span>
  )
}

function FortressFacts({
  items,
}: {
  items: { label: string; value: string }[]
}) {
  return (
    <dl className="fortress-page__facts grid grid-cols-1 gap-x-4 gap-y-3 border-b border-stone-200/80 pb-5 sm:grid-cols-[minmax(8rem,auto)_1fr]">
      {items.map(({ label, value }) => (
        <div key={label} className="contents">
          <dt className="text-xs font-semibold uppercase tracking-wide text-stone-500">{label}</dt>
          <dd className="font-medium leading-snug text-stone-900">{value}</dd>
        </div>
      ))}
    </dl>
  )
}

function MapCoordsBar({
  locationLabel,
  lat,
  lng,
  copyLabel,
  copiedLabel,
}: {
  locationLabel: string
  lat: number
  lng: number
  copyLabel: string
  copiedLabel: string
}) {
  const [copied, setCopied] = useState(false)
  const coordsText = `${lat.toFixed(4)}, ${lng.toFixed(4)}`

  const copyCoords = async () => {
    try {
      await navigator.clipboard.writeText(coordsText)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="fortress-page__map-header flex flex-col gap-2 border-b border-stone-200/80 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-semibold text-stone-800">{locationLabel}</p>
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <span className="font-mono text-sm text-stone-600">{coordsText}</span>
        <button
          type="button"
          onClick={copyCoords}
          className="shrink-0 rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs font-medium text-stone-700 transition hover:bg-stone-100"
          aria-label={copyLabel}
        >
          {copied ? copiedLabel : copyLabel}
        </button>
      </div>
    </div>
  )
}

function ContentPanel({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={`rounded-2xl border border-white/70 bg-white/92 p-5 shadow-lg shadow-stone-900/10 backdrop-blur-md sm:p-6 ${className}`}
    >
      {children}
    </div>
  )
}

export function FortressPage() {
  const { slug = '' } = useParams()
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const { data: fortress, isLoading } = useFortress(slug)

  if (isLoading) {
    return (
      <div className="fortress-page">
        <ContentPanel>
          <p className="text-stone-600">{t('loading')}</p>
        </ContentPanel>
      </div>
    )
  }

  if (!fortress) {
    return (
      <div className="fortress-page">
        <ContentPanel>
          <p className="text-stone-700">{t('empty')}</p>
          <Link to="/catalog" className="mt-4 inline-block text-terracotta hover:underline">
            ← {t('nav.catalog')}
          </Link>
        </ContentPanel>
      </div>
    )
  }

  const hero = primaryPhoto(fortress)
  const title = localized(fortress.name, locale)
  const features = fortress.features.map((item) => localized(item, locale)).filter(Boolean)
  const warnings = fortress.warnings.map((item) => localized(item, locale)).filter(Boolean)
  const relatedPlaces = fortress.relatedPlaces
    .map((item) => localized(item, locale))
    .filter(Boolean)

  const locationFacts = [
    { label: t('fortressPage.marz'), value: localized(fortress.marz, locale) },
    {
      label: t('fortressPage.nearestSettlement'),
      value: localized(fortress.nearestSettlement, locale),
    },
    { label: t('fortressPage.founded'), value: formatFoundation(fortress.foundation, locale) },
    ...(fortress.altitudeMeters != null
      ? [
          {
            label: t('fortressPage.altitude'),
            value: `${fortress.altitudeMeters} ${t('fortressPage.meters')}`,
          },
        ]
      : []),
  ]

  return (
    <>
      <Helmet>
        <title>{title} — {t('brand')}</title>
        <meta name="description" content={localized(fortress.summary, locale)} />
        {hero ? <meta property="og:image" content={hero.url} /> : null}
      </Helmet>

      <article className="fortress-page space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to={`/?fortress=${fortress.slug}`}
            className="inline-flex items-center gap-1 rounded-full border border-white/60 bg-white/90 px-4 py-2 text-sm font-medium text-stone-800 shadow-sm transition hover:bg-white"
          >
            ← {t('nav.map')}
          </Link>
          <Link
            to="/catalog"
            className="text-sm font-medium text-white/90 underline-offset-2 hover:text-white hover:underline"
          >
            {t('nav.catalog')}
          </Link>
        </div>

        <section className="overflow-hidden rounded-3xl border border-white/60 bg-white/92 shadow-xl shadow-stone-900/15 backdrop-blur-md">
          {hero ? (
            <div className="relative h-[min(420px,50vh)] w-full">
              <img src={hero.url} alt={title} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/85 via-stone-900/25 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta/90">
                  {localized(scopeLabels[fortress.scope], locale)}
                </p>
                <h1 className="mt-1 font-display text-3xl font-bold text-white sm:text-4xl md:text-5xl">
                  {title}
                </h1>
                {fortress.alternativeNames.length > 0 ? (
                  <p className="mt-2 text-sm text-white/85">
                    {fortress.alternativeNames.join(' · ')}
                  </p>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="border-b border-stone-200/80 bg-gradient-to-br from-stone-100 to-stone-50 p-6 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta">
                {localized(scopeLabels[fortress.scope], locale)}
              </p>
              <h1 className="mt-1 font-display text-3xl font-bold text-stone-900 sm:text-4xl">
                {title}
              </h1>
              {fortress.alternativeNames.length > 0 ? (
                <p className="mt-2 text-sm text-stone-600">
                  {fortress.alternativeNames.join(' · ')}
                </p>
              ) : null}
            </div>
          )}

          <div className="flex flex-wrap gap-2 border-b border-stone-200/80 px-5 py-4 sm:px-6">
            <MetaBadge variant="forest">
              {t('fortressPage.evidence')}: {localized(evidenceLabels[fortress.evidenceLevel], locale)}
            </MetaBadge>
            <MetaBadge variant="stone">
              {t('fortressPage.coordAccuracy')}:{' '}
              {localized(accuracyLabels[fortress.coordinateAccuracy], locale)}
            </MetaBadge>
            <MetaBadge variant="terracotta">
              {t('fortressPage.period')}: {localized(periodLabels[fortress.period], locale)}
            </MetaBadge>
            <MetaBadge variant="stone">
              {t('fortressPage.type')}: {localized(typeLabels[fortress.type], locale)}
            </MetaBadge>
            <MetaBadge variant="forest">
              {t('fortressPage.condition')}: {localized(conditionLabels[fortress.condition], locale)}
            </MetaBadge>
            <MetaBadge variant="amber">
              {t('fortressPage.accessibility')}:{' '}
              {localized(accessibilityLabels[fortress.accessibility], locale)}
            </MetaBadge>
          </div>

          <p className="px-5 py-5 text-lg leading-relaxed text-stone-800 sm:px-6">
            {localized(fortress.summary, locale)}
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <ContentPanel className="space-y-5">
            <FortressFacts items={locationFacts} />
            <div>
              <h2 className="font-display text-2xl font-bold text-stone-900">{t('history')}</h2>
              <p className="mt-3 leading-relaxed text-stone-700">
                {localized(fortress.history, locale)}
              </p>
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-stone-900">{t('route')}</h3>
              <p className="mt-2 leading-relaxed text-stone-700">
                {localized(fortress.routeHint, locale)}
              </p>
            </div>
            {features.length > 0 ? (
              <div>
                <h3 className="font-display text-lg font-bold text-stone-900">{t('features')}</h3>
                <ul className="mt-2 list-inside list-disc space-y-1 text-stone-700">
                  {features.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {warnings.length > 0 ? (
              <div className="rounded-xl border border-amber-200/80 bg-amber-50/90 p-4">
                <h3 className="font-display text-lg font-bold text-amber-950">{t('warnings')}</h3>
                <ul className="mt-2 list-inside list-disc space-y-1 text-amber-950/90">
                  {warnings.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {relatedPlaces.length > 0 ? (
              <div>
                <h3 className="font-display text-lg font-bold text-stone-900">
                  {t('fortressPage.relatedPlaces')}
                </h3>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {relatedPlaces.map((place) => (
                    <li
                      key={place}
                      className="rounded-full bg-stone-100 px-3 py-1 text-sm text-stone-800"
                    >
                      {place}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </ContentPanel>

          <ContentPanel className="fortress-page__map overflow-hidden !p-0">
            <MapCoordsBar
              locationLabel={t('fortressPage.location')}
              lat={fortress.coordinates.lat}
              lng={fortress.coordinates.lng}
              copyLabel={t('fortressPage.copyCoords')}
              copiedLabel={t('fortressPage.coordsCopied')}
            />
            <MapContainer
              center={[fortress.coordinates.lat, fortress.coordinates.lng]}
              zoom={12}
              className="h-80 w-full"
              scrollWheelZoom={false}
              attributionControl={false}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker
                position={[fortress.coordinates.lat, fortress.coordinates.lng]}
                icon={FORTRESS_MARKER_ICON}
              />
            </MapContainer>
          </ContentPanel>
        </section>

        {fortress.photos.length > 1 ? (
          <section className="space-y-4">
            <h2 className="font-display text-2xl font-bold text-white drop-shadow-sm">
              {t('fortressPage.gallery')}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {fortress.photos.map((photo) => (
                <div
                  key={photo.id}
                  className="overflow-hidden rounded-2xl border border-white/60 bg-white/92 shadow-lg shadow-stone-900/10"
                >
                  <img
                    src={photo.url}
                    alt={localized(photo.caption, locale)}
                    className="h-56 w-full object-cover"
                    loading="lazy"
                  />
                  {localized(photo.caption, locale) ? (
                    <p className="px-3 py-2 text-sm text-stone-700">
                      {localized(photo.caption, locale)}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <ContentPanel>
          <h2 className="font-display text-2xl font-bold text-stone-900">{t('sources')}</h2>
          <ul className="mt-4 space-y-3">
            {fortress.sources.map((source) => (
              <li
                key={source.id}
                className="border-b border-stone-100 pb-3 last:border-0 last:pb-0"
              >
                <strong className="text-stone-900">{source.title}</strong>
                {source.author ? (
                  <span className="text-stone-600"> — {source.author}</span>
                ) : null}
                {source.url ? (
                  <a
                    href={source.url}
                    className="ml-2 font-medium text-terracotta hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {t('fortressPage.sourceLink')}
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        </ContentPanel>

        <ContentPanel>
          <FortressComments fortressId={fortress.id} />
        </ContentPanel>
      </article>
    </>
  )
}
