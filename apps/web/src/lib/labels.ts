import type {
  AccessibilityLevel,
  CoordinateAccuracy,
  EvidenceLevel,
  FortressCondition,
  FortressType,
  GeographicScope,
  HistoricalPeriod,
  Locale,
  LocalizedText,
} from '@hayastani/shared'

export const scopeLabels: Record<GeographicScope, LocalizedText> = {
  'republic-of-armenia': {
    hy: 'Հայաստանի Հանրապետություն',
    ru: 'Республика Армения',
    en: 'Republic of Armenia',
  },
  artsakh: { hy: 'Արցախ', ru: 'Арцах', en: 'Artsakh' },
  'historical-armenia': {
    hy: 'Արևմտյան Հայաստան',
    ru: 'Западная Армения',
    en: 'Western Armenia',
  },
}

export const evidenceLabels: Record<EvidenceLevel, LocalizedText> = {
  verified: { hy: 'հաստատված', ru: 'подтверждено', en: 'verified' },
  'partially-verified': { hy: 'մասամբ', ru: 'частично', en: 'partial' },
  oral: { hy: 'բանավոր', ru: 'устно', en: 'oral' },
  'needs-research': { hy: 'ուսումնասիրություն', ru: 'исследование', en: 'research' },
}

export const accuracyLabels: Record<CoordinateAccuracy, LocalizedText> = {
  exact: { hy: 'ճշգրիտ', ru: 'точные', en: 'exact' },
  approximate: { hy: 'մոտավոր', ru: 'приблизительные', en: 'approximate' },
  unverified: { hy: 'չստուգված', ru: 'не проверены', en: 'unverified' },
}

export const conditionLabels: Record<FortressCondition, LocalizedText> = {
  preserved: { hy: 'պահպանված', ru: 'сохранилась', en: 'preserved' },
  ruins: { hy: 'ավերակներ', ru: 'руины', en: 'ruins' },
  fragments: { hy: 'հատվածներ', ru: 'фрагменты', en: 'fragments' },
  'poorly-studied': { hy: 'քիչ ուսումնասիրված', ru: 'малоизучена', en: 'poorly studied' },
  inaccessible: { hy: 'անմատչելի', ru: 'недоступна', en: 'inaccessible' },
}

export const periodLabels: Record<HistoricalPeriod, LocalizedText> = {
  'bronze-age': { hy: 'Բրոնզի դար', ru: 'Бронзовый век', en: 'Bronze Age' },
  urartian: { hy: 'Ուրարտու', ru: 'Урартский', en: 'Urartian' },
  antique: { hy: 'Անտիկ', ru: 'Античность', en: 'Antique' },
  'early-medieval': { hy: 'Վաղ միջնադար', ru: 'Раннее Средневековье', en: 'Early medieval' },
  medieval: { hy: 'Միջնադար', ru: 'Средневековье', en: 'Medieval' },
  'late-medieval': { hy: 'Ուշ միջնադար', ru: 'Позднее Средневековье', en: 'Late medieval' },
  unknown: { hy: 'Անհայտ', ru: 'Неизвестно', en: 'Unknown' },
}

/** Periods shown in catalog filters (excludes eras with no fortress entries). */
export const catalogPeriodFilters = (Object.keys(periodLabels) as HistoricalPeriod[]).filter(
  (period) => period !== 'bronze-age',
)

export const typeLabels: Record<FortressType, LocalizedText> = {
  fortress: { hy: 'Բերդ', ru: 'Крепость', en: 'Fortress' },
  'fortified-settlement': {
    hy: 'Ամրացված բնակավայր',
    ru: 'Укреплённое поселение',
    en: 'Fortified settlement',
  },
  citadel: { hy: 'Միջնաբերդ', ru: 'Цитадель', en: 'Citadel' },
  tower: { hy: 'Աշտարակ', ru: 'Башня', en: 'Tower' },
  'fortified-monastery': {
    hy: 'Ամրացված վանք',
    ru: 'Укреплённый монастырь',
    en: 'Fortified monastery',
  },
  'defensive-wall': {
    hy: 'Պաշտպանական պարիսպ',
    ru: 'Оборонительная стена',
    en: 'Defensive wall',
  },
}

export const accessibilityLabels: Record<AccessibilityLevel, LocalizedText> = {
  easy: { hy: 'հեշտ', ru: 'легко', en: 'easy' },
  moderate: { hy: 'միջին', ru: 'средне', en: 'moderate' },
  hard: { hy: 'բարդ', ru: 'сложно', en: 'hard' },
  'guide-required': { hy: 'ուղեկցորդ', ru: 'проводник', en: 'guide' },
}

export function localized(text: LocalizedText, locale: Locale) {
  return text[locale] || text.ru || text.en || text.hy
}

export function primaryPhoto(fortress: { photos: { url: string; isPrimary?: boolean }[] }) {
  return fortress.photos.find((p) => p.isPrimary) ?? fortress.photos[0]
}
