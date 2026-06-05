import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import type { FortressSubmission, Locale, SubmissionStatus } from '@hayastani/shared'
import { api } from '../../api/client'
import { localized } from '../../lib/labels'

const statuses: SubmissionStatus[] = ['new', 'in-review', 'needs-changes', 'accepted', 'rejected']

const statusTone: Record<SubmissionStatus, string> = {
  new: 'bg-blue-50 text-blue-800',
  'in-review': 'bg-amber-50 text-amber-800',
  'needs-changes': 'bg-orange-50 text-orange-800',
  accepted: 'bg-emerald-50 text-emerald-800',
  rejected: 'bg-red-50 text-red-800',
}

export function AdminSubmissionsPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const location = useLocation()
  const highlightedId = location.hash.replace('#submission-', '')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<SubmissionStatus | 'all'>('all')
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set())
  const [actionDraft, setActionDraft] = useState<{
    submission: FortressSubmission
    status: 'needs-changes' | 'rejected' | 'in-review'
  } | null>(null)
  const [moderatorNote, setModeratorNote] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const { data = [], isLoading } = useQuery({
    queryKey: ['submissions'],
    queryFn: () => api.submissions.list(),
  })

  const update = useMutation({
    mutationFn: ({
      id,
      status,
      note,
    }: {
      id: string
      status: SubmissionStatus
      note?: string
    }) => api.submissions.updateStatus(id, status, note),
    onSuccess: () => {
      setActionDraft(null)
      setModeratorNote('')
      setMessage({ type: 'success', text: t('adminSubmissions.statusUpdated') })
      void queryClient.invalidateQueries({ queryKey: ['submissions'] })
      void queryClient.invalidateQueries({ queryKey: ['fortresses'] })
      void queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error) => {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : t('adminSubmissions.actionFailed'),
      })
    },
  })

  useEffect(() => {
    if (!highlightedId) return
    setExpandedIds((previous) => new Set(previous).add(highlightedId))
    window.setTimeout(() => {
      document.getElementById(`submission-${highlightedId}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }, 0)
  }, [highlightedId])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return data.filter((submission) => {
      const fortress = submission.proposedFortress
      const matchesStatus = status === 'all' || submission.status === status
      const haystack = [
        localized(fortress.name, locale),
        fortress.slug,
        submission.submittedBy,
        submission.submitterNote,
        localized(fortress.summary, locale),
        localized(fortress.nearestSettlement, locale),
      ].join(' ').toLowerCase()
      return matchesStatus && (!query || haystack.includes(query))
    })
  }, [data, locale, search, status])

  const counts = useMemo(
    () =>
      statuses.reduce(
        (acc, item) => ({ ...acc, [item]: data.filter((submission) => submission.status === item).length }),
        {} as Record<SubmissionStatus, number>,
      ),
    [data],
  )

  const toggleExpanded = (id: string) => {
    setExpandedIds((previous) => {
      const next = new Set(previous)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (isLoading) return <p>{t('loading')}</p>

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-2xl font-bold">{t('admin.submissions')}</h3>
        <span className="text-sm text-stone-500">
          {t('adminSubmissions.total', { count: data.length })}
        </span>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_220px]">
        <input
          className="rounded-xl border border-stone-300 px-3 py-2"
          placeholder={t('adminSubmissions.search')}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select
          className="rounded-xl border border-stone-300 px-3 py-2"
          value={status}
          onChange={(event) => setStatus(event.target.value as SubmissionStatus | 'all')}
        >
          <option value="all">{t('adminSubmissions.allStatuses')}</option>
          {statuses.map((item) => (
            <option key={item} value={item}>
              {t(`adminSubmissionStatuses.${item}`, item)} ({counts[item]})
            </option>
          ))}
        </select>
      </div>

      {message ? (
        <p
          className={`rounded-xl p-3 text-sm ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'
          }`}
        >
          {message.text}
        </p>
      ) : null}

      <div className="space-y-3">
        {filtered.map((submission) => {
          const fortress = submission.proposedFortress
          const expanded = expandedIds.has(submission.id)
          const highlighted = highlightedId === submission.id
          const canEdit = submission.status !== 'accepted'

          return (
            <article
              id={`submission-${submission.id}`}
              key={submission.id}
              className={`rounded-2xl border p-4 transition ${
                highlighted ? 'border-terracotta bg-terracotta/5' : 'border-stone-200 bg-white'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link
                    to={`/admin/fortresses/new?submissionId=${submission.id}`}
                    className="text-lg font-bold text-terracotta"
                  >
                    {localized(fortress.name, locale) || fortress.slug}
                  </Link>
                  <p className="mt-1 text-xs text-stone-500">{fortress.slug}</p>
                  <p className="mt-1 text-sm text-stone-600">
                    {submission.submittedByUserId ? (
                      <Link to={`/admin/users/${submission.submittedByUserId}`} className="text-terracotta">
                        {submission.submittedBy}
                      </Link>
                    ) : (
                      submission.submittedBy
                    )}{' '}
                    · {new Date(submission.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone[submission.status]}`}>
                  {t(`adminSubmissionStatuses.${submission.status}`, submission.status)}
                </span>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <Info label={t('adminSubmissions.scope')} value={t(`adminOptions.${fortress.scope}`, fortress.scope)} />
                <Info label={t('fortressPage.nearestSettlement')} value={localized(fortress.nearestSettlement, locale) || t('empty')} />
                <Info
                  label={t('fortressPage.coordinates')}
                  value={`${fortress.coordinates.lat.toFixed(5)}, ${fortress.coordinates.lng.toFixed(5)}`}
                />
              </div>

              <p className="mt-4 whitespace-pre-wrap rounded-xl bg-stone-50 p-3 text-sm text-stone-700">
                {submission.submitterNote || t('adminSubmissions.noSubmitterNote')}
              </p>

              {submission.moderatorNote ? (
                <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
                  {submission.moderatorNote}
                </p>
              ) : null}

              {expanded ? (
                <SubmissionDetails submission={submission} locale={locale} />
              ) : null}

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-full border border-stone-300 px-4 py-1.5 text-sm"
                  onClick={() => toggleExpanded(submission.id)}
                >
                  {expanded ? t('adminSubmissions.hideDetails') : t('adminSubmissions.showDetails')}
                </button>
                <button
                  type="button"
                  className="rounded-full bg-forest px-4 py-1.5 text-sm text-white disabled:opacity-50"
                  disabled={!canEdit}
                  onClick={() => navigate(`/admin/fortresses/new?submissionId=${submission.id}`)}
                >
                  {t('adminSubmissions.openEditor')}
                </button>
                <button
                  type="button"
                  className="rounded-full bg-amber-100 px-4 py-1.5 text-sm text-amber-900 disabled:opacity-50"
                  disabled={update.isPending || submission.status === 'needs-changes'}
                  onClick={() => {
                    setActionDraft({ submission, status: 'needs-changes' })
                    setModeratorNote(submission.moderatorNote ?? '')
                  }}
                >
                  {t('admin.needsChanges')}
                </button>
                <button
                  type="button"
                  className="rounded-full bg-red-100 px-4 py-1.5 text-sm text-red-800 disabled:opacity-50"
                  disabled={update.isPending || submission.status === 'rejected'}
                  onClick={() => {
                    setActionDraft({ submission, status: 'rejected' })
                    setModeratorNote(submission.moderatorNote ?? '')
                  }}
                >
                  {t('admin.reject')}
                </button>
                {submission.publishedId ? (
                  <Link
                    to={`/admin/fortresses/${fortress.slug}/edit`}
                    className="rounded-full border border-stone-300 px-4 py-1.5 text-sm"
                  >
                    {t('adminSubmissions.openPublished')}
                  </Link>
                ) : null}
              </div>
            </article>
          )
        })}
        {filtered.length === 0 ? <p className="text-sm text-stone-500">{t('empty')}</p> : null}
      </div>

      {actionDraft ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <h4 className="text-lg font-bold">
              {actionDraft.status === 'needs-changes'
                ? t('adminSubmissions.needsChangesTitle')
                : t('adminSubmissions.rejectTitle')}
            </h4>
            <p className="mt-2 text-sm text-stone-600">
              {localized(actionDraft.submission.proposedFortress.name, locale)}
            </p>
            <label className="mt-4 block text-sm">
              {t('adminSubmissions.moderatorNote')}
              <textarea
                className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2"
                rows={4}
                value={moderatorNote}
                onChange={(event) => setModeratorNote(event.target.value)}
              />
            </label>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-full border border-stone-300 px-4 py-2 text-sm"
                onClick={() => {
                  setActionDraft(null)
                  setModeratorNote('')
                }}
              >
                {t('adminUsers.cancel')}
              </button>
              <button
                type="button"
                className="rounded-full bg-forest px-4 py-2 text-sm text-white disabled:opacity-60"
                disabled={!moderatorNote.trim() || update.isPending}
                onClick={() =>
                  update.mutate({
                    id: actionDraft.submission.id,
                    status: actionDraft.status,
                    note: moderatorNote,
                  })
                }
              >
                {update.isPending ? t('adminSubmissions.saving') : t('adminSubmissions.confirm')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function SubmissionDetails({ submission, locale }: { submission: FortressSubmission; locale: Locale }) {
  const { t } = useTranslation()
  const fortress = submission.proposedFortress

  return (
    <div className="mt-4 space-y-4 rounded-2xl bg-stone-50 p-4">
      <Info label={t('fortressPage.marz')} value={localized(fortress.marz, locale) || t('empty')} />
      <section>
        <h5 className="font-semibold">{t('adminSubmissions.summary')}</h5>
        <p className="mt-1 whitespace-pre-wrap text-sm text-stone-700">{localized(fortress.summary, locale) || t('empty')}</p>
      </section>
      <section>
        <h5 className="font-semibold">{t('history')}</h5>
        <p className="mt-1 whitespace-pre-wrap text-sm text-stone-700">{localized(fortress.history, locale) || t('empty')}</p>
      </section>
      <section>
        <h5 className="font-semibold">{t('route')}</h5>
        <p className="mt-1 whitespace-pre-wrap text-sm text-stone-700">{localized(fortress.routeHint, locale) || t('empty')}</p>
      </section>
      <div className="grid gap-3 md:grid-cols-2">
        <ListBlock title={t('features')} items={fortress.features.map((item) => localized(item, locale))} />
        <ListBlock title={t('warnings')} items={fortress.warnings.map((item) => localized(item, locale))} />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Info label={t('fortressPage.period')} value={t(`adminOptions.${fortress.period}`, fortress.period)} />
        <Info label={t('fortressPage.condition')} value={t(`adminOptions.${fortress.condition}`, fortress.condition)} />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Info label={t('fortressPage.type')} value={t(`adminOptions.${fortress.type}`, fortress.type)} />
        <Info label={t('fortressPage.evidence')} value={t(`adminOptions.${fortress.evidenceLevel}`, fortress.evidenceLevel)} />
      </div>
      <ListBlock title={t('fortressPage.gallery')} items={fortress.photos.map((photo) => photo.url)} />
      <ListBlock title={t('sources')} items={fortress.sources.map((source) => source.title)} />
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-stone-500">{label}</dt>
      <dd className="mt-1 text-sm text-stone-800">{value}</dd>
    </div>
  )
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  const filtered = items.filter(Boolean)
  return (
    <section>
      <h5 className="font-semibold">{title}</h5>
      {filtered.length ? (
        <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-stone-700">
          {filtered.map((item, index) => (
            <li key={`${item}-${index}`}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-1 text-sm text-stone-500">—</p>
      )}
    </section>
  )
}
