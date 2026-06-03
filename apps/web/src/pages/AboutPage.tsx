import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

export function AboutPage() {
  const { t } = useTranslation()
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-white/60 bg-white/85 shadow-xl shadow-stone-900/10 backdrop-blur-md">
        <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="p-8 sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-terracotta">
              {t('about.eyebrow')}
            </p>
            <h2 className="mt-3 max-w-2xl text-4xl font-bold leading-tight text-stone-900">
              {t('about.title')}
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-700">
              {t('about.intro')}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/"
                className="rounded-full bg-terracotta px-5 py-2.5 font-medium text-white transition hover:bg-terracotta/90"
              >
                {t('about.mapCta')}
              </Link>
              <Link
                to="/submit"
                className="rounded-full border border-stone-300 bg-white/90 px-5 py-2.5 font-medium text-stone-900 transition hover:bg-white"
              >
                {t('about.submitCta')}
              </Link>
            </div>
          </div>

          <div className="bg-stone-900/90 p-8 text-stone-100 backdrop-blur-md sm:p-10">
            <p className="text-sm uppercase tracking-[0.2em] text-terracotta">
              {t('brand')}
            </p>
            <p className="mt-6 text-2xl font-semibold leading-snug">
              {t('tagline')}
            </p>
            <div className="mt-8 h-px bg-white/15" />
            <p className="mt-6 leading-7 text-stone-300">{t('about.sideNote')}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ['about.cardMapTitle', 'about.cardMapText'],
          ['about.cardSourcesTitle', 'about.cardSourcesText'],
          ['about.cardCommunityTitle', 'about.cardCommunityText'],
        ].map(([titleKey, textKey]) => (
          <article
            key={titleKey}
            className="rounded-2xl border border-white/60 bg-white/85 p-6 shadow-lg shadow-stone-900/10 backdrop-blur-md"
          >
            <h3 className="text-xl font-bold text-stone-900">{t(titleKey)}</h3>
            <p className="mt-3 leading-7 text-stone-600">{t(textKey)}</p>
          </article>
        ))}
      </section>
    </div>
  )
}
