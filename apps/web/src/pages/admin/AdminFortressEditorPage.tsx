import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import type { Fortress } from '@hayastani/shared'
import { api } from '../../api/client'
import { FortressForm, createEmptyFortress } from '../../components/admin/FortressForm'
import { useFortress } from '../../hooks/useFortresses'

export function AdminFortressEditorPage({ mode }: { mode: 'create' | 'edit' }) {
  const { t } = useTranslation()
  const { slug = '' } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isCreate = mode === 'create'
  const emptyFortress = useMemo(() => createEmptyFortress(), [])
  const { data, isLoading } = useFortress(isCreate ? '' : slug)
  const [saveMessage, setSaveMessage] = useState<
    { type: 'success' | 'error'; message: string } | null
  >(null)

  const save = useMutation({
    mutationFn: (fortress: Fortress) =>
      isCreate ? api.fortresses.create(fortress) : api.fortresses.update(fortress.id, fortress),
    onMutate: () => {
      setSaveMessage(null)
    },
    onSuccess: (saved) => {
      void queryClient.invalidateQueries({ queryKey: ['fortresses'] })
      void queryClient.invalidateQueries({ queryKey: ['fortress', saved.slug] })
      if (!isCreate && slug && slug !== saved.slug) {
        void queryClient.invalidateQueries({ queryKey: ['fortress', slug] })
      }
      setSaveMessage({ type: 'success', message: t('adminForm.saveSucceeded') })
      navigate(`/admin/fortresses/${saved.slug}/edit`)
    },
    onError: (error) => {
      setSaveMessage({
        type: 'error',
        message: error instanceof Error ? error.message : t('adminForm.saveFailed'),
      })
    },
  })

  if (!isCreate && isLoading) return <p>{t('loading')}</p>
  if (!isCreate && !data) return <p>{t('empty')}</p>

  const initialFortress = isCreate ? emptyFortress : data!

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/admin/fortresses" className="text-sm text-terracotta">
            {t('adminForm.backToList')}
          </Link>
          <h3 className="mt-2 text-2xl font-bold">
            {isCreate ? t('adminForm.createTitle') : t('adminForm.editTitle')}
          </h3>
        </div>
        {!isCreate && data ? (
          <Link
            to={`/fortress/${data.slug}`}
            className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium"
          >
            {t('adminForm.openPublic')}
          </Link>
        ) : null}
      </div>
      {save.error ? (
        <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {save.error instanceof Error ? save.error.message : t('adminForm.saveFailed')}
        </p>
      ) : null}
      <FortressForm
        key={initialFortress.id}
        fortress={initialFortress}
        mode={mode}
        isSaving={save.isPending}
        saveStatus={
          save.isPending
            ? { type: 'loading', message: t('adminForm.saving') }
            : saveMessage ?? undefined
        }
        onSubmit={(fortress) => save.mutate(fortress)}
      />
    </div>
  )
}
