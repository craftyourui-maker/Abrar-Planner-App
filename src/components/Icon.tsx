import type { CSSProperties } from 'react'
import { cx } from './cx'
import './Icon.css'

export interface IconProps {
  /** Material Symbols ligature name, e.g. "arrow_back" — the same icon set the Figma kit uses. */
  name: string
  filled?: boolean
  size?: number
  className?: string
  label?: string
}

export function Icon({ name, filled, size = 24, className, label }: IconProps) {
  return (
    <span
      className={cx('md-icon', filled && 'md-icon--filled', className)}
      style={{ '--md-icon-size': `${size}px` } as CSSProperties}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {name}
    </span>
  )
}
