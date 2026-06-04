import type { Fortress, HistoricalPeriod } from '@hayastani/shared'

export interface YearRange {
  from: number
  to: number
}

export const MAP_TIMELINE_DOMAIN: YearRange = {
  from: -2000,
  to: 1900,
}

const periodRanges: Record<HistoricalPeriod, YearRange | null> = {
  'bronze-age': { from: MAP_TIMELINE_DOMAIN.from, to: -1200 },
  urartian: { from: MAP_TIMELINE_DOMAIN.from, to: -600 },
  antique: { from: -600, to: 400 },
  'early-medieval': { from: 301, to: 700 },
  medieval: { from: 401, to: 1499 },
  'late-medieval': { from: 1300, to: 1700 },
  unknown: null,
}

const romanValues: Record<string, number> = {
  i: 1,
  v: 5,
  x: 10,
  l: 50,
  c: 100,
  d: 500,
  m: 1000,
}

function romanToNumber(value: string) {
  let total = 0
  let previous = 0

  for (const char of value.toLowerCase().split('').reverse()) {
    const current = romanValues[char] ?? 0
    total += current < previous ? -current : current
    previous = Math.max(previous, current)
  }

  return total || null
}

function parseCentury(value: string) {
  if (/^\d+$/.test(value)) return Number(value)
  return romanToNumber(value)
}

function centuryToYearRange(century: number, isBce: boolean): YearRange {
  if (isBce) {
    return {
      from: -century * 100,
      to: -(century - 1) * 100 - 1,
    }
  }

  return {
    from: (century - 1) * 100 + 1,
    to: century * 100,
  }
}

export function getFortressYearRange(fortress: Fortress): YearRange | null {
  const foundation = fortress.foundation.toLowerCase()
  const bceYearMatch = foundation.match(/\b(\d{3,4})(?:\s*(?:-|–|—|to)\s*(\d{3,4}))?\s*(?:bc|bce)\b/)

  if (bceYearMatch?.[1]) {
    const firstYear = Number(bceYearMatch[1])
    const secondYear = Number(bceYearMatch[2] ?? bceYearMatch[1])
    return {
      from: -Math.max(firstYear, secondYear),
      to: -Math.min(firstYear, secondYear),
    }
  }

  const centuryMatch = foundation.match(
    /\b([ivxlcdm]+|\d+)(?:st|nd|rd|th)?(?:\s*(?:-|–|—|to)\s*([ivxlcdm]+|\d+)(?:st|nd|rd|th)?)?\s*centur(?:y|ies)(?:\s*(bc|bce|ad|ce))?/,
  )

  if (centuryMatch?.[1]) {
    const fromCentury = parseCentury(centuryMatch[1])
    const toCentury = parseCentury(centuryMatch[2] ?? centuryMatch[1])
    if (fromCentury && toCentury) {
      const isBce = centuryMatch[3]?.startsWith('bc') ?? false
      const fromRange = centuryToYearRange(fromCentury, isBce)
      const toRange = centuryToYearRange(toCentury, isBce)
      const from = Math.min(fromRange.from, toRange.from)
      const to = Math.max(fromRange.to, toRange.to)
      return { from, to }
    }
  }

  const years = [...foundation.matchAll(/\b\d{3,4}\b/g)].map((match) => Number(match[0]))
  if (years.length > 0) {
    return {
      from: Math.min(...years),
      to: Math.max(...years),
    }
  }

  return periodRanges[fortress.period]
}

export function getFortressTimelineYear(fortress: Fortress) {
  const range = getFortressYearRange(fortress)
  if (!range || range.to < MAP_TIMELINE_DOMAIN.from || range.from > MAP_TIMELINE_DOMAIN.to) {
    return null
  }

  const from = Math.max(range.from, MAP_TIMELINE_DOMAIN.from)
  const to = Math.min(range.to, MAP_TIMELINE_DOMAIN.to)
  return Math.round((from + to) / 2)
}

export function formatYear(year: number, bceLabel = 'BCE') {
  return year < 0 ? `${Math.abs(year)} ${bceLabel}` : String(year)
}

export function isFullTimelineRange(range: YearRange) {
  return range.from <= MAP_TIMELINE_DOMAIN.from && range.to >= MAP_TIMELINE_DOMAIN.to
}

export function isFortressInYearRange(fortress: Fortress, selectedRange: YearRange) {
  const fortressRange = getFortressYearRange(fortress)
  if (!fortressRange) return isFullTimelineRange(selectedRange)

  return fortressRange.from <= selectedRange.to && fortressRange.to >= selectedRange.from
}
