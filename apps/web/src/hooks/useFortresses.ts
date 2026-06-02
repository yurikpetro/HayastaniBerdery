import { useQuery } from '@tanstack/react-query'
import type { FortressListQuery } from '@hayastani/shared'
import { api } from '../api/client'
import { seedFortresses } from '../data/seed'

export function useFortresses(query: FortressListQuery = {}) {
  return useQuery({
    queryKey: ['fortresses', query],
    queryFn: async () => {
      try {
        return await api.fortresses.list({ ...query, status: query.status ?? 'published' })
      } catch {
        const items = seedFortresses.filter(
          (f) =>
            (query.status ? f.status === query.status : f.status === 'published') &&
            (!query.scope || f.scope === query.scope),
        )
        return { items, total: items.length, page: 1, limit: items.length }
      }
    },
  })
}

export function useFortress(slug: string) {
  return useQuery({
    queryKey: ['fortress', slug],
    queryFn: async () => {
      try {
        return await api.fortresses.bySlug(slug)
      } catch {
        const fortress = seedFortresses.find((f) => f.slug === slug)
        if (!fortress) throw new Error('Not found')
        return fortress
      }
    },
    enabled: Boolean(slug),
  })
}
