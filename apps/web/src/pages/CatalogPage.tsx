import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { GeographicScope, Locale } from '@hayastani/shared'
import { FortressPreview } from '../components/fortress/FortressPreview'
import { useFortresses } from '../hooks/useFortresses'
import { localized, scopeLabels } from '../lib/labels'

export function CatalogPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const [scope, setScope] = useState<GeographicScope | 'all'>('all')
  const { data, isLoading } = useFortresses({
    scope: scope === 'all' ? undefined : scope,
    limit: 100,
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="text-3xl font-bold">{t('nav.catalog')}</h2>
        <select
          value={scope}
          onChange={(e) => setScope(e.target.value as GeographicScope | 'all')}
          className="rounded-xl border border-stone-300 px-4 py-2"
        >
          <option value="all">{t('allScopes')}</option>
          {(Object.keys(scopeLabels) as GeographicScope[]).map((key) => (
            <option key={key} value={key}>
              {localized(scopeLabels[key], locale)}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <p>{t('loading')}</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data?.items.map((fortress) => (
            <FortressPreview key={fortress.id} fortress={fortress} locale={locale} />
          ))}
        </div>
      )}
    </div>
  )
}
