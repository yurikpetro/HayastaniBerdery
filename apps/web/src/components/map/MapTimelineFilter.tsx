import { useTranslation } from 'react-i18next'
import { formatYear, MAP_TIMELINE_DOMAIN, type YearRange } from './mapTimeline'

interface MapTimelineFilterProps {
  value: YearRange
  onChange: (value: YearRange) => void
  visibleCount: number
  totalCount: number
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
}: MapTimelineFilterProps) {
  const { t } = useTranslation()
  const bceLabel = t('mapTimeline.bce')

  return (
    <div className="map-timeline pointer-events-auto">
      <div className="map-timeline__header">
        <span className="map-timeline__title">{t('mapTimeline.title')}</span>
        <span className="map-timeline__range">
          {formatYear(value.from, bceLabel)} - {formatYear(value.to, bceLabel)}
        </span>
      </div>

      <div className="map-timeline__sliders">
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
