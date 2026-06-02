import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth/AuthContext'

export function RegisterPage() {
  const { t } = useTranslation()
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  return (
    <form
      className="mx-auto max-w-md space-y-4 rounded-2xl border border-stone-200 bg-white p-8"
      onSubmit={async (e) => {
        e.preventDefault()
        try {
          await register({ name, email, password })
          navigate('/')
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed')
        }
      }}
    >
      <h2 className="text-2xl font-bold">{t('auth.registerTitle')}</h2>
      <label className="block text-sm">
        {t('auth.name')}
        <input className="mt-1 w-full rounded-xl border px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label className="block text-sm">
        {t('auth.email')}
        <input type="email" className="mt-1 w-full rounded-xl border px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <label className="block text-sm">
        {t('auth.password')}
        <input type="password" className="mt-1 w-full rounded-xl border px-3 py-2" value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button type="submit" className="w-full rounded-full bg-terracotta py-2 text-white">
        {t('nav.register')}
      </button>
      <p className="text-center text-sm">
        <Link to="/login" className="text-terracotta">{t('nav.login')}</Link>
      </p>
    </form>
  )
}
