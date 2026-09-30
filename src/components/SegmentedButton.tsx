import { cx } from './cx'
import { Icon } from './Icon'
import './SegmentedButton.css'

export interface Segment<T extends string> {
  value: T
  label: string
  icon?: string
}

export interface SegmentedButtonProps<T extends string> {
  segments: Segment<T>[]
  value: T[]
  onChange: (value: T[]) => void
  /** Multi-select allows several segments on; single-select always keeps one. */
  multiple?: boolean
  label: string
  className?: string
}

export function SegmentedButton<T extends string>({ segments, value, onChange, multiple, label, className }: SegmentedButtonProps<T>) {
  const toggle = (v: T) => {
    if (!multiple) return onChange([v])
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v])
  }
  return (
    <div role="group" aria-label={label} className={cx('md-segmented', className)}>
      {segments.map((s) => {
        const selected = value.includes(s.value)
        const leading = selected ? 'check' : s.icon
        return (
          <button
            key={s.value}
            type="button"
            aria-pressed={selected}
            className={cx('md-segmented__segment', selected && 'md-segmented__segment--selected', 'md-state md-focus-ring')}
            onClick={() => toggle(s.value)}
          >
            {leading && <Icon name={leading} size={18} />}
            <span>{s.label}</span>
          </button>
        )
      })}
    </div>
  )
}
