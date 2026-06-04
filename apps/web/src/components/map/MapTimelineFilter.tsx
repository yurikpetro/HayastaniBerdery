import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { Fortress, Locale } from '@hayastani/shared'
import { localized } from '../../lib/labels'
import {
  formatYear,
  getFortressTimelineYear,
  MAP_TIMELINE_DOMAIN,
  type YearRange,
} from './mapTimeline'

interface MapTimelineFilterProps {
  value: YearRange
  onChange: (value: YearRange) => void
  visibleCount: number
  totalCount: number
  fortresses: Fortress[]
}

const STEP = 25
const MIN_GAP = 25

function clampFrom(value: number, to: number) {
  return Math.min(value, to - MIN_GAP)
}

function clampTo(value: number, from: number) {
  return Math.max(value, from + MIN_GAP)
}

export function MapTimelineFilter({
  value,
  onChange,
  visibleCount,
  totalCount,
  fortresses,
}: MapTimelineFilterProps) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const bceLabel = t('mapTimeline.bce')
  const timelineSpan = MAP_TIMELINE_DOMAIN.to - MAP_TIMELINE_DOMAIN.from
  const ticks = useMemo(
    () =>
      fortresses
        .map((fortress) => {
          const year = getFortressTimelineYear(fortress)
          if (year == null) return null

          return {
            fortress,
            year,
            position: ((year - MAP_TIMELINE_DOMAIN.from) / timelineSpan) * 100,
          }
        })
        .filter((tick): tick is NonNullable<typeof tick> => tick != null),
    [fortresses, timelineSpan],
  )

  return (
    <div className="map-timeline pointer-events-auto">
      <div className="map-timeline__header">
        <span className="map-timeline__title">{t('mapTimeline.title')}</span>
        <span className="map-timeline__range">
          {formatYear(value.from, bceLabel)} - {formatYear(value.to, bceLabel)}
        </span>
      </div>

      <div className="map-timeline__sliders">
        <div className="map-timeline__ticks" aria-hidden="true">
          {ticks.map(({ fortress, year, position }) => (
            <span
              key={fortress.slug}
              className="map-timeline__tick"
              style={{ left: `${position}%` }}
              title={`${localized(fortress.name, locale)} · ${formatYear(year, bceLabel)}`}
            />
          ))}
        </div>
        <input
          type="range"
          min={MAP_TIMELINE_DOMAIN.from}
          max={MAP_TIMELINE_DOMAIN.to}
          step={STEP}
          value={value.from}
          aria-label={t('mapTimeline.from')}
          onChange={(event) =>
            onChange({
              ...value,
              from: clampFrom(Number(event.target.value), value.to),
            })
          }
        />
        <input
          type="range"
          min={MAP_TIMELINE_DOMAIN.from}
          max={MAP_TIMELINE_DOMAIN.to}
          step={STEP}
          value={value.to}
          aria-label={t('mapTimeline.to')}
          onChange={(event) =>
            onChange({
              ...value,
              to: clampTo(Number(event.target.value), value.from),
            })
          }
        />
      </div>

      <div className="map-timeline__footer">
        <span className="map-timeline__start-date">
          {formatYear(MAP_TIMELINE_DOMAIN.from, bceLabel)}
          <span
            className="map-timeline__hint"
            aria-label={t('mapTimeline.erebuniHint')}
            title={t('mapTimeline.erebuniHint')}
          >
            ?
          </span>
        </span>
        <span>{t('mapTimeline.visible', { visible: visibleCount, total: totalCount })}</span>
        <span>{formatYear(MAP_TIMELINE_DOMAIN.to, bceLabel)}</span>
      </div>
    </div>
  )
}
