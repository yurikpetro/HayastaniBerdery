import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import type { Fortress, PublicationStatus } from '@hayastani/shared'
import { api } from '../../api/client'
import { localized } from '../../lib/labels'

const statuses: PublicationStatus[] = ['draft', 'review', 'published', 'rejected', 'archived']
const iconLinkClass =
  'inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-stone-100'
const iconButtonClass =
  'inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-stone-100 disabled:opacity-50'
const disabledDeleteButtonClass =
  'inline-flex h-8 w-8 cursor-not-allowed items-center justify-center rounded-full text-red-700 opacity-40'

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="none">
      <path
        d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  )
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="none">
      <path
        d="m4 16.5-.8 4.3 4.3-.8L19 8.5 15.5 5 4 16.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="m14 6.5 3.5 3.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

function ArchiveIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="none">
      <path
        d="M4 7h16v13H4V7Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M3 4h18v3H3V4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M9 12h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function RestoreIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="none">
      <path
        d="M5 9a7 7 0 1 1 2 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M5 4v5h5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="none">
      <path d="M4 7h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M6 7l1 14h10l1-14M9 7V4h6v3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function AdminFortressesPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as 'hy' | 'ru' | 'en'
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<PublicationStatus | 'all'>('all')
  const [pendingDelete, setPendingDelete] = useState<Fortress | null>(null)
  const { data = [], isLoading } = useQuery({
    queryKey: ['fortresses', 'admin-all'],
    queryFn: async () => {
      const results = await Promise.all(
        statuses.map((itemStatus) => api.fortresses.list({ limit: 100, status: itemStatus })),
      )
      return results.flatMap((result) => result.items)
    },
  })

  const archive = useMutation({
    mutationFn: (fortress: Fortress) => api.fortresses.archive(fortress.id, fortress),
    onSuccess: (_, fortress) => {
      void queryClient.invalidateQueries({ queryKey: ['fortresses'] })
      void queryClient.invalidateQueries({ queryKey: ['fortress', fortress.slug] })
    },
  })

  const restore = useMutation({
    mutationFn: (fortress: Fortress) => api.fortresses.restore(fortress.id, fortress),
    onSuccess: (_, fortress) => {
      void queryClient.invalidateQueries({ queryKey: ['fortresses'] })
      void queryClient.invalidateQueries({ queryKey: ['fortress', fortress.slug] })
    },
  })

  const remove = useMutation({
    mutationFn: (fortress: Fortress) => api.fortresses.delete(fortress.id),
    onSuccess: (_, fortress) => {
      setPendingDelete(null)
      void queryClient.invalidateQueries({ queryKey: ['fortresses'] })
      void queryClient.invalidateQueries({ queryKey: ['fortress', fortress.slug] })
    },
  })

  const filtered = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    return data.filter((fortress) => {
      const matchesStatus = status === 'all' || fortress.status === status
      const matchesSearch =
        !normalizedSearch ||
        fortress.slug.toLowerCase().includes(normalizedSearch) ||
        localized(fortress.name, locale).toLowerCase().includes(normalizedSearch)
      return matchesStatus && matchesSearch
    })
  }, [data, locale, search, status])

  if (isLoading) return <p>{t('loading')}</p>

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-2xl font-bold">{t('admin.fortresses')}</h3>
        <Link
          to="/admin/fortresses/new"
          className="rounded-full bg-forest px-4 py-2 text-sm font-medium text-white"
        >
          {t('adminFortresses.create')}
        </Link>
      </div>
      <div className="grid gap-3 md:grid-cols-[1fr_220px]">
        <input
          className="rounded-xl border border-stone-300 px-3 py-2"
          placeholder={t('search')}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select
          className="rounded-xl border border-stone-300 px-3 py-2"
          value={status}
          onChange={(event) => setStatus(event.target.value as PublicationStatus | 'all')}
        >
          <option value="all">{t('adminFortresses.allStatuses')}</option>
          {statuses.map((itemStatus) => (
            <option key={itemStatus} value={itemStatus}>
              {t(`adminOptions.${itemStatus}`, itemStatus)}
            </option>
          ))}
        </select>
      </div>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b">
            <th className="py-2">{t('adminFortresses.name')}</th>
            <th>{t('adminFortresses.slug')}</th>
            <th>{t('adminFortresses.status')}</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {filtered.map((fortress) => (
            <tr key={fortress.id} className="border-b border-stone-100">
              <td className="py-3">{localized(fortress.name, locale)}</td>
              <td>{fortress.slug}</td>
              <td>{t(`adminOptions.${fortress.status}`, fortress.status)}</td>
              <td className="py-3">
                <div className="flex flex-wrap justify-end gap-1">
                  <Link
                    to={`/fortress/${fortress.slug}`}
                    className={`${iconLinkClass} text-terracotta`}
                    title={t('adminFortresses.view')}
                    aria-label={t('adminFortresses.view')}
                  >
                    <EyeIcon />
                    <span className="sr-only">{t('adminFortresses.view')}</span>
                  </Link>
                  <Link
                    to={`/admin/fortresses/${fortress.slug}/edit`}
                    className={`${iconLinkClass} text-forest`}
                    title={t('adminFortresses.edit')}
                    aria-label={t('adminFortresses.edit')}
                  >
                    <PencilIcon />
                    <span className="sr-only">{t('adminFortresses.edit')}</span>
                  </Link>
                  {fortress.status === 'archived' ? (
                    <button
                      type="button"
                      className={`${iconButtonClass} text-forest`}
                      disabled={restore.isPending}
                      title={t('adminFortresses.restore')}
                      aria-label={t('adminFortresses.restore')}
                      onClick={() => {
                        if (window.confirm(t('adminFortresses.restoreConfirm'))) {
                          restore.mutate(fortress)
                        }
                      }}
                    >
                      <RestoreIcon />
                      <span className="sr-only">{t('adminFortresses.restore')}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={`${iconButtonClass} text-amber-700`}
                      disabled={archive.isPending}
                      title={t('adminFortresses.archive')}
                      aria-label={t('adminFortresses.archive')}
                      onClick={() => {
                        if (window.confirm(t('adminFortresses.archiveConfirm'))) {
                          archive.mutate(fortress)
                        }
                      }}
                    >
                      <ArchiveIcon />
                      <span className="sr-only">{t('adminFortresses.archive')}</span>
                    </button>
                  )}
                  {fortress.status === 'archived' ? (
                    <button
                      type="button"
                      className={`${iconButtonClass} text-red-700`}
                      disabled={remove.isPending}
                      title={t('adminFortresses.delete')}
                      aria-label={t('adminFortresses.delete')}
                      onClick={() => setPendingDelete(fortress)}
                    >
                      <TrashIcon />
                      <span className="sr-only">{t('adminFortresses.delete')}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={disabledDeleteButtonClass}
                      title={t('adminFortresses.deleteDisabledHint')}
                      aria-label={t('adminFortresses.deleteDisabledHint')}
                      aria-disabled="true"
                      onClick={() => window.alert(t('adminFortresses.deleteDisabledHint'))}
                    >
                      <TrashIcon />
                      <span className="sr-only">
                        {t('adminFortresses.deleteDisabledHint')}
                      </span>
                    </button>
                  )}
                </div>
                {archive.error || restore.error || remove.error ? (
                  <p className="mt-2 text-right text-xs text-red-700">
                    {archive.error instanceof Error
                      ? archive.error.message
                      : restore.error instanceof Error
                        ? restore.error.message
                        : remove.error instanceof Error
                          ? remove.error.message
                          : t('adminFortresses.actionFailed')}
                  </p>
                ) : null}
              </td>
            </tr>
          ))}
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={4} className="py-6 text-center text-stone-500">
                {t('empty')}
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
      {pendingDelete ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-fortress-title"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h4 id="delete-fortress-title" className="text-lg font-bold text-stone-900">
              {t('adminFortresses.deleteConfirmTitle')}
            </h4>
            <p className="mt-3 text-sm text-stone-700">{t('adminFortresses.deleteConfirm')}</p>
            <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-800">
              {localized(pendingDelete.name, locale)} · {pendingDelete.slug}
            </p>
            {remove.error ? (
              <p className="mt-3 text-sm text-red-700">
                {remove.error instanceof Error
                  ? remove.error.message
                  : t('adminFortresses.actionFailed')}
              </p>
            ) : null}
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium"
                disabled={remove.isPending}
                onClick={() => setPendingDelete(null)}
              >
                {t('adminFortresses.cancel')}
              </button>
              <button
                type="button"
                className="rounded-full bg-red-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                disabled={remove.isPending}
                onClick={() => remove.mutate(pendingDelete)}
              >
                {remove.isPending
                  ? t('adminFortresses.deleting')
                  : t('adminFortresses.confirmDelete')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
