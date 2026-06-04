import type { ReactNode } from 'react'

type InlineMark = 'bold' | 'italic' | 'underline'

const INLINE_MARKERS: { open: string; close: string; mark: InlineMark }[] = [
  { open: '**', close: '**', mark: 'bold' },
  { open: '__', close: '__', mark: 'underline' },
  { open: '*', close: '*', mark: 'italic' },
]

function wrapInline(mark: InlineMark, children: ReactNode, key: string): ReactNode {
  switch (mark) {
    case 'bold':
      return (
        <strong key={key} className="font-semibold text-stone-900">
          {children}
        </strong>
      )
    case 'italic':
      return (
        <em key={key} className="italic">
          {children}
        </em>
      )
    case 'underline':
      return (
        <span key={key} className="underline decoration-stone-500 underline-offset-2">
          {children}
        </span>
      )
  }
}

function parseInline(text: string, keyPrefix: string): ReactNode[] {
  if (!text) return []

  let earliest = text.length
  let marker: (typeof INLINE_MARKERS)[number] | null = null

  for (const candidate of INLINE_MARKERS) {
    const idx = text.indexOf(candidate.open)
    if (idx >= 0 && idx < earliest) {
      earliest = idx
      marker = candidate
    }
  }

  if (!marker) return [text]

  const before = text.slice(0, earliest)
  const rest = text.slice(earliest + marker.open.length)
  const closeIdx = rest.indexOf(marker.close)

  if (closeIdx < 0) return [text]

  const inner = rest.slice(0, closeIdx)
  const after = rest.slice(closeIdx + marker.close.length)
  const key = `${keyPrefix}-${earliest}`

  return [
    ...(before ? parseInline(before, `${key}-b`) : []),
    wrapInline(marker.mark, parseInline(inner, `${key}-i`), key),
    ...parseInline(after, `${key}-a`),
  ]
}

type Block = { type: 'paragraph'; text: string } | { type: 'quote'; text: string }

function splitBlocks(body: string): Block[] {
  const lines = body.split('\n')
  const blocks: Block[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    const isQuote = line.startsWith('> ') || line === '>'

    if (isQuote) {
      const quoteLines: string[] = []
      while (i < lines.length) {
        const current = lines[i]
        if (current.startsWith('> ')) {
          quoteLines.push(current.slice(2))
          i += 1
        } else if (current === '>') {
          quoteLines.push('')
          i += 1
        } else break
      }
      blocks.push({ type: 'quote', text: quoteLines.join('\n') })
      continue
    }

    const paraLines: string[] = []
    while (i < lines.length) {
      const current = lines[i]
      if (current.startsWith('> ') || current === '>') break
      paraLines.push(current)
      i += 1
    }
    blocks.push({ type: 'paragraph', text: paraLines.join('\n') })
  }

  return blocks
}

export function parseCommentBody(body: string): ReactNode {
  const blocks = splitBlocks(body)

  if (!blocks.length) return null

  return (
    <div className="comment-body space-y-2">
      {blocks.map((block, index) => {
        const content = parseInline(block.text, `b${index}`)
        if (block.type === 'quote') {
          return (
            <blockquote
              key={index}
              className="border-l-4 border-terracotta/50 bg-stone-100/80 py-2 pl-4 pr-2 text-stone-600 italic"
            >
              <div className="whitespace-pre-wrap not-italic text-stone-700">{content}</div>
            </blockquote>
          )
        }
        return (
          <p key={index} className="whitespace-pre-wrap text-stone-700">
            {content}
          </p>
        )
      })}
    </div>
  )
}
