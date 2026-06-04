import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { api } from '../../api/client'

export function AdminUserDetailsPage() {
  const { t } = useTranslation()
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
          label={t('adminUsers.comments')}
          value={String(user.commentsCount ?? 0)}
        />
        <Info
          label={t('adminUsers.submissions')}
          value={String(user.submissionsCount ?? 0)}
        />
        <Info
          label={t('adminUsers.auditLogs')}
          value={String(user.auditLogsCount ?? 0)}
        />
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
    </div>
  )
}

function Info({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={`rounded-2xl border border-stone-200 p-4 ${wide ? 'md:col-span-2' : ''}`}>
      <dt className="text-xs uppercase tracking-wide text-stone-500">{label}</dt>
      <dd className="mt-1 text-sm text-stone-900">{value}</dd>
    </div>
  )
}
