import type { Locale } from '@hayastani/shared'

const intlLocaleByAppLocale: Record<Locale, string> = {
  hy: 'hy-AM',
  ru: 'ru-RU',
  en: 'en-US',
}

export function formatLocaleDateTime(iso: string, locale: Locale): string {
  try {
    return new Intl.DateTimeFormat(intlLocaleByAppLocale[locale] ?? locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso))
  } catch {
    return iso.slice(0, 10)
  }
}
