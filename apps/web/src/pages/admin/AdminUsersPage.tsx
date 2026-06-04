import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import type { AdminUser, UserRole } from '@hayastani/shared'
import { api } from '../../api/client'
import { useAuth } from '../../auth/AuthContext'

const roles: UserRole[] = ['user', 'moderator', 'admin', 'super_admin']

export function AdminUsersPage() {
  const { t } = useTranslation()
  const { user, canAssignAdmins, isSuperAdmin } = useAuth()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [role, setRole] = useState<UserRole | 'all'>('all')
  const [banned, setBanned] = useState<'all' | 'true' | 'false'>('all')
  const [pendingBan, setPendingBan] = useState<AdminUser | null>(null)
  const [banReason, setBanReason] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['users', { search, role, banned }],
    queryFn: () =>
      api.users.list({
        search,
        role: role === 'all' ? undefined : role,
        banned: banned === 'all' ? undefined : banned === 'true',
        limit: 100,
      }),
    placeholderData: keepPreviousData,
  })

  const invalidateUsers = (target?: AdminUser) => {
    void queryClient.invalidateQueries({ queryKey: ['users'] })
    if (target) void queryClient.invalidateQueries({ queryKey: ['user', target.id] })
  }

  const updateRole = useMutation({
    mutationFn: ({ target, nextRole }: { target: AdminUser; nextRole: UserRole }) =>
      api.users.updateRole(target.id, { role: nextRole }),
    onSuccess: (updated) => invalidateUsers(updated),
  })

  const ban = useMutation({
    mutationFn: ({ target, reason }: { target: AdminUser; reason: string }) =>
      api.users.ban(target.id, { reason }),
    onSuccess: (updated) => {
      setPendingBan(null)
      setBanReason('')
      invalidateUsers(updated)
    },
  })

  const unban = useMutation({
    mutationFn: (target: AdminUser) => api.users.unban(target.id),
    onSuccess: (updated) => invalidateUsers(updated),
  })

  const roleOptions = useMemo(
    () => (canAssignAdmins ? ['user', 'moderator', 'admin'] : ['user', 'moderator']) as UserRole[],
    [canAssignAdmins],
  )

  if (isLoading && !data) return <p>{t('loading')}</p>

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-bold">{t('admin.users')}</h3>
      <div className="grid gap-3 md:grid-cols-[1fr_180px_180px]">
        <input
          className="rounded-xl border border-stone-300 px-3 py-2"
          placeholder={t('adminUsers.search')}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select
          className="rounded-xl border border-stone-300 px-3 py-2"
          value={role}
          onChange={(event) => setRole(event.target.value as UserRole | 'all')}
        >
          <option value="all">{t('adminUsers.allRoles')}</option>
          {roles.map((item) => (
            <option key={item} value={item}>
              {t(`adminRoles.${item}`, item)}
            </option>
          ))}
        </select>
        <select
          className="rounded-xl border border-stone-300 px-3 py-2"
          value={banned}
          onChange={(event) => setBanned(event.target.value as 'all' | 'true' | 'false')}
        >
          <option value="all">{t('adminUsers.allStatuses')}</option>
          <option value="false">{t('adminUsers.active')}</option>
          <option value="true">{t('adminUsers.banned')}</option>
        </select>
      </div>

      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b">
            <th className="py-2">{t('adminUsers.user')}</th>
            <th>{t('adminUsers.role')}</th>
            <th>{t('adminUsers.status')}</th>
            <th>{t('adminUsers.activity')}</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {data?.items.map((target) => {
            const isSelf = target.id === user?.id
            const protectedSuperAdmin = target.role === 'super_admin'
            const canChangeRole = !isSelf && !protectedSuperAdmin
            const canToggleBan =
              !isSelf &&
              !protectedSuperAdmin &&
              (isSuperAdmin || target.role === 'user')

            return (
              <tr key={target.id} className="border-b border-stone-100">
                <td className="py-3">
                  <Link to={`/admin/users/${target.id}`} className="font-medium text-terracotta">
                    {target.name}
                  </Link>
                  <p className="text-xs text-stone-500">{target.email}</p>
                </td>
                <td>
                  <select
                    className="rounded-lg border border-stone-300 px-2 py-1"
                    value={target.role}
                    disabled={!canChangeRole || updateRole.isPending}
                    title={!canChangeRole ? t('adminUsers.roleLocked') : undefined}
                    onChange={(event) =>
                      updateRole.mutate({
                        target,
                        nextRole: event.target.value as UserRole,
                      })
                    }
                  >
                    {target.role === 'super_admin' ? (
                      <option value="super_admin">{t('adminRoles.super_admin')}</option>
                    ) : null}
                    {roleOptions.map((item) => (
                      <option key={item} value={item}>
                        {t(`adminRoles.${item}`, item)}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      target.isBanned
                        ? 'bg-red-50 text-red-800'
                        : 'bg-emerald-50 text-emerald-800'
                    }`}
                  >
                    {target.isBanned ? t('adminUsers.banned') : t('adminUsers.active')}
                  </span>
                </td>
                <td className="text-xs text-stone-600">
                  {t('adminUsers.comments')}: {target.commentsCount ?? 0} ·{' '}
                  {t('adminUsers.submissions')}: {target.submissionsCount ?? 0}
                </td>
                <td className="py-3 text-right">
                  {target.isBanned ? (
                    <button
                      type="button"
                      className="rounded-full border border-stone-300 px-3 py-1 text-sm disabled:opacity-50"
                      disabled={!canToggleBan || unban.isPending}
                      title={!canToggleBan ? t('adminUsers.banLocked') : undefined}
                      onClick={() => unban.mutate(target)}
                    >
                      {t('adminUsers.unban')}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="rounded-full bg-red-700 px-3 py-1 text-sm text-white disabled:opacity-50"
                      disabled={!canToggleBan || ban.isPending}
                      title={!canToggleBan ? t('adminUsers.banLocked') : undefined}
                      onClick={() => setPendingBan(target)}
                    >
                      {t('adminUsers.ban')}
                    </button>
                  )}
                </td>
              </tr>
            )
          })}
          {data?.items.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-6 text-center text-stone-500">
                {t('empty')}
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>

      {pendingBan ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h4 className="text-lg font-bold">{t('adminUsers.banTitle')}</h4>
            <p className="mt-2 text-sm text-stone-600">
              {pendingBan.name} · {pendingBan.email}
            </p>
            <label className="mt-4 block text-sm">
              {t('adminUsers.banReason')}
              <textarea
                className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2"
                rows={3}
                value={banReason}
                onChange={(event) => setBanReason(event.target.value)}
              />
            </label>
            {ban.error ? (
              <p className="mt-3 text-sm text-red-700">
                {ban.error instanceof Error ? ban.error.message : t('adminUsers.actionFailed')}
              </p>
            ) : null}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-full border border-stone-300 px-4 py-2 text-sm"
                disabled={ban.isPending}
                onClick={() => {
                  setPendingBan(null)
                  setBanReason('')
                }}
              >
                {t('adminUsers.cancel')}
              </button>
              <button
                type="button"
                className="rounded-full bg-red-700 px-4 py-2 text-sm text-white disabled:opacity-60"
                disabled={ban.isPending}
                onClick={() => ban.mutate({ target: pendingBan, reason: banReason })}
              >
                {ban.isPending ? t('adminUsers.banning') : t('adminUsers.confirmBan')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
