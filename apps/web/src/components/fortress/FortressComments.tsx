import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CreateCommentDto, FortressComment, Locale } from '@hayastani/shared'
import { formatLocaleDateTime } from '../../lib/formatDate'
import { api } from '../../api/client'
import { useAuth } from '../../auth/AuthContext'
import { CommentBody } from './CommentBody'
import { CommentComposer } from './CommentComposer'

/** Depths 0–2 visible without «Expand»; deeper levels open one step at a time */
const AUTO_VISIBLE_MAX_PARENT_DEPTH = 1
const MAX_COMMENT_DEPTH = 9
const MAX_INDENT_PX = 96

type CommentNode = FortressComment & { children: CommentNode[] }

function buildCommentTree(comments: FortressComment[]): CommentNode[] {
  const nodes = new Map<string, CommentNode>()

  for (const comment of comments) {
    nodes.set(comment.id, { ...comment, children: [] })
  }

  const roots: CommentNode[] = []

  for (const comment of comments) {
    const node = nodes.get(comment.id)!
    if (comment.parentId) {
      nodes.get(comment.parentId)?.children.push(node)
    } else {
      roots.push(node)
    }
  }

  const sortChildren = (list: CommentNode[]) => {
    list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    for (const node of list) sortChildren(node.children)
  }

  roots.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  sortChildren(roots)

  return roots
}

function countSubtree(node: CommentNode): number {
  return node.children.reduce((sum, child) => sum + 1 + countSubtree(child), 0)
}

function childrenAreVisible(parentDepth: number, expandedIds: Set<string>, parentId: string) {
  return parentDepth <= AUTO_VISIBLE_MAX_PARENT_DEPTH || expandedIds.has(parentId)
}

type FortressCommentsProps = {
  fortressId: string
}

export function FortressComments({ fortressId }: FortressCommentsProps) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [draft, setDraft] = useState('')
  const [replyTo, setReplyTo] = useState<FortressComment | null>(null)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set())

  const commentsQuery = useQuery({
    queryKey: ['comments', fortressId],
    queryFn: () => api.comments.list(fortressId),
    enabled: Boolean(fortressId),
  })

  const tree = useMemo(() => buildCommentTree(commentsQuery.data ?? []), [commentsQuery.data])

  const expandBranch = useCallback((commentId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      next.add(commentId)
      return next
    })
  }, [])

  const addComment = useMutation({
    mutationFn: (dto: CreateCommentDto) => api.comments.create(fortressId, dto),
    onSuccess: (_data, variables) => {
      setDraft('')
      if (variables.parentId) {
        expandBranch(variables.parentId)
        let currentId: string | undefined = variables.parentId
        const all = commentsQuery.data ?? []
        while (currentId) {
          expandBranch(currentId)
          const parent = all.find((c) => c.id === currentId)
          currentId = parent?.parentId ?? undefined
        }
      }
      setReplyTo(null)
      void queryClient.invalidateQueries({ queryKey: ['comments', fortressId] })
    },
  })

  const submit = (parentId?: string) => {
    const body = draft.trim()
    if (!body) return
    addComment.mutate({ body, parentId })
  }

  const replyForm = (parent: FortressComment) => (
    <div className="mt-3 space-y-2 border-l-2 border-terracotta/40 pl-4">
      <p className="text-xs text-stone-600">
        {t('fortressPage.replyingTo')}{' '}
        <span className="font-semibold text-stone-800">{parent.author}</span>
      </p>
      <CommentComposer
        value={draft}
        onChange={setDraft}
        placeholder={t('fortressPage.replyPlaceholder')}
        rows={2}
        autoFocus
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!draft.trim() || addComment.isPending}
          onClick={() => submit(parent.id)}
          className="rounded-full bg-terracotta px-4 py-1.5 text-sm font-medium text-white transition hover:bg-terracotta-dark disabled:opacity-50"
        >
          {t('fortressPage.postReply')}
        </button>
        <button
          type="button"
          onClick={() => {
            setReplyTo(null)
            setDraft('')
          }}
          className="rounded-full border border-stone-300 px-4 py-1.5 text-sm text-stone-700 hover:bg-stone-100"
        >
          {t('fortressPage.cancelReply')}
        </button>
      </div>
    </div>
  )

  const renderNode = (node: CommentNode, depth: number) => {
    const indent = Math.min(depth * 16, MAX_INDENT_PX)
    const showChildren = childrenAreVisible(depth, expandedIds, node.id)
    const hiddenCount = !showChildren && node.children.length > 0 ? countSubtree(node) : 0
    const canReply = user && depth < MAX_COMMENT_DEPTH

    return (
      <div key={node.id} className="space-y-3" style={{ marginLeft: depth > 0 ? indent : 0 }}>
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <strong className="text-stone-900">{node.author}</strong>
            <time className="text-xs text-stone-500" dateTime={node.createdAt}>
              {formatLocaleDateTime(node.createdAt, locale)}
            </time>
          </div>
          <div className="mt-2">
            <CommentBody body={node.body} />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {canReply ? (
              <button
                type="button"
                onClick={() => {
                  setReplyTo(node)
                  setDraft('')
                }}
                className="text-sm font-medium text-terracotta hover:underline"
              >
                {t('fortressPage.reply')}
              </button>
            ) : null}
            {hiddenCount > 0 ? (
              <button
                type="button"
                onClick={() => expandBranch(node.id)}
                className="text-sm font-medium text-stone-700 underline-offset-2 hover:text-terracotta hover:underline"
              >
                {t('fortressPage.expandReplies', { count: hiddenCount })}
              </button>
            ) : null}
          </div>
          {replyTo?.id === node.id ? replyForm(node) : null}
        </div>

        {showChildren ? node.children.map((child) => renderNode(child, depth + 1)) : null}
      </div>
    )
  }

  return (
    <>
      <h2 className="font-display text-2xl font-bold text-stone-900">{t('comments')}</h2>
      <div className="mt-4 space-y-4">
        {tree.length ? (
          tree.map((root) => renderNode(root, 0))
        ) : (
          <p className="text-sm text-stone-600">{t('fortressPage.noComments')}</p>
        )}
      </div>

      {user ? (
        replyTo ? null : (
          <form
            className="mt-4 flex flex-col gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              submit()
            }}
          >
            <CommentComposer
              value={draft}
              onChange={setDraft}
              placeholder={t('fortressPage.commentPlaceholder')}
              rows={3}
            />
            <button
              type="submit"
              disabled={!draft.trim() || addComment.isPending}
              className="self-start rounded-full bg-terracotta px-5 py-2 font-medium text-white transition hover:bg-terracotta-dark disabled:opacity-50"
            >
              {t('fortressPage.postComment')}
            </button>
          </form>
        )
      ) : (
        <p className="mt-4 text-sm text-stone-700">
          <Link to="/login" className="font-medium text-terracotta hover:underline">
            {t('nav.login')}
          </Link>{' '}
          {t('fortressPage.loginToComment')}
        </p>
      )}
    </>
  )
}
