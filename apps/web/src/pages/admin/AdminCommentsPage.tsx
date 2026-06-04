import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import type { CommentStatus } from '@hayastani/shared'
import { api } from '../../api/client'

const statuses: CommentStatus[] = ['published', 'hidden', 'review']

export function AdminCommentsPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { data = [], isLoading } = useQuery({
    queryKey: ['admin-comments'],
    queryFn: () => api.comments.adminList(),
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: CommentStatus }) =>
      api.comments.updateStatus(id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-comments'] })
      void queryClient.invalidateQueries({ queryKey: ['comments'] })
    },
  })

  const remove = useMutation({
    mutationFn: (id: string) => api.comments.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-comments'] })
      void queryClient.invalidateQueries({ queryKey: ['comments'] })
    },
  })

  if (isLoading) return <p>{t('loading')}</p>

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-bold">{t('admin.comments')}</h3>
      <div className="space-y-3">
        {data.map((comment) => (
          <article key={comment.id} className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-stone-900">{comment.author}</p>
                <p className="text-xs text-stone-500">
                  {comment.userEmail ?? t('adminComments.guest')} ·{' '}
                  {new Date(comment.createdAt).toLocaleString()}
                </p>
                {comment.fortressSlug ? (
                  <Link
                    to={`/fortress/${comment.fortressSlug}`}
                    className="mt-1 inline-flex text-xs text-terracotta"
                  >
                    {comment.fortressSlug}
                  </Link>
                ) : null}
              </div>
              <select
                className="rounded-lg border border-stone-300 bg-white px-2 py-1 text-sm"
                value={comment.status}
                disabled={updateStatus.isPending}
                onChange={(event) =>
                  updateStatus.mutate({
                    id: comment.id,
                    status: event.target.value as CommentStatus,
                  })
                }
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {t(`adminCommentStatuses.${status}`, status)}
                  </option>
                ))}
              </select>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm text-stone-700">{comment.body}</p>
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                className="rounded-full bg-red-700 px-3 py-1 text-sm text-white disabled:opacity-50"
                disabled={remove.isPending}
                onClick={() => {
                  if (window.confirm(t('adminComments.deleteConfirm'))) {
                    remove.mutate(comment.id)
                  }
                }}
              >
                {t('adminComments.delete')}
              </button>
            </div>
          </article>
        ))}
        {data.length === 0 ? <p className="text-sm text-stone-500">{t('empty')}</p> : null}
      </div>
    </div>
  )
}
