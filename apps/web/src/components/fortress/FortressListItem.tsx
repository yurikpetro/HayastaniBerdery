import { Link } from 'react-router-dom'
import type { Fortress, Locale } from '@hayastani/shared'
import { localized, primaryPhoto } from '../../lib/labels'

interface FortressListItemProps {
  fortress: Fortress
  locale: Locale
  active?: boolean
  onSelect: () => void
}

export function FortressListItem({
  fortress,
  locale,
  active,
  onSelect,
}: FortressListItemProps) {
  const photo = primaryPhoto(fortress)
  const title = localized(fortress.name, locale)

  return (
    <article
      className={`flex gap-3 border-b border-stone-200/80 p-3 transition ${
        active ? 'bg-terracotta/8' : 'hover:bg-stone-50'
      }`}
    >
      <button
        type="button"
        onClick={onSelect}
        className="shrink-0 overflow-hidden rounded-md border border-stone-200 bg-stone-100"
      >
        {photo ? (
          <img
            src={photo.url}
            alt=""
            className="h-[72px] w-[72px] object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-[72px] w-[72px] items-center justify-center text-xs text-stone-400">
            —
          </div>
        )}
      </button>

      <div className="min-w-0 flex-1">
        <button type="button" onClick={onSelect} className="text-left">
          <h3 className="font-semibold leading-snug text-stone-900 hover:text-terracotta">
            {title}
          </h3>
        </button>
        <p className="mt-0.5 text-xs text-stone-500">
          {localized(fortress.marz, locale)}
          {fortress.nearestSettlement
            ? ` · ${localized(fortress.nearestSettlement, locale)}`
            : ''}
        </p>
        <p className="mt-1 line-clamp-2 text-sm text-stone-600">
          {localized(fortress.summary, locale)}
        </p>
        <Link
          to={`/fortress/${fortress.slug}`}
          className="mt-2 inline-block text-xs font-semibold text-terracotta hover:underline"
        >
          →
        </Link>
      </div>
    </article>
  )
}
