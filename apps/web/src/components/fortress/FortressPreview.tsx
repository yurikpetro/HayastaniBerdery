import { Link } from 'react-router-dom'
import type { Fortress, Locale } from '@hayastani/shared'
import { evidenceLabels, localized, primaryPhoto } from '../../lib/labels'

export function FortressPreview({
  fortress,
  locale,
  compact = false,
}: {
  fortress: Fortress
  locale: Locale
  compact?: boolean
}) {
  const photo = primaryPhoto(fortress)

  return (
    <article className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:shadow-lg">
      {photo ? (
        <img
          src={photo.url}
          alt={localized(fortress.name, locale)}
          className={`w-full object-cover ${compact ? 'h-36' : 'h-48'}`}
        />
      ) : (
        <div className={`bg-stone-200 ${compact ? 'h-36' : 'h-48'}`} />
      )}
      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-xl font-bold text-stone-900">{localized(fortress.name, locale)}</h3>
          <span className="rounded-full bg-stone-100 px-2 py-1 text-xs text-stone-700">
            {localized(evidenceLabels[fortress.evidenceLevel], locale)}
          </span>
        </div>
        <p className="text-sm text-stone-600 line-clamp-2">{localized(fortress.summary, locale)}</p>
        <Link
          to={`/fortress/${fortress.slug}`}
          className="inline-flex text-sm font-semibold text-terracotta hover:underline"
        >
          →
        </Link>
      </div>
    </article>
  )
}
