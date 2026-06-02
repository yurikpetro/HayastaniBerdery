import type { Fortress } from '@hayastani/shared'

const names = [
  { hy: 'Բերդ Կոտայք', ru: 'Крепость Котайк', en: 'Kotayk Fort' },
  { hy: 'Բերդ Լոռի', ru: 'Крепость Лори', en: 'Lori Fort' },
  { hy: 'Բերդ Սյունիք', ru: 'Крепость Сюник', en: 'Syunik Fort' },
  { hy: 'Բերդ Վայոց Ձոր', ru: 'Крепость Вайоц Дзор', en: 'Vayots Dzor Fort' },
  { hy: 'Բերդ Շիրակ', ru: 'Крепость Ширак', en: 'Shirak Fort' },
  { hy: 'Բերդ Գեղարքունիք', ru: 'Крепость Гехаркуник', en: 'Gegharkunik Fort' },
  { hy: 'Բերդ Արագածոտն', ru: 'Крепость Арагацотн', en: 'Aragatsotn Fort' },
  { hy: 'Բերդ Տավուշ', ru: 'Крепость Тавуш', en: 'Tavush Fort' },
  { hy: 'Բերդ Արմավիր', ru: 'Крепость Армавир', en: 'Armavir Fort' },
  { hy: 'Բերդ Արարատ', ru: 'Крепость Арарат', en: 'Ararat Fort' },
]

const scopes = [
  'republic-of-armenia',
  'republic-of-armenia',
  'republic-of-armenia',
  'historical-armenia',
  'artsakh',
] as const

export function generateExtendedFortresses(): Fortress[] {
  return Array.from({ length: 30 }, (_, index) => {
    const name = names[index % names.length]
    const slug = `fortress-${index + 1}`
    const lat = 39.5 + (index % 10) * 0.12
    const lng = 43.8 + (index % 8) * 0.15
    return {
      id: slug,
      slug,
      name: {
        hy: `${name.hy} ${index + 1}`,
        ru: `${name.ru} ${index + 1}`,
        en: `${name.en} ${index + 1}`,
      },
      alternativeNames: [`Local name ${index + 1}`],
      scope: scopes[index % scopes.length],
      coordinates: { lat, lng },
      coordinateAccuracy: index % 3 === 0 ? 'exact' : index % 3 === 1 ? 'approximate' : 'unverified',
      marz: { hy: 'Մարզ', ru: 'Марз', en: 'Marz' },
      nearestSettlement: { hy: 'Գյուղ', ru: 'Село', en: 'Village' },
      summary: {
        hy: 'Լրացուցիչ բերդ ռեեստրի համար',
        ru: 'Дополнительная крепость для наполнения реестра',
        en: 'Additional fortress for registry content',
      },
      history: {
        hy: 'Պահանջում է լրացուցիչ ուսումնասիրություն',
        ru: 'Требует дополнительного исследования',
        en: 'Requires additional research',
      },
      foundation: 'Medieval (unverified)',
      period: 'medieval',
      condition: index % 2 === 0 ? 'ruins' : 'poorly-studied',
      type: 'fortress',
      accessibility: index % 4 === 0 ? 'easy' : 'moderate',
      routeHint: {
        hy: 'Տեղական ճանապարհ',
        ru: 'Местная дорога',
        en: 'Local road',
      },
      evidenceLevel: index % 5 === 0 ? 'verified' : 'needs-research',
      features: [],
      warnings: [],
      relatedPlaces: [],
      photos: [
        {
          id: `${slug}-photo`,
          url: `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80&sig=${index}`,
          author: 'Archive',
          caption: { hy: name.hy, ru: name.ru, en: name.en },
          isPrimary: true,
          status: 'published',
        },
      ],
      sources: [],
      status: 'published',
      updatedAt: '2026-06-01',
    }
  })
}
