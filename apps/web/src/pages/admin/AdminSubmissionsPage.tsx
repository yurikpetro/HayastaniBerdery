import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import type { SubmissionStatus } from '@hayastani/shared'
import { api } from '../../api/client'

export function AdminSubmissionsPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { data = [], isLoading } = useQuery({
    queryKey: ['submissions'],
    queryFn: () => api.submissions.list(),
  })

  const update = useMutation({
    mutationFn: ({
      id,
      status,
      note,
    }: {
      id: string
      status: SubmissionStatus
      note?: string
    }) => api.submissions.updateStatus(id, status, note),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['submissions', 'fortresses'] }),
  })

  if (isLoading) return <p>{t('loading')}</p>

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-bold">{t('admin.submissions')}</h3>
      {data.map((submission) => (
        <article id={`submission-${submission.id}`} key={submission.id} className="rounded-xl border border-stone-200 p-4">
          <div className="flex flex-wrap justify-between gap-2">
            <div>
              <h4 className="font-bold">{submission.proposedFortress.name.ru}</h4>
              <p className="text-sm text-stone-500">
                {submission.submittedBy} · {submission.createdAt}
              </p>
            </div>
            <span className="rounded-full bg-stone-100 px-3 py-1 text-xs">{submission.status}</span>
          </div>
          <p className="mt-2 text-sm text-stone-700">{submission.submitterNote}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-full bg-forest px-4 py-1 text-sm text-white"
              onClick={() => update.mutate({ id: submission.id, status: 'accepted' })}
            >
              {t('admin.accept')}
            </button>
            <button
              type="button"
              className="rounded-full bg-stone-200 px-4 py-1 text-sm"
              onClick={() =>
                update.mutate({
                  id: submission.id,
                  status: 'needs-changes',
                  note: 'Please verify coordinates',
                })
              }
            >
              {t('admin.needsChanges')}
            </button>
            <button
              type="button"
              className="rounded-full bg-red-100 px-4 py-1 text-sm text-red-800"
              onClick={() =>
                update.mutate({ id: submission.id, status: 'rejected', note: 'Not enough evidence' })
              }
            >
              {t('admin.reject')}
            </button>
          </div>
          {submission.moderatorNote ? (
            <p className="mt-2 text-sm text-amber-800">{submission.moderatorNote}</p>
          ) : null}
        </article>
      ))}
    </div>
  )
}
