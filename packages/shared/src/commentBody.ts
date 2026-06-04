export const MAX_COMMENT_BODY_LENGTH = 4000

/** Strip HTML tags; trim and cap length for stored comment text */
export function sanitizeCommentBody(body: string): string {
  return body.replace(/<[^>]*>/g, '').trim().slice(0, MAX_COMMENT_BODY_LENGTH)
}
