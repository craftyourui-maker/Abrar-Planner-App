import { useCallback, useState } from 'react'

/**
 * State that must survive screen changes inside one flow (onboarding, AI planner)
 * but not a new visit: kept in sessionStorage under a flow key.
 */
export function useDraft<T>(key: string, initial: () => T) {
  const storageKey = `daymark-draft-${key}`
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = sessionStorage.getItem(storageKey)
      if (raw) return JSON.parse(raw) as T
    } catch {
      /* ignore */
    }
    return initial()
  })

  const update = useCallback(
    (patch: Partial<T> | ((v: T) => T)) => {
      setValue((prev) => {
        const next = typeof patch === 'function' ? patch(prev) : { ...prev, ...patch }
        try {
          sessionStorage.setItem(storageKey, JSON.stringify(next))
        } catch {
          /* ignore */
        }
        return next
      })
    },
    [storageKey],
  )

  return [value, update] as const
}

export function clearDraft(key: string) {
  try {
    sessionStorage.removeItem(`daymark-draft-${key}`)
  } catch {
    /* ignore */
  }
}
