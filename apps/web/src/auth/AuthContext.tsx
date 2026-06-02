import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { AuthUser, LoginDto, RegisterDto } from '@hayastani/shared'
import { api, clearSession, loadUser, saveSession } from '../api/client'

interface AuthContextValue {
  user: AuthUser | null
  login: (dto: LoginDto) => Promise<void>
  register: (dto: RegisterDto) => Promise<void>
  logout: () => void
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(loadUser())

  const value = useMemo(
    () => ({
      user,
      isAdmin: user?.role === 'admin' || user?.role === 'moderator',
      async login(dto: LoginDto) {
        const session = await api.auth.login(dto)
        saveSession(session)
        setUser(session.user)
      },
      async register(dto: RegisterDto) {
        const session = await api.auth.register(dto)
        saveSession(session)
        setUser(session.user)
      },
      logout() {
        clearSession()
        setUser(null)
      },
    }),
    [user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
