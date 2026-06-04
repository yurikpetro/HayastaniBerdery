const TWEMOJI_CDN = 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72'

/** Regional-indicator flags and generic flag emojis (Windows shows these as letters). */
const FLAG_EMOJI_RE =
  /[\u{1F1E6}-\u{1F1FF}]{2}|\u{1F3F3}\uFE0F?|\u{1F3F4}\uFE0F?/gu

const SINGLE_FLAG_EMOJI_RE =
  /^[\u{1F1E6}-\u{1F1FF}]{2}$|^\u{1F3F3}\uFE0F?$|^\u{1F3F4}\uFE0F?$/u

export function isFlagEmoji(emoji: string): boolean {
  return SINGLE_FLAG_EMOJI_RE.test(emoji)
}

export function emojiToTwemojiSrc(emoji: string): string {
  const hex = [...emoji]
    .map((char) => char.codePointAt(0)!)
    .filter((cp) => cp !== 0xfe0f)
    .map((cp) => cp.toString(16))
    .join('-')
  return `${TWEMOJI_CDN}/${hex}.png`
}

export function splitTextWithFlagEmojis(text: string): { type: 'text' | 'flag'; value: string }[] {
  const parts: { type: 'text' | 'flag'; value: string }[] = []
  let last = 0
  FLAG_EMOJI_RE.lastIndex = 0

  for (const match of text.matchAll(FLAG_EMOJI_RE)) {
    const index = match.index ?? 0
    if (index > last) parts.push({ type: 'text', value: text.slice(last, index) })
    parts.push({ type: 'flag', value: match[0] })
    last = index + match[0].length
  }

  if (last < text.length) parts.push({ type: 'text', value: text.slice(last) })
  if (!parts.length) parts.push({ type: 'text', value: text })
  return parts
}
