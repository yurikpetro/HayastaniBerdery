export type SelectionRange = { start: number; end: number }

export function applyWrap(
  value: string,
  { start, end }: SelectionRange,
  before: string,
  after: string,
): { value: string; selection: SelectionRange } {
  const selected = value.slice(start, end)
  const next = value.slice(0, start) + before + selected + after + value.slice(end)
  const selStart = start + before.length
  return {
    value: next,
    selection: { start: selStart, end: selStart + selected.length },
  }
}

export function applyQuoteLines(
  value: string,
  { start, end }: SelectionRange,
): { value: string; selection: SelectionRange } {
  const lineStart = value.lastIndexOf('\n', start - 1) + 1
  const lineEndIdx = value.indexOf('\n', end)
  const lineEnd = lineEndIdx === -1 ? value.length : lineEndIdx
  const block = value.slice(lineStart, lineEnd)
  const lines = block.split('\n')
  const allQuoted = lines.every((line) => line.startsWith('> '))
  const transformed = lines
    .map((line) => (allQuoted ? line.replace(/^> /, '') : line ? `> ${line}` : '>'))
    .join('\n')
  const next = value.slice(0, lineStart) + transformed + value.slice(lineEnd)
  return {
    value: next,
    selection: { start: lineStart, end: lineStart + transformed.length },
  }
}

export function insertText(
  value: string,
  { start, end }: SelectionRange,
  insert: string,
): { value: string; selection: SelectionRange } {
  const next = value.slice(0, start) + insert + value.slice(end)
  const pos = start + insert.length
  return { value: next, selection: { start: pos, end: pos } }
}
