import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import type { Locale, LocalizedText } from '@hayastani/shared'
import { api } from '../../api/client'
import { localized } from '../../lib/labels'

type AuditDetails = {
  slug?: string
  name?: LocalizedText
  diffVersion?: number
  status?: string
  previousStatus?: string
  changedFields?: string[]
  previousRole?: string
  role?: string
  email?: string
  targetUserId?: string
  reason?: string | null
  commentId?: string
  authorName?: string
}

export function AdminUserDetailsPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const { id = '' } = useParams()
  const { data: user, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: () => api.users.byId(id),
    enabled: Boolean(id),
  })

  if (isLoading) return <p>{t('loading')}</p>
  if (!user) return <p>{t('empty')}</p>

  return (
    <div className="space-y-4">
      <Link to="/admin/users" className="text-sm text-terracotta">
        {t('adminUsers.backToUsers')}
      </Link>
      <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-2xl font-bold">{user.name}</h3>
            <p className="text-stone-600">{user.email}</p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              user.isBanned ? 'bg-red-50 text-red-800' : 'bg-emerald-50 text-emerald-800'
            }`}
          >
            {user.isBanned ? t('adminUsers.banned') : t('adminUsers.active')}
          </span>
        </div>
      </div>

      <dl className="grid gap-4 md:grid-cols-2">
        <Info label={t('adminUsers.role')} value={t(`adminRoles.${user.role}`, user.role)} />
        <Info label={t('adminUsers.createdAt')} value={new Date(user.createdAt).toLocaleString()} />
        <Info label={t('adminUsers.updatedAt')} value={new Date(user.updatedAt).toLocaleString()} />
        <Info
          label={t('adminUsers.lastLoginAt')}
          value={user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : t('empty')}
        />
        <a href="#admin-actions" className="rounded-2xl border border-stone-200 p-4 hover:bg-stone-50">
          <dt className="text-xs uppercase tracking-wide text-stone-500">
            {t('adminUsers.adminActions')}
          </dt>
          <dd className="mt-1 text-sm text-terracotta">{user.auditLogsCount ?? 0}</dd>
        </a>
        {user.isBanned ? (
          <>
            <Info
              label={t('adminUsers.bannedAt')}
              value={user.bannedAt ? new Date(user.bannedAt).toLocaleString() : t('empty')}
            />
            <Info label={t('adminUsers.bannedBy')} value={user.bannedBy?.email ?? t('empty')} />
            <Info
              label={t('adminUsers.banReason')}
              value={user.bannedReason || t('empty')}
              wide
            />
          </>
        ) : null}
      </dl>

      <section className="rounded-2xl border border-stone-200 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h4 className="text-lg font-bold">{t('adminUsers.commentsBlock')}</h4>
          <span className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-600">
            {t('adminUsers.commentsCount', { count: user.commentsCount ?? 0 })}
          </span>
        </div>
        <div className="mt-4 space-y-3">
          {user.comments?.length ? (
            user.comments.map((comment) => (
              <article key={comment.id} className="rounded-xl bg-stone-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Link
                    to={`/fortress/${comment.fortressSlug}#comment-${comment.id}`}
                    className="font-medium text-terracotta"
                  >
                    {localized(comment.fortressName, locale)}
                  </Link>
                  <span className="text-xs text-stone-500">{comment.fortressSlug}</span>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                    <span className="rounded-full bg-white px-2 py-1">
                      {t(`adminCommentStatuses.${comment.status}`, comment.status)}
                    </span>
                    <time dateTime={comment.createdAt}>
                      {new Date(comment.createdAt).toLocaleString()}
                    </time>
                  </div>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm text-stone-700">{comment.body}</p>
              </article>
            ))
          ) : (
            <p className="text-sm text-stone-500">{t('adminUsers.noComments')}</p>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-stone-200 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h4 className="text-lg font-bold">{t('adminUsers.submissionsBlock')}</h4>
          <span className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-600">
            {t('adminUsers.submissionsCount', { count: user.submissionsCount ?? 0 })}
          </span>
        </div>
        <div className="mt-4 space-y-3">
          {user.submissions?.length ? (
            user.submissions.map((submission) => (
              <article key={submission.id} className="rounded-xl bg-stone-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Link
                    to={`/admin/submissions#submission-${submission.id}`}
                    className="font-medium text-terracotta"
                  >
                    {localized(submission.proposedFortressName, locale)}
                  </Link>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                    <span className="rounded-full bg-white px-2 py-1">
                      {t(`adminSubmissionStatuses.${submission.status}`, submission.status)}
                    </span>
                    <time dateTime={submission.createdAt}>
                      {new Date(submission.createdAt).toLocaleString()}
                    </time>
                  </div>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm text-stone-700">
                  {localized(submission.proposedFortressSummary, locale) || t('empty')}
                </p>
                {submission.moderatorNote ? (
                  <p className="mt-3 rounded-lg bg-white p-3 text-sm text-stone-700">
                    {submission.moderatorNote}
                  </p>
                ) : null}
              </article>
            ))
          ) : (
            <p className="text-sm text-stone-500">{t('adminUsers.noSubmissions')}</p>
          )}
        </div>
      </section>

      <section id="admin-actions" className="rounded-2xl border border-stone-200 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h4 className="text-lg font-bold">{t('adminUsers.adminActions')}</h4>
          <span className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-600">
            {t('adminUsers.adminActionsCount', { count: user.auditLogsCount ?? 0 })}
          </span>
        </div>
        <div className="mt-4 space-y-3">
          {user.adminActions?.length ? (
            user.adminActions.map((entry) => {
              const details = (entry.details ?? {}) as AuditDetails
              const detailRows = getActionDetails(entry.action, details, t)
              const fortressName = entry.fortressName ?? details.name
              const fortressSlug = entry.fortressSlug ?? details.slug

              return (
                <article key={entry.id} className="rounded-xl bg-stone-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium text-stone-900">
                      {t(`adminAudit.actions.${entry.action}`, entry.action)}
                    </span>
                    <time className="text-xs text-stone-500" dateTime={entry.createdAt}>
                      {new Date(entry.createdAt).toLocaleString()}
                    </time>
                  </div>
                  {fortressSlug ? (
                    <div className="mt-2">
                      {entry.action === 'fortress.deleted' ? (
                        <span className="inline-flex text-sm font-medium text-stone-900">
                          {fortressName ? localized(fortressName, locale) : fortressSlug}
                        </span>
                      ) : (
                        <Link
                          to={`/admin/fortresses/${fortressSlug}/edit`}
                          className="inline-flex text-sm font-medium text-terracotta"
                        >
                          {fortressName ? localized(fortressName, locale) : fortressSlug}
                        </Link>
                      )}
                      {fortressName ? (
                        <p className="mt-1 text-xs text-stone-500">
                          {fortressSlug}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                  {detailRows.length ? (
                    <dl className="mt-3 grid gap-2 text-sm md:grid-cols-2">
                      {detailRows.map(([label, value]) => (
                        <div key={label} className="rounded-lg bg-white px-3 py-2">
                          <dt className="text-xs uppercase tracking-wide text-stone-500">{label}</dt>
                          <dd className="mt-1 text-stone-800">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : null}
                </article>
              )
            })
          ) : (
            <p className="text-sm text-stone-500">{t('adminUsers.noAdminActions')}</p>
          )}
        </div>
      </section>
    </div>
  )
}

function getActionDetails(
  action: string,
  details: AuditDetails,
  t: ReturnType<typeof useTranslation>['t'],
): Array<[string, string]> {
  const rows: Array<[string, string | undefined | null]> = []

  if (details.email) rows.push([t('adminActionDetails.email'), details.email])
  if (details.previousRole || details.role) {
    rows.push([
      t('adminActionDetails.roleChange'),
      `${details.previousRole ? t(`adminRoles.${details.previousRole}`, details.previousRole) : '—'} → ${
        details.role ? t(`adminRoles.${details.role}`, details.role) : '—'
      }`,
    ])
  }
  if ((details.previousStatus || details.status) && details.previousStatus !== details.status) {
    rows.push([
      t('adminActionDetails.statusChange'),
      `${details.previousStatus ? t(`adminOptions.${details.previousStatus}`, details.previousStatus) : '—'} → ${
        details.status ? t(`adminOptions.${details.status}`, details.status) : '—'
      }`,
    ])
  }
  const changedFields = details.diffVersion
    ? details.changedFields
    : details.changedFields?.filter((field) => field !== 'photos' && field !== 'sources')
  if (changedFields?.length) {
    rows.push([
      t('adminActionDetails.changedFields'),
      changedFields
        .map((field) => t(`adminFortressFields.${field}`, field))
        .join(', '),
    ])
  }
  if (details.reason) rows.push([t('adminActionDetails.reason'), details.reason])
  if (details.commentId) rows.push([t('adminActionDetails.commentId'), details.commentId])
  if (details.authorName) rows.push([t('adminActionDetails.author'), details.authorName])
  if (details.targetUserId && action !== 'user.role_changed') {
    rows.push([t('adminActionDetails.targetUser'), details.targetUserId])
  }

  return rows.filter((row): row is [string, string] => Boolean(row[1]))
}

function Info({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={`rounded-2xl border border-stone-200 p-4 ${wide ? 'md:col-span-2' : ''}`}>
      <dt className="text-xs uppercase tracking-wide text-stone-500">{label}</dt>
      <dd className="mt-1 text-sm text-stone-900">{value}</dd>
    </div>
  )
}
