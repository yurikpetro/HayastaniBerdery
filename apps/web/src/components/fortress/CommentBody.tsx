import { parseCommentBody } from '../../lib/commentFormat'

type CommentBodyProps = {
  body: string
}

export function CommentBody({ body }: CommentBodyProps) {
  const parsed = parseCommentBody(body)
  if (parsed) return parsed
  return <p className="whitespace-pre-wrap text-stone-700">{body}</p>
}
