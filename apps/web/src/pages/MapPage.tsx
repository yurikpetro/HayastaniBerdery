import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { GeographicScope, Locale } from '@hayastani/shared'
import { ClusterMap } from '../components/map/ClusterMap'
import { FortressPreview } from '../components/fortress/FortressPreview'
import { useFortresses } from '../hooks/useFortresses'
import { localized, scopeLabels } from '../lib/labels'

export function MapPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [scope, setScope] = useState<GeographicScope | 'all'>('all')
  const selectedSlug = params.get('fortress') ?? undefined

  const { data, isLoading } = useFortresses({
    scope: scope === 'all' ? undefined : scope,
    search: search || undefined,
  })

  const fortresses = useMemo(() => data?.items ?? [], [data])

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-stone-200 bg-white/80 p-6 shadow-sm">
        <p className="text-sm uppercase tracking-widest text-terracotta">Explore</p>
        <h2 className="mt-2 max-w-3xl text-3xl font-bold text-stone-900 md:text-4xl">
          {t('tagline')}
        </h2>
      </section>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
          <label className="block text-sm font-medium">
            {t('search')}
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2"
            />
          </label>
          <label className="block text-sm font-medium">
            {t('filters')}
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value as GeographicScope | 'all')}
              className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2"
            >
              <option value="all">{t('allScopes')}</option>
              {(Object.keys(scopeLabels) as GeographicScope[]).map((key) => (
                <option key={key} value={key}>
                  {localized(scopeLabels[key], locale)}
                </option>
              ))}
            </select>
          </label>

          <div className="max-h-[420px] space-y-2 overflow-auto">
            {isLoading ? (
              <p className="text-sm text-stone-500">{t('loading')}</p>
            ) : fortresses.length ? (
              fortresses.map((fortress) => (
                <button
                  key={fortress.id}
                  type="button"
                  onClick={() => setParams({ fortress: fortress.slug })}
                  className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition ${
                    selectedSlug === fortress.slug
                      ? 'border-terracotta bg-terracotta/10'
                      : 'border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <strong className="block">{localized(fortress.name, locale)}</strong>
                  <span className="text-stone-500">{localized(fortress.marz, locale)}</span>
                </button>
              ))
            ) : (
              <p className="text-sm text-stone-500">{t('empty')}</p>
            )}
          </div>
        </aside>

        <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white p-2 shadow-sm">
          <ClusterMap
            fortresses={fortresses}
            locale={locale}
            selectedSlug={selectedSlug}
            onSelect={(slug) => setParams({ fortress: slug })}
          />
        </section>
      </div>

      {selectedSlug ? (
        <section className="grid gap-4 md:grid-cols-2">
          {fortresses
            .filter((f) => f.slug === selectedSlug)
            .map((fortress) => (
              <div key={fortress.id} className="space-y-3">
                <FortressPreview fortress={fortress} locale={locale} />
                <Link
                  to={`/fortress/${fortress.slug}`}
                  className="inline-flex rounded-full bg-terracotta px-5 py-2 text-white"
                >
                  {t('details')}
                </Link>
              </div>
            ))}
        </section>
      ) : null}
    </div>
  )
}
