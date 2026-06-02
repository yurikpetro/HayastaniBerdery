import { useTranslation } from 'react-i18next'

export function AboutPage() {
  const { t } = useTranslation()
  return (
    <article className="prose max-w-3xl rounded-2xl border border-stone-200 bg-white p-8 shadow-sm prose-stone">
      <h2>{t('nav.about')}</h2>
      <p>{t('tagline')}</p>
      <p>
        Hayastani Berdry is a public registry of Armenian fortresses — from well-known sites to
        places known mainly to local villagers. The project documents coordinates, historical
        context, photos, and sources, including materials by traveler Harutyun Hakobyan.
      </p>
    </article>
  )
}
