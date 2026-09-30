import { useRef, type KeyboardEvent } from 'react'
import { cx } from './cx'
import './Tabs.css'

export interface Tab<T extends string> {
  value: T
  label: string
}

export interface TabsProps<T extends string> {
  tabs: Tab<T>[]
  value: T
  onChange: (value: T) => void
  label: string
  variant?: 'primary' | 'secondary'
  className?: string
}

export function Tabs<T extends string>({ tabs, value, onChange, label, variant = 'primary', className }: TabsProps<T>) {
  const refs = useRef<Array<HTMLButtonElement | null>>([])

  // Arrow-key roving focus, per the WAI-ARIA tabs pattern.
  const onKeyDown = (e: KeyboardEvent, i: number) => {
    const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    if (!step) return
    const next = (i + step + tabs.length) % tabs.length
    refs.current[next]?.focus()
    onChange(tabs[next].value)
  }

  return (
    <div role="tablist" aria-label={label} className={cx('md-tabs', `md-tabs--${variant}`, className)}>
      {tabs.map((t, i) => {
        const active = t.value === value
        return (
          <button
            key={t.value}
            ref={(el) => {
              refs.current[i] = el
            }}
            role="tab"
            type="button"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            className={cx('md-tabs__tab', active && 'md-tabs__tab--active', 'md-state md-focus-ring')}
            onClick={() => onChange(t.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
          >
            <span className="md-tabs__label">{t.label}</span>
          </button>
        )
      })}
    </div>
  )
}
