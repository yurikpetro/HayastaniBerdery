import { useEffect } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Locale } from '@hayastani/shared'
import { useAuth } from '../../auth/AuthContext'

const locales: Locale[] = ['hy', 'ru', 'en']

export function SiteLayout() {
  const { t, i18n } = useTranslation()
  const { user, logout, isAdmin } = useAuth()
  const location = useLocation()
  const isMapHome = location.pathname === '/'

  useEffect(() => {
    document.body.classList.toggle('map-home', isMapHome)
    document.documentElement.classList.toggle('map-home', isMapHome)
    return () => {
      document.body.classList.remove('map-home')
      document.documentElement.classList.remove('map-home')
    }
  }, [isMapHome])

  return (
    <div
      className={
        isMapHome ? 'flex h-dvh max-h-dvh flex-col overflow-hidden' : 'min-h-screen'
      }
    >
      <header
        className={`z-50 shrink-0 border-b ${
          isMapHome
            ? 'border-[#2a3544] bg-[#3d4f63] text-white'
            : 'border-stone-200/80 bg-stone-50/90 text-stone-900 backdrop-blur-md'
        }`}
      >
        <div
          className={`flex flex-wrap items-center justify-between gap-3 px-4 ${
            isMapHome ? 'py-2.5' : 'mx-auto max-w-7xl py-4 lg:px-6'
          }`}
        >
          <Link to="/" className="group flex items-center gap-3">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                isMapHome ? 'bg-terracotta text-white' : 'bg-terracotta/15 text-terracotta'
              }`}
            >
              HB
            </span>
            <div>
              <p
                className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${
                  isMapHome ? 'text-white/70' : 'text-terracotta'
                }`}
              >
                Heritage Map
              </p>
              <h1
                className={`text-lg font-bold leading-tight ${
                  isMapHome ? 'text-white group-hover:text-terracotta' : 'text-stone-900 group-hover:text-terracotta'
                }`}
              >
                {t('brand')}
              </h1>
            </div>
          </Link>

          <nav className="flex flex-wrap items-center gap-1.5 text-sm">
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
                  `rounded px-3 py-1.5 transition ${
                    isMapHome
                      ? isActive
                        ? 'bg-white/20 text-white'
                        : 'text-white/85 hover:bg-white/10'
                      : isActive
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
                className={`rounded px-3 py-1.5 ${
                  isMapHome ? 'bg-forest/80 text-white' : 'bg-forest text-white'
                }`}
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
                className={`rounded px-2 py-0.5 text-xs font-semibold uppercase ${
                  isMapHome
                    ? i18n.language === locale
                      ? 'bg-white text-[#3d4f63]'
                      : 'text-white/80 hover:bg-white/15'
                    : i18n.language === locale
                      ? 'bg-stone-900 text-white'
                      : 'bg-white text-stone-700'
                }`}
              >
                {locale}
              </button>
            ))}
            {user ? (
              <>
                <span
                  className={`hidden text-sm sm:inline ${isMapHome ? 'text-white/80' : 'text-stone-600'}`}
                >
                  {user.name}
                </span>
                <button
                  type="button"
                  onClick={logout}
                  className={`rounded border px-3 py-1 text-sm ${
                    isMapHome
                      ? 'border-white/30 text-white hover:bg-white/10'
                      : 'border-stone-300'
                  }`}
                >
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`rounded px-3 py-1 text-sm ${
                    isMapHome ? 'text-white/90 hover:bg-white/10' : 'hover:bg-stone-200'
                  }`}
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  className={`rounded px-3 py-1 text-sm ${
                    isMapHome ? 'bg-terracotta text-white' : 'bg-terracotta text-white'
                  }`}
                >
                  {t('nav.register')}
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main
        className={
          isMapHome
            ? 'min-h-0 flex-1'
            : 'mx-auto max-w-7xl px-4 py-6 lg:px-6'
        }
      >
        <Outlet />
      </main>

      {!isMapHome ? (
        <footer className="mt-12 border-t border-stone-200 bg-stone-900 px-4 py-10 text-stone-200">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p>
              {t('brand')} — {t('tagline')}
            </p>
            <Link to="/rules" className="text-terracotta hover:underline">
              {t('nav.rules')}
            </Link>
          </div>
        </footer>
      ) : null}
    </div>
  )
}
