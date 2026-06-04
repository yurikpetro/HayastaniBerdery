import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { api } from '../../api/client'

interface AuditEntry {
  id: string
  action: string
  createdAt: string
  details?: {
    slug?: string
    status?: string
    previousStatus?: string
  } | null
  user?: {
    id: string
    name: string
    email: string
  } | null
  fortress?: {
    id: string
    slug: string
  } | null
}

const actionTone: Record<string, string> = {
  'fortress.created': 'bg-emerald-50 text-emerald-800',
  'fortress.updated': 'bg-blue-50 text-blue-800',
  'fortress.archived': 'bg-amber-50 text-amber-800',
  'fortress.restored': 'bg-green-50 text-green-800',
  'fortress.deleted': 'bg-red-50 text-red-800',
}

export function AdminAuditPage() {
  const { t } = useTranslation()
  const { data = [], isLoading } = useQuery({
    queryKey: ['audit'],
    queryFn: () => api.audit.list(),
  })

  if (isLoading) return <p>{t('loading')}</p>

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-bold">{t('admin.audit')}</h3>
      <ul className="space-y-3 text-sm">
        {(data as AuditEntry[]).map((entry) => {
          const slug = entry.fortress?.slug ?? entry.details?.slug
          const actionLabel = t(`adminAudit.actions.${entry.action}`, entry.action)

          return (
          <li key={entry.id} className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                    actionTone[entry.action] ?? 'bg-stone-200 text-stone-700'
                  }`}
                >
                  {actionLabel}
                </span>
                <div className="text-base font-semibold text-stone-900">
                  {slug ? (
                    entry.fortress ? (
                      <Link to={`/admin/fortresses/${slug}/edit`} className="text-terracotta">
                        {slug}
                      </Link>
                    ) : (
                      <span>{slug}</span>
                    )
                  ) : (
                    <span>{t('adminAudit.unknownFortress')}</span>
                  )}
                </div>
              </div>
              <time className="text-xs text-stone-500">
                {new Date(entry.createdAt).toLocaleString()}
              </time>
            </div>
            <dl className="mt-4 grid gap-3 md:grid-cols-3">
              <div>
                <dt className="text-xs uppercase tracking-wide text-stone-500">
                  {t('adminAudit.user')}
                </dt>
                <dd className="mt-1 text-stone-800">
                  {entry.user ? `${entry.user.name} (${entry.user.email})` : t('adminAudit.system')}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-stone-500">
                  {t('adminAudit.status')}
                </dt>
                <dd className="mt-1 text-stone-800">
                  {entry.details?.status
                    ? t(`adminOptions.${entry.details.status}`, entry.details.status)
                    : t('adminAudit.notAvailable')}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-stone-500">
                  {t('adminAudit.previousStatus')}
                </dt>
                <dd className="mt-1 text-stone-800">
                  {entry.details?.previousStatus
                    ? t(`adminOptions.${entry.details.previousStatus}`, entry.details.previousStatus)
                    : t('adminAudit.notAvailable')}
                </dd>
              </div>
            </dl>
          </li>
          )
        })}
      </ul>
    </div>
  )
}
