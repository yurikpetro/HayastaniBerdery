import { useTranslation } from 'react-i18next'
import type { MapMarkerMode } from './mapMarkerMode'

interface MapMarkerModeSwitcherProps {
  value: MapMarkerMode
  onChange: (mode: MapMarkerMode) => void
}

export function MapMarkerModeSwitcher({ value, onChange }: MapMarkerModeSwitcherProps) {
  const { t } = useTranslation()

  return (
    <div
      className="map-marker-mode pointer-events-auto"
      role="group"
      aria-label={t('mapMarkers.title')}
    >
      <button
        type="button"
        className={
          value === 'pins'
            ? 'map-marker-mode__btn map-marker-mode__btn--active'
            : 'map-marker-mode__btn'
        }
        aria-pressed={value === 'pins'}
        title={t('mapMarkers.pins')}
        onClick={() => onChange('pins')}
      >
        <PinIcon />
        <span className="map-marker-mode__label">{t('mapMarkers.pins')}</span>
      </button>
      <button
        type="button"
        className={
          value === 'photos'
            ? 'map-marker-mode__btn map-marker-mode__btn--active'
            : 'map-marker-mode__btn'
        }
        aria-pressed={value === 'photos'}
        title={t('mapMarkers.photos')}
        onClick={() => onChange('photos')}
      >
        <PhotoIcon />
        <span className="map-marker-mode__label">{t('mapMarkers.photos')}</span>
      </button>
    </div>
  )
}

function PinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
    </svg>
  )
}

function PhotoIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="8.5" cy="10.5" r="1.5" fill="currentColor" stroke="none" />
      <path d="M21 16l-5.5-5.5L5 18" />
    </svg>
  )
}
