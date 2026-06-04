import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type {
  Fortress,
  FortressCondition,
  FortressType,
  GeographicScope,
  HistoricalPeriod,
  Locale,
} from '@hayastani/shared'
import { FortressPreview } from '../components/fortress/FortressPreview'
import { getFortressYearRange } from '../components/map/mapTimeline'
import { useFortresses } from '../hooks/useFortresses'
import { catalogPeriodFilters, conditionLabels, localized, periodLabels, scopeLabels, typeLabels } from '../lib/labels'

function matchesSearch(fortress: Fortress, locale: Locale, search: string) {
  if (!search.trim()) return true
  const needle = search.trim().toLowerCase()
  const values = [
    localized(fortress.name, locale),
    localized(fortress.marz, locale),
    localized(fortress.nearestSettlement, locale),
    localized(fortress.summary, locale),
    fortress.foundation,
    ...fortress.alternativeNames,
  ]

  return values.some((value) => value.toLowerCase().includes(needle))
}

function matchesFoundationYears(fortress: Fortress, from: string, to: string) {
  const fromYear = from ? Number(from) : null
  const toYear = to ? Number(to) : null
  if (fromYear == null && toYear == null) return true

  const range = getFortressYearRange(fortress)
  if (!range) return false

  return (fromYear == null || range.to >= fromYear) && (toYear == null || range.from <= toYear)
}

export function CatalogPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const [search, setSearch] = useState('')
  const [scope, setScope] = useState<GeographicScope | 'all'>('all')
  const [yearFrom, setYearFrom] = useState('')
  const [yearTo, setYearTo] = useState('')
  const [type, setType] = useState<FortressType | 'all'>('all')
  const [period, setPeriod] = useState<HistoricalPeriod | 'all'>('all')
  const [condition, setCondition] = useState<FortressCondition | 'all'>('all')
  const { data, isLoading } = useFortresses({
    scope: scope === 'all' ? undefined : scope,
    limit: 100,
  })
  const items = useMemo(() => data?.items ?? [], [data])
  const filteredItems = useMemo(
    () =>
      items.filter(
        (fortress) =>
          matchesSearch(fortress, locale, search) &&
          matchesFoundationYears(fortress, yearFrom, yearTo) &&
          (type === 'all' || fortress.type === type) &&
          (period === 'all' || fortress.period === period) &&
          (condition === 'all' || fortress.condition === condition),
      ),
    [condition, items, locale, period, search, type, yearFrom, yearTo],
  )

  const resetFilters = () => {
    setSearch('')
    setScope('all')
    setYearFrom('')
    setYearTo('')
    setType('all')
    setPeriod('all')
    setCondition('all')
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/60 bg-white/85 p-4 shadow-lg shadow-stone-900/10 backdrop-blur-md">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-6">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('search')}
            className="rounded-xl border border-stone-300 bg-white/95 px-4 py-2 text-stone-900 lg:col-span-2"
          />
          <select
            value={scope}
            onChange={(e) => setScope(e.target.value as GeographicScope | 'all')}
            className="rounded-xl border border-stone-300 bg-white/95 px-4 py-2 text-stone-900"
          >
            <option value="all">{t('allScopes')}</option>
            {(Object.keys(scopeLabels) as GeographicScope[]).map((key) => (
              <option key={key} value={key}>
                {localized(scopeLabels[key], locale)}
              </option>
            ))}
          </select>
          <input
            value={yearFrom}
            onChange={(e) => setYearFrom(e.target.value)}
            placeholder={t('catalogFilters.yearFrom')}
            type="number"
            className="rounded-xl border border-stone-300 bg-white/95 px-4 py-2 text-stone-900"
          />
          <input
            value={yearTo}
            onChange={(e) => setYearTo(e.target.value)}
            placeholder={t('catalogFilters.yearTo')}
            type="number"
            className="rounded-xl border border-stone-300 bg-white/95 px-4 py-2 text-stone-900"
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value as FortressType | 'all')}
            className="rounded-xl border border-stone-300 bg-white/95 px-4 py-2 text-stone-900"
          >
            <option value="all">{t('catalogFilters.allTypes')}</option>
            {(Object.keys(typeLabels) as FortressType[]).map((key) => (
              <option key={key} value={key}>
                {localized(typeLabels[key], locale)}
              </option>
            ))}
          </select>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as HistoricalPeriod | 'all')}
            className="rounded-xl border border-stone-300 bg-white/95 px-4 py-2 text-stone-900"
          >
            <option value="all">{t('catalogFilters.allPeriods')}</option>
            {(catalogPeriodFilters).map((key) => (
              <option key={key} value={key}>
                {localized(periodLabels[key], locale)}
              </option>
            ))}
          </select>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value as FortressCondition | 'all')}
            className="rounded-xl border border-stone-300 bg-white/95 px-4 py-2 text-stone-900"
          >
            <option value="all">{t('catalogFilters.allConditions')}</option>
            {(Object.keys(conditionLabels) as FortressCondition[]).map((key) => (
              <option key={key} value={key}>
                {localized(conditionLabels[key], locale)}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={resetFilters}
            className="rounded-xl border border-stone-300 bg-white/70 px-4 py-2 text-stone-700 transition hover:bg-white"
          >
            {t('catalogFilters.reset')}
          </button>
        </div>
        <p className="mt-3 text-sm text-stone-600">
          {t('catalogFilters.found', { count: filteredItems.length })}
        </p>
      </div>

      {isLoading ? (
        <p>{t('loading')}</p>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-white/60 bg-white/85 p-8 text-center shadow-lg shadow-stone-900/10 backdrop-blur-md">
          <h2 className="font-display text-2xl font-bold text-stone-900">
            {t('catalogFilters.noResultsTitle')}
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-stone-600">
            {t('catalogFilters.noResultsText')}
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-5 rounded-xl bg-terracotta px-4 py-2 text-sm font-semibold text-white transition hover:bg-terracotta-dark"
          >
            {t('catalogFilters.reset')}
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((fortress) => (
            <FortressPreview key={fortress.id} fortress={fortress} locale={locale} />
          ))}
        </div>
      )}
    </div>
  )
}
