import { useRef } from 'react'
import { CommentFormatToolbar } from './CommentFormatToolbar'

type CommentComposerProps = {
  value: string
  onChange: (value: string) => void
  placeholder: string
  rows?: number
  autoFocus?: boolean
  className?: string
}

export function CommentComposer({
  value,
  onChange,
  placeholder,
  rows = 3,
  autoFocus,
  className = '',
}: CommentComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  return (
    <div className={className}>
      <div className="comment-composer rounded-2xl border border-stone-300/90 bg-white transition-[border-color,box-shadow] focus-within:border-terracotta/50 focus-within:shadow-[0_0_0_3px_rgba(180,83,9,0.12)]">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="block w-full resize-none border-0 bg-transparent px-4 pt-3 pb-1 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-0"
          rows={rows}
          autoFocus={autoFocus}
        />
        <div className="px-2 pb-2">
          <CommentFormatToolbar value={value} onChange={onChange} textareaRef={textareaRef} />
        </div>
      </div>
    </div>
  )
}
