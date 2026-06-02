import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth/AuthContext'

export function LoginPage() {
  const { t } = useTranslation()
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('admin@hayastani.am')
  const [password, setPassword] = useState('admin123')
  const [error, setError] = useState('')

  return (
    <form
      className="mx-auto max-w-md space-y-4 rounded-2xl border border-stone-200 bg-white p-8 shadow-sm"
      onSubmit={async (e) => {
        e.preventDefault()
        try {
          await login({ email, password })
          navigate('/')
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Login failed')
        }
      }}
    >
      <h2 className="text-2xl font-bold">{t('auth.loginTitle')}</h2>
      <label className="block text-sm">
        {t('auth.email')}
        <input
          type="email"
          className="mt-1 w-full rounded-xl border px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <label className="block text-sm">
        {t('auth.password')}
        <input
          type="password"
          className="mt-1 w-full rounded-xl border px-3 py-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button type="submit" className="w-full rounded-full bg-terracotta py-2 text-white">
        {t('nav.login')}
      </button>
      <p className="text-center text-sm">
        <Link to="/register" className="text-terracotta">
          {t('nav.register')}
        </Link>
      </p>
    </form>
  )
}
