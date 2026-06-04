import { useCallback, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { GeographicScope, Locale } from '@hayastani/shared'
import { ClusterMap } from '../components/map/ClusterMap'
import { MapLayerSwitcher } from '../components/map/MapLayerSwitcher'
import { ArtsakhLabelsToggle } from '../components/map/ArtsakhLabelsToggle'
import { MapMarkerModeSwitcher } from '../components/map/MapMarkerModeSwitcher'
import { MapTimelineFilter } from '../components/map/MapTimelineFilter'
import {
  loadStoredArtsakhLabels,
  storeArtsakhLabels,
  type ArtsakhLabelsMode,
} from '../components/map/mapArtsakhLabels'
import {
  DEFAULT_MAP_LAYER,
  isValidMapLayer,
  loadStoredMapLayer,
  storeMapLayer,
  type MapLayerId,
} from '../components/map/mapLayers'
import {
  DEFAULT_MAP_MARKER_MODE,
  isValidMapMarkerMode,
  loadStoredMapMarkerMode,
  storeMapMarkerMode,
  type MapMarkerMode,
} from '../components/map/mapMarkerMode'
import {
  isFortressInYearRange,
  MAP_TIMELINE_DOMAIN,
  type YearRange,
} from '../components/map/mapTimeline'
import { FortressListItem } from '../components/fortress/FortressListItem'
import { useFortresses } from '../hooks/useFortresses'
import { localized, scopeLabels } from '../lib/labels'

export function MapPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [scope, setScope] = useState<GeographicScope | 'all'>('all')
  const [yearRange, setYearRange] = useState<YearRange>(MAP_TIMELINE_DOMAIN)
  const selectedSlug = params.get('fortress') ?? undefined
  const [mapLayerId, setMapLayerId] = useState<MapLayerId>(() => {
    const stored = loadStoredMapLayer()
    return isValidMapLayer(stored) ? stored : DEFAULT_MAP_LAYER
  })
  const [markerMode, setMarkerMode] = useState<MapMarkerMode>(() => {
    const stored = loadStoredMapMarkerMode()
    return isValidMapMarkerMode(stored) ? stored : DEFAULT_MAP_MARKER_MODE
  })
  const [artsakhLabels, setArtsakhLabels] = useState<ArtsakhLabelsMode>(
    loadStoredArtsakhLabels,
  )

  const handleLayerChange = (id: MapLayerId) => {
    if (!isValidMapLayer(id)) return
    setMapLayerId(id)
    storeMapLayer(id)
  }

  const handleMarkerModeChange = (mode: MapMarkerMode) => {
    setMarkerMode(mode)
    storeMapMarkerMode(mode)
  }

  const handleArtsakhLabelsChange = (mode: ArtsakhLabelsMode) => {
    setArtsakhLabels(mode)
    storeArtsakhLabels(mode)
  }

  const { data, isLoading } = useFortresses({
    scope: scope === 'all' ? undefined : scope,
    search: search || undefined,
    limit: 100,
  })

  const fortresses = useMemo(() => data?.items ?? [], [data])
  const visibleFortresses = useMemo(
    () => fortresses.filter((fortress) => isFortressInYearRange(fortress, yearRange)),
    [fortresses, yearRange],
  )

  const handleFortressSelect = useCallback(
    (slug: string) => {
      setParams({ fortress: slug })
    },
    [setParams],
  )

  return (
    <div className="map-page flex h-full min-h-0 w-full">
      <div className="relative min-h-0 min-w-0 flex-1 self-stretch">
        <div className="map-page__map-wrap">
        <div className="map-page__toolbar pointer-events-none absolute left-3 top-3 z-[1000] flex max-w-md flex-col gap-2">
          <div className="pointer-events-auto flex flex-wrap gap-2 rounded-lg border border-white/30 bg-stone-900/90 p-2 text-white shadow-lg backdrop-blur-sm">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('search')}
              className="min-w-[180px] flex-1 rounded-md border border-white/25 bg-stone-800/90 px-3 py-1.5 text-sm text-white placeholder:text-white/60"
            />
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value as GeographicScope | 'all')}
              className="rounded-md border border-white/25 bg-stone-800/90 px-3 py-1.5 text-sm text-white"
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

        <div className="map-page__map-controls pointer-events-none absolute right-3 top-3 z-[1000] flex flex-col items-end gap-2">
          <MapLayerSwitcher value={mapLayerId} onChange={handleLayerChange} />
          <MapMarkerModeSwitcher value={markerMode} onChange={handleMarkerModeChange} />
          <ArtsakhLabelsToggle
            value={artsakhLabels}
            onChange={handleArtsakhLabelsChange}
          />
        </div>

        <div className="map-page__timeline pointer-events-none absolute inset-x-3 bottom-5 z-[1000] flex justify-center">
          <MapTimelineFilter
            value={yearRange}
            onChange={setYearRange}
            visibleCount={visibleFortresses.length}
            totalCount={fortresses.length}
            fortresses={fortresses}
          />
        </div>

          <ClusterMap
            fortresses={visibleFortresses}
            locale={locale}
            selectedSlug={selectedSlug}
            onSelect={handleFortressSelect}
            className="map-page__canvas"
            mapLayerId={mapLayerId}
            markerMode={markerMode}
            artsakhLabels={artsakhLabels}
          />
        </div>
      </div>

      <aside className="map-page__sidebar flex w-[min(100%,360px)] shrink-0 flex-col border-l border-stone-300 bg-stone-50">
        <div className="border-b border-stone-800 bg-stone-900 px-4 py-3 text-white">
          <h2 className="text-sm font-semibold uppercase tracking-wide">
            {t('nav.catalog')}
          </h2>
          <p className="mt-1 text-xs text-white/75">
            {isLoading ? t('loading') : t('fortressesCount', { count: visibleFortresses.length })}
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {isLoading ? (
            <p className="p-4 text-sm text-stone-500">{t('loading')}</p>
          ) : visibleFortresses.length ? (
            visibleFortresses.map((fortress) => (
              <FortressListItem
                key={fortress.id}
                fortress={fortress}
                locale={locale}
                active={selectedSlug === fortress.slug}
                onSelect={() => handleFortressSelect(fortress.slug)}
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
