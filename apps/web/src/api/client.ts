import type {
  AuthTokens,
  AuthUser,
  CreateCommentDto,
  CreateSubmissionDto,
  Fortress,
  FortressComment,
  FortressListQuery,
  FortressSubmission,
  LoginDto,
  PaginatedResult,
  RegisterDto,
  SubmissionStatus,
} from '@hayastani/shared'

const API_BASE = '/api'

function getToken() {
  return localStorage.getItem('accessToken')
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }
  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || response.statusText)
  }
  return response.json() as Promise<T>
}

export const api = {
  auth: {
    login: (dto: LoginDto) =>
      request<AuthTokens & { user: AuthUser }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(dto),
      }),
    register: (dto: RegisterDto) =>
      request<AuthTokens & { user: AuthUser }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(dto),
      }),
  },
  fortresses: {
    list: (query: FortressListQuery = {}) => {
      const params = new URLSearchParams()
      Object.entries(query).forEach(([key, value]) => {
        if (value != null && value !== '') params.set(key, String(value))
      })
      return request<PaginatedResult<Fortress>>(`/fortresses?${params}`)
    },
    bySlug: (slug: string) => request<Fortress>(`/fortresses/${slug}`),
    create: (fortress: Fortress) =>
      request<Fortress>('/fortresses', { method: 'POST', body: JSON.stringify(fortress) }),
    update: (id: string, fortress: Fortress) =>
      request<Fortress>(`/fortresses/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(fortress),
      }),
  },
  comments: {
    list: (fortressId: string) =>
      request<FortressComment[]>(`/fortresses/${fortressId}/comments`),
    create: (fortressId: string, dto: CreateCommentDto) =>
      request<FortressComment>(`/fortresses/${fortressId}/comments`, {
        method: 'POST',
        body: JSON.stringify(dto),
      }),
  },
  submissions: {
    list: () => request<FortressSubmission[]>('/submissions'),
    create: (dto: CreateSubmissionDto) =>
      request<FortressSubmission>('/submissions', {
        method: 'POST',
        body: JSON.stringify(dto),
      }),
    updateStatus: (id: string, status: SubmissionStatus, moderatorNote?: string) =>
      request<FortressSubmission>(`/submissions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, moderatorNote }),
      }),
  },
  audit: {
    list: () => request<unknown[]>('/audit'),
  },
  media: {
    upload: async (file: File) => {
      const form = new FormData()
      form.append('file', file)
      const token = getToken()
      const response = await fetch(`${API_BASE}/media/upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: form,
      })
      if (!response.ok) throw new Error('Upload failed')
      return response.json() as Promise<{ url: string }>
    },
  },
}

export function saveSession(tokens: AuthTokens & { user: AuthUser }) {
  localStorage.setItem('accessToken', tokens.accessToken)
  localStorage.setItem('refreshToken', tokens.refreshToken)
  localStorage.setItem('user', JSON.stringify(tokens.user))
}

export function clearSession() {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
}

export function loadUser(): AuthUser | null {
  const raw = localStorage.getItem('user')
  return raw ? (JSON.parse(raw) as AuthUser) : null
}
