import { useTranslation } from 'react-i18next'

export function RulesPage() {
  const { t } = useTranslation()
  const rules = [
    ['rules.evidenceTitle', 'rules.evidenceText'],
    ['rules.sourcesTitle', 'rules.sourcesText'],
    ['rules.testimonyTitle', 'rules.testimonyText'],
    ['rules.coordinatesTitle', 'rules.coordinatesText'],
    ['rules.reviewTitle', 'rules.reviewText'],
    ['rules.photosTitle', 'rules.photosText'],
  ]

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/60 bg-white/85 p-8 shadow-xl shadow-stone-900/10 backdrop-blur-md sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-terracotta">
          {t('rules.eyebrow')}
        </p>
        <h2 className="mt-3 max-w-3xl text-4xl font-bold leading-tight text-stone-900">
          {t('rules.title')}
        </h2>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-stone-700">
          {t('rules.intro')}
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {rules.map(([titleKey, textKey], index) => (
          <article
            key={titleKey}
            className="rounded-2xl border border-white/60 bg-white/85 p-6 shadow-lg shadow-stone-900/10 backdrop-blur-md"
          >
            <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-terracotta/10 text-sm font-bold text-terracotta">
              {index + 1}
            </div>
            <h3 className="text-xl font-bold text-stone-900">{t(titleKey)}</h3>
            <p className="mt-3 leading-7 text-stone-600">{t(textKey)}</p>
          </article>
        ))}
      </section>

      <aside className="rounded-2xl border border-terracotta/30 bg-white/80 p-6 text-stone-800 shadow-lg shadow-stone-900/10 backdrop-blur-md">
        <h3 className="text-xl font-bold text-stone-900">{t('rules.safetyTitle')}</h3>
        <p className="mt-3 leading-7">{t('rules.safetyText')}</p>
      </aside>
    </div>
  )
}
