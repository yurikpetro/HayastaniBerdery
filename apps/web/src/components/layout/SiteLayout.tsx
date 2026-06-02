import { Link, NavLink, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Locale } from '@hayastani/shared'
import { useAuth } from '../../auth/AuthContext'

const locales: Locale[] = ['hy', 'ru', 'en']

export function SiteLayout() {
  const { t, i18n } = useTranslation()
  const { user, logout, isAdmin } = useAuth()

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-stone-50/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 lg:px-6">
          <Link to="/" className="group">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta">
              Heritage Map
            </p>
            <h1 className="text-2xl font-bold text-stone-900 group-hover:text-terracotta">
              {t('brand')}
            </h1>
          </Link>

          <nav className="flex flex-wrap items-center gap-2 text-sm">
            {[
              ['/', 'nav.map'],
              ['/catalog', 'nav.catalog'],
              ['/submit', 'nav.submit'],
              ['/about', 'nav.about'],
            ].map(([to, key]) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 transition ${
                    isActive
                      ? 'bg-terracotta text-white'
                      : 'bg-white/70 text-stone-800 hover:bg-stone-200'
                  }`
                }
              >
                {t(key)}
              </NavLink>
            ))}
            {isAdmin ? (
              <NavLink
                to="/admin"
                className="rounded-full bg-forest px-4 py-2 text-white hover:opacity-90"
              >
                {t('nav.admin')}
              </NavLink>
            ) : null}
          </nav>

          <div className="flex items-center gap-2">
            {locales.map((locale) => (
              <button
                key={locale}
                type="button"
                onClick={() => i18n.changeLanguage(locale)}
                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                  i18n.language === locale
                    ? 'bg-stone-900 text-white'
                    : 'bg-white text-stone-700'
                }`}
              >
                {locale}
              </button>
            ))}
            {user ? (
              <>
                <span className="hidden text-sm text-stone-600 sm:inline">{user.name}</span>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-full border border-stone-300 px-4 py-2 text-sm"
                >
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="rounded-full px-4 py-2 text-sm hover:bg-stone-200">
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  className="rounded-full bg-terracotta px-4 py-2 text-sm text-white"
                >
                  {t('nav.register')}
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
        <Outlet />
      </main>

      <footer className="mt-12 border-t border-stone-200 bg-stone-900 px-4 py-10 text-stone-200">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p>{t('brand')} — {t('tagline')}</p>
          <Link to="/rules" className="text-terracotta hover:underline">
            {t('nav.rules')}
          </Link>
        </div>
      </footer>
    </div>
  )
}
