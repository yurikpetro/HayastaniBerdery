import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useFortresses } from '../../hooks/useFortresses'
import { localized } from '../../lib/labels'

export function AdminFortressesPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as 'hy' | 'ru' | 'en'
  const { data, isLoading } = useFortresses({ limit: 100, status: 'published' })

  if (isLoading) return <p>{t('loading')}</p>

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-bold">{t('admin.fortresses')}</h3>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b">
            <th className="py-2">Name</th>
            <th>Slug</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {data?.items.map((fortress) => (
            <tr key={fortress.id} className="border-b border-stone-100">
              <td className="py-3">{localized(fortress.name, locale)}</td>
              <td>{fortress.slug}</td>
              <td>{fortress.status}</td>
              <td>
                <Link to={`/fortress/${fortress.slug}`} className="text-terracotta">
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
