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

/**
 * Населённые пункты Арцаха с координатами из OSM `place` node.
 *
 * Важно: подпись локализуем как армянский топоним в языке интерфейса
 * (Ստեփանակերտ / Степанакерт / Stepanakert), но координату берём строго
 * из OSM, чтобы оверлей не "плавал" относительно базовой карты.
 */
export const artsakhToponyms: ArtsakhToponym[] = [
  {
    id: 'osm-4027452036-stepanakert',
    lat: 39.8182184,
    lng: 46.751063,
    rank: 'city',
    name: { hy: 'Ստեփանակերտ', ru: 'Степанакерт', en: 'Stepanakert' },
  },
  {
    id: 'osm-210333762-shushi',
    lat: 39.7632567,
    lng: 46.7511501,
    rank: 'town',
    name: { hy: 'Շուշի', ru: 'Шуши', en: 'Shushi' },
  },
  {
    id: 'osm-234061921-martakert',
    lat: 40.2096703,
    lng: 46.8225075,
    rank: 'town',
    name: { hy: 'Մարտակերտ', ru: 'Мартакерт', en: 'Martakert' },
  },
  {
    id: 'osm-232215256-martuni',
    lat: 39.795152,
    lng: 47.1109875,
    rank: 'town',
    name: { hy: 'Մարտունի', ru: 'Мартуни', en: 'Martuni' },
  },
  {
    id: 'osm-234280798-askeran',
    lat: 39.9379213,
    lng: 46.8353633,
    rank: 'town',
    name: { hy: 'Ասկերան', ru: 'Аскеран', en: 'Askeran' },
  },
  {
    id: 'osm-925959119-hadrut',
    lat: 39.5190107,
    lng: 47.0313751,
    rank: 'town',
    name: { hy: 'Հադրութ', ru: 'Гадрут', en: 'Hadrut' },
  },
  {
    id: 'osm-234298960-berdzor',
    lat: 39.6401825,
    lng: 46.5488378,
    rank: 'town',
    name: { hy: 'Բերձոր', ru: 'Бердзор', en: 'Berdzor' },
  },
  {
    id: 'osm-3192608052-karvachar',
    lat: 40.106639,
    lng: 46.0383543,
    rank: 'town',
    name: { hy: 'Քարվաճառ', ru: 'Карвачар', en: 'Karvachar' },
  },
  {
    id: 'osm-1434761991-akna',
    lat: 39.9932355,
    lng: 46.9304843,
    rank: 'town',
    name: { hy: 'Ակնա', ru: 'Акна', en: 'Akna' },
  },
  {
    id: 'osm-925959157-karmir-shuka',
    lat: 39.6770641,
    lng: 46.9473348,
    rank: 'village',
    name: { hy: 'Կարմիր Շուկա', ru: 'Кармир Шука', en: 'Karmir Shuka' },
  },
  {
    id: 'osm-1966237356-ivanyan',
    lat: 39.9097028,
    lng: 46.7943875,
    rank: 'village',
    name: { hy: 'Իվանյան', ru: 'Иванян', en: 'Ivanyan' },
  },
  {
    id: 'osm-11209947182-karkijahan',
    lat: 39.8020382,
    lng: 46.7386433,
    rank: 'village',
    name: { hy: 'Կրկժան', ru: 'Кркжан', en: 'Krkjan' },
  },
  {
    id: 'osm-1343893908-shosh',
    lat: 39.7708476,
    lng: 46.7863342,
    rank: 'village',
    name: { hy: 'Շոշ', ru: 'Шош', en: 'Shosh' },
  },
  {
    id: 'osm-1343893913-avetaranots',
    lat: 39.7036193,
    lng: 46.8304362,
    rank: 'village',
    name: { hy: 'Ավետարանոց', ru: 'Аветараноц', en: 'Avetaranots' },
  },
  {
    id: 'osm-1343893914-sghnakh',
    lat: 39.7220845,
    lng: 46.8014858,
    rank: 'village',
    name: { hy: 'Սղնախ', ru: 'Сгнах', en: 'Sghnakh' },
  },
  {
    id: 'osm-1346973643-karintak',
    lat: 39.742917,
    lng: 46.7438238,
    rank: 'village',
    name: { hy: 'Քարին տակ', ru: 'Каринтак', en: 'Karintak' },
  },
  {
    id: 'osm-1346817406-parukh',
    lat: 40.0186228,
    lng: 46.8014171,
    rank: 'village',
    name: { hy: 'Փառուխ', ru: 'Парух', en: 'Parukh' },
  },
  {
    id: 'osm-1347062775-avdur',
    lat: 39.84497,
    lng: 46.9396617,
    rank: 'village',
    name: { hy: 'Ավդուռ', ru: 'Авдур', en: 'Avdur' },
  },
  {
    id: 'osm-1347062789-kaghartsi',
    lat: 39.8193536,
    lng: 46.9382106,
    rank: 'village',
    name: { hy: 'Կաղարծի', ru: 'Кагарци', en: 'Kaghartsi' },
  },
  {
    id: 'osm-1347126900-yemishchan',
    lat: 39.831506,
    lng: 47.009268,
    rank: 'village',
    name: { hy: 'Եմիշճան', ru: 'Емишчан', en: 'Yemishchan' },
  },
  {
    id: 'osm-1348088566-hin-tagher',
    lat: 39.5100217,
    lng: 46.8226283,
    rank: 'village',
    name: { hy: 'Հին Թաղեր', ru: 'Хин Тагер', en: 'Hin Tagher' },
  },
  {
    id: 'osm-8146554978-togh',
    lat: 39.587007,
    lng: 46.9654375,
    rank: 'village',
    name: { hy: 'Տող', ru: 'Тог', en: 'Togh' },
  },
  {
    id: 'osm-8011090031-shekher',
    lat: 39.6493092,
    lng: 46.97826,
    rank: 'village',
    name: { hy: 'Շեխեր', ru: 'Шехер', en: 'Shekher' },
  },
  {
    id: 'osm-8078375954-taghavard',
    lat: 39.6660618,
    lng: 46.9172966,
    rank: 'village',
    name: { hy: 'Տաղավարդ', ru: 'Тагавард', en: 'Taghavard' },
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
