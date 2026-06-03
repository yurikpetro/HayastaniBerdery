import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { GeographicScope, Locale } from '@hayastani/shared'
import { ClusterMap } from '../components/map/ClusterMap'
import { FortressListItem } from '../components/fortress/FortressListItem'
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
    limit: 100,
  })

  const fortresses = useMemo(() => data?.items ?? [], [data])

  return (
    <div className="map-page flex h-full min-h-0 w-full">
      <div className="relative min-h-0 min-w-0 flex-1 self-stretch">
        <div className="map-page__map-wrap">
        <div className="map-page__toolbar pointer-events-none absolute left-3 top-3 z-[1000] flex max-w-md flex-col gap-2">
          <div className="pointer-events-auto flex flex-wrap gap-2 rounded-lg border border-stone-200/90 bg-white/95 p-2 shadow-lg backdrop-blur-sm">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('search')}
              className="min-w-[180px] flex-1 rounded-md border border-stone-300 px-3 py-1.5 text-sm"
            />
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value as GeographicScope | 'all')}
              className="rounded-md border border-stone-300 px-3 py-1.5 text-sm"
            >
              <option value="all">{t('allScopes')}</option>
              {(Object.keys(scopeLabels) as GeographicScope[]).map((key) => (
                <option key={key} value={key}>
                  {localized(scopeLabels[key], locale)}
                </option>
              ))}
            </select>
          </div>
        </div>

          <ClusterMap
            fortresses={fortresses}
            locale={locale}
            selectedSlug={selectedSlug}
            onSelect={(slug) => setParams({ fortress: slug })}
            className="map-page__canvas"
          />
        </div>
      </div>

      <aside className="map-page__sidebar flex w-[min(100%,360px)] shrink-0 flex-col border-l border-stone-300 bg-[#f8f6f2]">
        <div className="border-b border-stone-300 bg-[#3d4f63] px-4 py-3 text-white">
          <h2 className="text-sm font-semibold uppercase tracking-wide">
            {t('nav.catalog')}
          </h2>
          <p className="mt-1 text-xs text-white/75">
            {isLoading ? t('loading') : `${fortresses.length} ${t('nav.catalog').toLowerCase()}`}
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {isLoading ? (
            <p className="p-4 text-sm text-stone-500">{t('loading')}</p>
          ) : fortresses.length ? (
            fortresses.map((fortress) => (
              <FortressListItem
                key={fortress.id}
                fortress={fortress}
                locale={locale}
                active={selectedSlug === fortress.slug}
                onSelect={() => setParams({ fortress: fortress.slug })}
              />
            ))
          ) : (
            <p className="p-4 text-sm text-stone-500">{t('empty')}</p>
          )}
        </div>
      </aside>
    </div>
  )
}
