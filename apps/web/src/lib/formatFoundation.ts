import type { Locale } from '@hayastani/shared'

type L10n = { ru: string; hy: string }

const WORDS: Record<string, L10n> = {
  'Bronze Age–Urartian': { ru: 'Бронзовый век — урартийский период', hy: 'Հղի դար — ուրարտուական շրջան' },
  'Bronze Age': { ru: 'Бронзовый век', hy: 'Հղի դար' },
  Urartian: { ru: 'урартийский период', hy: 'ուրարտուական շրջան' },
  'Iron Age': { ru: 'Железный век', hy: 'Երկաթի դար' },
  Antiquity: { ru: 'Античность', hy: 'Հնագույն շրջան' },
  Medieval: { ru: 'Средневековье', hy: 'Միջնադար' },
  'Early medieval': { ru: 'Раннее Средневековье', hy: 'Վաղ միջնադար' },
  Byzantine: { ru: 'византийский', hy: 'բյուզանդական' },
  rebuild: { ru: 'перестройка', hy: 'վերակառուցում' },
  walls: { ru: 'стены', hy: 'պարիսպներ' },
  keep: { ru: 'донжон', hy: 'ամրաշեն' },
  layers: { ru: 'слои', hy: 'շերտեր' },
  expanded: { ru: 'расширен', hy: 'ընդլայնված' },
  major: { ru: 'крупная', hy: 'խոշոր' },
  core: { ru: 'ядро', hy: 'կորիզ' },
  'and earlier': { ru: 'и ранее', hy: 'և ավելի վաղ' },
  'melik period': { ru: 'период меликов', hy: 'մելիքների շրջան' },
  from: { ru: 'с', hy: '-ից' },
  in: { ru: 'в', hy: 'ում' },
}

function centuryLabelHy(plural: boolean): string {
  return plural ? 'դարեր' : 'դար'
}

function centuryLabelRu(plural: boolean): string {
  return plural ? 'вв.' : 'в.'
}

function bcLabel(locale: Locale): string {
  if (locale === 'ru') return 'до н.э.'
  if (locale === 'hy') return 'մ.թ.ա.'
  return 'BC'
}

function adLabel(locale: Locale): string {
  if (locale === 'ru') return 'н.э.'
  if (locale === 'hy') return 'մ.թ.'
  return 'AD'
}

function approxLabel(locale: Locale): string {
  if (locale === 'ru') return 'ок.'
  if (locale === 'hy') return 'մոտ'
  return 'c.'
}

function replaceWords(text: string, locale: Exclude<Locale, 'en'>): string {
  let result = text
  const entries = Object.entries(WORDS).sort((a, b) => b[0].length - a[0].length)
  for (const [en, l10n] of entries) {
    const re = new RegExp(`\\b${en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
    result = result.replace(re, l10n[locale])
  }
  return result
}

export function formatFoundation(foundation: string, locale: Locale): string {
  if (!foundation || locale === 'en') return foundation

  let text = foundation

  text = text.replace(/\bc\.\s*/gi, `${approxLabel(locale)} `)

  text = text.replace(/\b(\d+)\s*BC\b/gi, (_, year) => `${year} ${bcLabel(locale)}`)
  text = text.replace(/\b(\d+)\s*AD\b/gi, (_, year) => `${year} ${adLabel(locale)}`)

  text = text.replace(
    /\b(\d+)(?:st|nd|rd|th)\s*century\s*BC\b/gi,
    (_, n) => {
      if (locale === 'ru') return `${n}-й в. ${bcLabel(locale)}`
      if (locale === 'hy') return `${n}-րդ դ. ${bcLabel(locale)}`
      return `${n}th century BC`
    },
  )

  text = text.replace(
    /\b(\d+)(?:st|nd|rd|th)\s*century\s*AD\b/gi,
    (_, n) => {
      if (locale === 'ru') return `${n}-й в. ${adLabel(locale)}`
      if (locale === 'hy') return `${n}-րդ դ. ${adLabel(locale)}`
      return `${n}th century AD`
    },
  )

  text = text.replace(
    /\b(\d+)(?:st|nd|rd|th)\s*([-–—])\s*(\d+)(?:st|nd|rd|th)\s*century\s*BC\b/gi,
    (_, a, __, b) => {
      if (locale === 'ru') return `${a}–${b} вв. ${bcLabel(locale)}`
      if (locale === 'hy') return `${a}–${b}-րդ դարեր ${bcLabel(locale)}`
      return `${a}th–${b}th century BC`
    },
  )

  text = text.replace(
    /\b(\d+)(?:st|nd|rd|th)(?:\s*([-–—])\s*(\d+)(?:st|nd|rd|th))?\s*centur(y|ies)\b/gi,
    (match, from, _dash, to, _pluralFlag) => {
      if (to) {
        if (locale === 'ru') return `${from}–${to} ${centuryLabelRu(true)}`
        if (locale === 'hy') return `${from}–${to}-րդ ${centuryLabelHy(true)}`
        return match
      }
      if (locale === 'ru') return `${from}-й век`
      if (locale === 'hy') return `${from}-րդ ${centuryLabelHy(false)}`
      return match
    },
  )

  text = text.replace(
    /\b([IVXLCDM]+)\s*([-–—])\s*([IVXLCDM]+)\s*centur(y|ies)\b/gi,
    (_, from, __, to, pluralFlag) => {
      const plural = pluralFlag?.toLowerCase() === 'ies'
      if (locale === 'ru') return `${from}–${to} ${centuryLabelRu(plural || Boolean(to))}`
      if (locale === 'hy') return `${from}–${to} ${centuryLabelHy(plural || Boolean(to))}`
      return `${from}–${to} ${plural ? 'centuries' : 'century'}`
    },
  )

  text = text.replace(/\b([IVXLCDM]+)\s*century\b/gi, (_, num) => {
    if (locale === 'ru') return `${num} в.`
    if (locale === 'hy') return `${num} դ.`
    return `${num} century`
  })

  text = text.replace(/\b(\d+)(?:st|nd|rd|th)-century\b/gi, (_, n) => {
    if (locale === 'ru') return `${n}-го века`
    if (locale === 'hy') return `${n}-րդ դարի`
    return `${n}th-century`
  })

  text = text.replace(/\bcentury\s*BC\b/gi, () => {
    if (locale === 'ru') return `в. ${bcLabel(locale)}`
    if (locale === 'hy') return `դար ${bcLabel(locale)}`
    return 'century BC'
  })

  text = replaceWords(text, locale as Exclude<Locale, 'en'>)

  return text.replace(/\s{2,}/g, ' ').trim()
}
