import { useTranslation } from 'react-i18next'
import type { ArtsakhLabelsMode } from './mapArtsakhLabels'

interface ArtsakhLabelsToggleProps {
  value: ArtsakhLabelsMode
  onChange: (mode: ArtsakhLabelsMode) => void
}

export function ArtsakhLabelsToggle({ value, onChange }: ArtsakhLabelsToggleProps) {
  const { t } = useTranslation()
  const enabled = value === 'on'

  return (
    <label
      className="artsakh-labels-toggle pointer-events-auto"
      title={t('mapToponyms.hint')}
    >
      <input
        type="checkbox"
        checked={enabled}
        onChange={(e) => onChange(e.target.checked ? 'on' : 'off')}
      />
      <span className="artsakh-labels-toggle__text">{t('mapToponyms.artsakhLabels')}</span>
    </label>
  )
}
