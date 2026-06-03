/** Ключи задаются в apps/web/.env (префикс VITE_ обязателен для Vite). */
export const googleMapsApiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '').trim()
export const yandexMapsApiKey = (import.meta.env.VITE_YANDEX_MAPS_API_KEY ?? '').trim()

export const hasGoogleMaps = googleMapsApiKey.length > 0
export const hasYandexMaps = yandexMapsApiKey.length > 0
