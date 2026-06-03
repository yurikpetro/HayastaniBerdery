import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  DEFAULT_MAP_LAYER,
  getLayersByGroup,
  MAP_LAYER_GROUPS,
  MAP_LAYERS,
  type MapLayerGroup,
  type MapLayerId,
} from './mapLayers'

interface MapLayerSwitcherProps {
  value: MapLayerId
  onChange: (id: MapLayerId) => void
}

const GROUP_LABEL_KEYS: Record<MapLayerGroup, string> = {
  osm: 'mapLayers.groupOsm',
  satellite: 'mapLayers.groupSatellite',
  other: 'mapLayers.groupOther',
}

export function MapLayerSwitcher({ value, onChange }: MapLayerSwitcherProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const current = MAP_LAYERS[value] ?? MAP_LAYERS[DEFAULT_MAP_LAYER]

  useEffect(() => {
    if (!open) return
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  return (
    <div ref={rootRef} className="map-layer-switcher pointer-events-auto">
      <button
        type="button"
        className="map-layer-switcher__toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <span className="map-layer-switcher__toggle-label">{t(current.nameKey)}</span>
        <LayersIcon />
      </button>

      {open ? (
        <div className="map-layer-switcher__panel" role="menu">
          <div className="map-layer-switcher__grid">
            {MAP_LAYER_GROUPS.map((group) => (
              <div key={group} className="map-layer-switcher__column">
                <div className="map-layer-switcher__column-title">{t(GROUP_LABEL_KEYS[group])}</div>
                <ul className="map-layer-switcher__list">
                  {getLayersByGroup(group).map((layer) => (
                    <li key={layer.id}>
                      <button
                        type="button"
                        role="menuitemradio"
                        aria-checked={value === layer.id}
                        className={
                          value === layer.id
                            ? 'map-layer-switcher__item map-layer-switcher__item--active'
                            : 'map-layer-switcher__item'
                        }
                        onClick={() => {
                          onChange(layer.id)
                          setOpen(false)
                        }}
                      >
                        {t(layer.nameKey)}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function LayersIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 12l10 5 10-5" />
      <path d="M2 17l10 5 10-5" />
    </svg>
  )
}
