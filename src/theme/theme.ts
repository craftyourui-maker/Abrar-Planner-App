import { createContext, useContext } from 'react'
import { themeIds, type ThemeId } from './themes.gen'

export const palettes = [
  'baseline',
  'monochrome',
  'pink',
  'rose',
  'red',
  'orange',
  'yellow',
  'chartreuse',
  'green',
  'teal',
  'cyan',
  'blue',
  'indigo',
  'purple',
] as const

export type Palette = (typeof palettes)[number]
export type Scheme = 'light' | 'dark' | 'system'
// Only the baseline palette ships medium/high contrast variants in the kit.
export type Contrast = 'standard' | 'medium' | 'high'

export interface ThemeSettings {
  palette: Palette
  scheme: Scheme
  contrast: Contrast
}

export interface ThemeContextValue extends ThemeSettings {
  themeId: ThemeId
  isDark: boolean
  setTheme: (patch: Partial<ThemeSettings>) => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

export function resolveThemeId({ palette, contrast }: ThemeSettings, isDark: boolean): ThemeId {
  const base = `${palette}-${isDark ? 'dark' : 'light'}`
  const suffix = palette === 'baseline' && contrast !== 'standard' ? (contrast === 'high' ? '-hc' : '-mc') : ''
  const id = `${base}${suffix}`
  return (themeIds as readonly string[]).includes(id) ? (id as ThemeId) : 'baseline-light'
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider')
  return ctx
}
