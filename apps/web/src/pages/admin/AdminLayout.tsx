import { Link, NavLink, Outlet, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../auth/AuthContext'

export function AdminLayout() {
  const { t } = useTranslation()
  const { isAdmin, logout } = useAuth()
  if (!isAdmin) return <Navigate to="/login" replace />

  return (
    <div className="mx-auto min-h-screen max-w-7xl px-4 py-6 lg:px-6">
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
      <aside className="flex flex-col rounded-2xl border border-stone-200 bg-stone-900 p-4 text-stone-100">
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
        <div className="mt-auto border-t border-stone-700 pt-4">
          <Link
            to="/"
            className="block rounded-lg px-3 py-2 text-sm font-medium text-stone-100 hover:bg-stone-800"
          >
            ← {t('admin.backToSite')}
          </Link>
          <button
            type="button"
            onClick={logout}
            className="mt-2 w-full rounded-lg border border-stone-600 px-3 py-2 text-left text-sm text-stone-300 hover:bg-stone-800"
          >
            {t('nav.logout')}
          </button>
        </div>
      </aside>
      <div className="rounded-2xl border border-stone-200 bg-white p-6">
        <Outlet />
      </div>
      </div>
    </div>
  )
}
