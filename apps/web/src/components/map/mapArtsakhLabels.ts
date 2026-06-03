export type ArtsakhLabelsMode = 'on' | 'off'

export const DEFAULT_ARTSAKH_LABELS: ArtsakhLabelsMode = 'on'

const STORAGE_KEY = 'artsakhHyLabels'

export function loadStoredArtsakhLabels(): ArtsakhLabelsMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'on' || stored === 'off') return stored
  } catch {
    /* ignore */
  }
  return DEFAULT_ARTSAKH_LABELS
}

export function storeArtsakhLabels(mode: ArtsakhLabelsMode) {
  try {
    localStorage.setItem(STORAGE_KEY, mode)
  } catch {
    /* ignore */
  }
}
