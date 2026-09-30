import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { ThemeContext, resolveThemeId, type ThemeContextValue, type ThemeSettings } from './theme'

const STORAGE_KEY = 'daymark-theme-v2'

function usePrefersDark() {
  const query = '(prefers-color-scheme: dark)'
  const [dark, setDark] = useState(() => window.matchMedia?.(query).matches ?? false)
  useEffect(() => {
    const mq = window.matchMedia?.(query)
    if (!mq) return
    const onChange = () => setDark(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return dark
}

function loadSettings(defaults: ThemeSettings): ThemeSettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? { ...defaults, ...JSON.parse(saved) } : defaults
  } catch {
    return defaults
  }
}

export function ThemeProvider({
  children,
  defaults = { palette: 'blue', scheme: 'system', contrast: 'standard' },
}: {
  children: ReactNode
  defaults?: ThemeSettings
}) {
  const [settings, setSettings] = useState(() => loadSettings(defaults))
  const prefersDark = usePrefersDark()
  const isDark = settings.scheme === 'system' ? prefersDark : settings.scheme === 'dark'
  const themeId = resolveThemeId(settings, isDark)

  useEffect(() => {
    document.documentElement.dataset.m3Theme = themeId
  }, [themeId])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch {
      /* storage unavailable — theme still applies for this session */
    }
  }, [settings])

  const value = useMemo<ThemeContextValue>(
    () => ({ ...settings, themeId, isDark, setTheme: (patch) => setSettings((s) => ({ ...s, ...patch })) }),
    [settings, themeId, isDark],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
