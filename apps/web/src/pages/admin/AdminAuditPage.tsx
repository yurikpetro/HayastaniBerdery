import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { api } from '../../api/client'

export function AdminAuditPage() {
  const { t } = useTranslation()
  const { data = [], isLoading } = useQuery({
    queryKey: ['audit'],
    queryFn: () => api.audit.list(),
  })

  if (isLoading) return <p>{t('loading')}</p>

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-bold">{t('admin.audit')}</h3>
      <ul className="space-y-2 text-sm">
        {(data as { id: string; action: string; createdAt: string }[]).map((entry) => (
          <li key={entry.id} className="rounded-lg bg-stone-50 px-4 py-3">
            <strong>{entry.action}</strong>
            <span className="ml-2 text-stone-500">{new Date(entry.createdAt).toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
