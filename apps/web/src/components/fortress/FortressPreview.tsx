import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import type { Fortress, Locale } from '@hayastani/shared'
import { evidenceLabels, localized, primaryPhoto } from '../../lib/labels'

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function highlightMatch(text: string, search: string): ReactNode {
  const needle = search.trim()
  if (!needle) return text

  const chunks = text.split(new RegExp(`(${escapeRegExp(needle)})`, 'gi'))
  return chunks.map((chunk, index) =>
    chunk.toLowerCase() === needle.toLowerCase() ? (
      <mark key={`${chunk}-${index}`} className="rounded bg-amber-200 px-0.5 text-stone-950">
        {chunk}
      </mark>
    ) : (
      chunk
    ),
  )
}

export function FortressPreview({
  fortress,
  locale,
  compact = false,
  search = '',
}: {
  fortress: Fortress
  locale: Locale
  compact?: boolean
  search?: string
}) {
  const photo = primaryPhoto(fortress)
  const name = localized(fortress.name, locale)
  const summary = localized(fortress.summary, locale)

  return (
    <Link
      to={`/fortress/${fortress.slug}`}
      aria-label={name}
      className="group block overflow-hidden rounded-2xl border border-stone-200 bg-white text-inherit no-underline shadow-sm transition hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
    >
      <article>
        {photo ? (
          <img
            src={photo.url}
            alt={name}
            className={`w-full object-cover ${compact ? 'h-36' : 'h-48'}`}
          />
        ) : (
          <div className={`bg-stone-200 ${compact ? 'h-36' : 'h-48'}`} />
        )}
        <div className="space-y-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-xl font-bold text-stone-900">{highlightMatch(name, search)}</h3>
            <span className="rounded-full bg-stone-100 px-2 py-1 text-xs text-stone-700">
              {localized(evidenceLabels[fortress.evidenceLevel], locale)}
            </span>
          </div>
          <p className="text-sm text-stone-600 line-clamp-2">
            {highlightMatch(summary, search)}
          </p>
        </div>
      </article>
    </Link>
  )
}
