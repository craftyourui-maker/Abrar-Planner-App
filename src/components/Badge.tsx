import type { ReactNode } from 'react'
import './Badge.css'

export interface BadgeProps {
  /** Omit for a small dot badge; pass a number/text for a large badge. */
  value?: ReactNode
  children: ReactNode
}

export function Badge({ value, children }: BadgeProps) {
  return (
    <span className="md-badge-anchor">
      {children}
      <span className={value === undefined ? 'md-badge md-badge--small' : 'md-badge md-badge--large'}>{value}</span>
    </span>
  )
}
