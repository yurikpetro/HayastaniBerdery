import { NavLink, Outlet, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../auth/AuthContext'

export function AdminLayout() {
  const { t } = useTranslation()
  const { isAdmin } = useAuth()
  if (!isAdmin) return <Navigate to="/login" replace />

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
      <aside className="rounded-2xl border border-stone-200 bg-stone-900 p-4 text-stone-100">
        <h2 className="mb-4 text-lg font-bold">{t('admin.title')}</h2>
        <nav className="flex flex-col gap-2 text-sm">
          {[
            ['/admin/submissions', 'admin.submissions'],
            ['/admin/fortresses', 'admin.fortresses'],
            ['/admin/audit', 'admin.audit'],
          ].map(([to, key]) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 ${isActive ? 'bg-terracotta' : 'hover:bg-stone-800'}`
              }
            >
              {t(key)}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="rounded-2xl border border-stone-200 bg-white p-6">
        <Outlet />
      </div>
    </div>
  )
}
