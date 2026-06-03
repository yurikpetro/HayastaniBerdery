import type { LocalizedText } from '@hayastani/shared'

/** Приблизительные границы Арцаха для показа оверлея подписей */
export const ARTSAKH_BOUNDS = {
  south: 39.1,
  west: 45.4,
  north: 40.35,
  east: 47.8,
} as const

export type ArtsakhToponymRank = 'city' | 'town' | 'village'

export interface ArtsakhToponym {
  id: string
  lat: number
  lng: number
  name: LocalizedText
  rank: ArtsakhToponymRank
}

/** Населённые пункты: армянские названия (OSM name:hy / общепринятые формы) */
export const artsakhToponyms: ArtsakhToponym[] = [
  {
    id: 'stepanakert',
    lat: 39.8267,
    lng: 46.7528,
    rank: 'city',
    name: { hy: 'Ստեփանակերտ', ru: 'Степанакерт', en: 'Stepanakert' },
  },
  {
    id: 'shushi',
    lat: 39.76,
    lng: 46.7454,
    rank: 'city',
    name: { hy: 'Շուշի', ru: 'Шуши', en: 'Shushi' },
  },
  {
    id: 'martakert',
    lat: 40.2116,
    lng: 46.818,
    rank: 'town',
    name: { hy: 'Մարտակերտ', ru: 'Мартакерт', en: 'Martakert' },
  },
  {
    id: 'martuni',
    lat: 39.7914,
    lng: 47.1064,
    rank: 'town',
    name: { hy: 'Մարտունի', ru: 'Мартуни', en: 'Martuni' },
  },
  {
    id: 'askeran',
    lat: 39.9364,
    lng: 46.8316,
    rank: 'town',
    name: { hy: 'Ասկերան', ru: 'Аскеран', en: 'Askeran' },
  },
  {
    id: 'hadrut',
    lat: 39.57,
    lng: 47.03,
    rank: 'town',
    name: { hy: 'Հադրուտ', ru: 'Адраберд', en: 'Hadrut' },
  },
  {
    id: 'berdzor',
    lat: 39.6422,
    lng: 46.3264,
    rank: 'town',
    name: { hy: 'Բերձոր', ru: 'Бердзор', en: 'Berdzor' },
  },
  {
    id: 'kashatagh',
    lat: 40.2064,
    lng: 46.4194,
    rank: 'town',
    name: { hy: 'Քաշաթաղ', ru: 'Кашатах', en: 'Kashatagh' },
  },
  {
    id: 'shahumyan',
    lat: 39.4286,
    lng: 46.7992,
    rank: 'town',
    name: { hy: 'Շահումյան', ru: 'Шаумян', en: 'Shahumyan' },
  },
  {
    id: 'mardakert-mdq',
    lat: 39.7011,
    lng: 46.9786,
    rank: 'village',
    name: { hy: 'Մդկունք', ru: 'Мдкунь', en: 'Mdkunq' },
  },
  {
    id: 'aghdzaberd',
    lat: 39.7778,
    lng: 46.5833,
    rank: 'village',
    name: { hy: 'Աղձաբերդ', ru: 'Агджаберд', en: 'Aghdzaberd' },
  },
  {
    id: 'noragyugh',
    lat: 39.8333,
    lng: 46.7167,
    rank: 'village',
    name: { hy: 'Նորագյուղ', ru: 'Норагюх', en: 'Noragyugh' },
  },
  {
    id: 'karvachar',
    lat: 40.2167,
    lng: 46.4167,
    rank: 'town',
    name: { hy: 'Քարվաճար', ru: 'Карвачар', en: 'Karvachar' },
  },
  {
    id: 'vank',
    lat: 40.0667,
    lng: 46.55,
    rank: 'village',
    name: { hy: 'Վանք', ru: 'Ванк', en: 'Vank' },
  },
  {
    id: 'kolatak',
    lat: 40.05,
    lng: 46.6833,
    rank: 'village',
    name: { hy: 'Քոլատակ', ru: 'Колатак', en: 'Kolatak' },
  },
  {
    id: 'taghavard',
    lat: 39.8833,
    lng: 47.0167,
    rank: 'village',
    name: { hy: 'Տաղավարդ', ru: 'Тагавард', en: 'Taghavard' },
  },
  {
    id: 'karmir-shen',
    lat: 39.85,
    lng: 46.9333,
    rank: 'village',
    name: { hy: 'Կարմիր Շեն', ru: 'Кармир Шен', en: 'Karmir Shen' },
  },
  {
    id: 'benazdor',
    lat: 39.7167,
    lng: 46.85,
    rank: 'village',
    name: { hy: 'Բենաձոր', ru: 'Беназдор', en: 'Benazdor' },
  },
  {
    id: 'chartar',
    lat: 39.8,
    lng: 47.05,
    rank: 'village',
    name: { hy: 'Չարոտան', ru: 'Чаротан', en: 'Chartar' },
  },
  {
    id: 'karmir-shuka',
    lat: 39.7833,
    lng: 47.0833,
    rank: 'village',
    name: { hy: 'Կարմիր Շուկա', ru: 'Кармир Шука', en: 'Karmir Shuka' },
  },
  {
    id: 'avan',
    lat: 39.8167,
    lng: 46.7833,
    rank: 'village',
    name: { hy: 'Ավան', ru: 'Аван', en: 'Avan' },
  },
  {
    id: 'paris-her',
    lat: 39.8667,
    lng: 46.7667,
    rank: 'village',
    name: { hy: 'Փարիս Հեր', ru: 'Парис Ер', en: 'Paris Her' },
  },
  {
    id: 'khachen',
    lat: 39.95,
    lng: 46.7,
    rank: 'village',
    name: { hy: 'Խաչեն', ru: 'Хачен', en: 'Khachen' },
  },
  {
    id: 'myurishen',
    lat: 39.9,
    lng: 46.8667,
    rank: 'village',
    name: { hy: 'Մյուրիշեն', ru: 'Мюришен', en: 'Myurishen' },
  },
  {
    id: 'noragyugh-hadrut',
    lat: 39.55,
    lng: 47.1,
    rank: 'village',
    name: { hy: 'Նորագյուղ', ru: 'Норагюх', en: 'Noragyugh' },
  },
  {
    id: 'tumi',
    lat: 39.6333,
    lng: 46.5167,
    rank: 'village',
    name: { hy: 'Թումի', ru: 'Туми', en: 'Tumi' },
  },
  {
    id: 'sarishen',
    lat: 39.6167,
    lng: 46.45,
    rank: 'village',
    name: { hy: 'Սարիշեն', ru: 'Саришен', en: 'Sarishen' },
  },
  {
    id: 'loravan',
    lat: 39.6833,
    lng: 46.3667,
    rank: 'village',
    name: { hy: 'Լորավան', ru: 'Лорован', en: 'Loravan' },
  },
  {
    id: 'aghavno',
    lat: 39.6167,
    lng: 46.2833,
    rank: 'village',
    name: { hy: 'Աղավնո', ru: 'Агавно', en: 'Aghavno' },
  },
  {
    id: 'akna',
    lat: 40.2347,
    lng: 46.2522,
    rank: 'town',
    name: { hy: 'Ակնա', ru: 'Акна', en: 'Akna' },
  },
  {
    id: 'nor-shen',
    lat: 39.7333,
    lng: 47.15,
    rank: 'village',
    name: { hy: 'Նոր Շեն', ru: 'Нор Шен', en: 'Nor Shen' },
  },
  {
    id: 'jraghatsner',
    lat: 39.7667,
    lng: 47.1333,
    rank: 'village',
    name: { hy: 'Ջրաղացներ', ru: 'Джрагацнер', en: 'Jraghatsner' },
  },
  {
    id: 'khnushinak',
    lat: 39.8167,
    lng: 47.2,
    rank: 'village',
    name: { hy: 'Խնուշինակ', ru: 'Хнушинак', en: 'Khnushinak' },
  },
  {
    id: 'azokh',
    lat: 39.5167,
    lng: 47.05,
    rank: 'village',
    name: { hy: 'Ածոխ', ru: 'Азох', en: 'Azokh' },
  },
  {
    id: 'togh',
    lat: 39.4833,
    lng: 47.0833,
    rank: 'village',
    name: { hy: 'Տող', ru: 'Тог', en: 'Togh' },
  },
]

export function minZoomForRank(rank: ArtsakhToponymRank): number {
  if (rank === 'city') return 7
  if (rank === 'town') return 9
  return 11
}

export function mapIntersectsArtsakh(bounds: {
  getSouth(): number
  getWest(): number
  getNorth(): number
  getEast(): number
}): boolean {
  return !(
    bounds.getNorth() < ARTSAKH_BOUNDS.south ||
    bounds.getSouth() > ARTSAKH_BOUNDS.north ||
    bounds.getEast() < ARTSAKH_BOUNDS.west ||
    bounds.getWest() > ARTSAKH_BOUNDS.east
  )
}
