import type { ReactNode } from 'react'
import { cx } from './cx'
import { Icon } from './Icon'
import './BottomAppBar.css'

export interface BottomAppBarProps {
  /** Up to four IconButtons. */
  actions: ReactNode
  fab?: { icon: string; label: string; onClick?: () => void }
  className?: string
}

export function BottomAppBar({ actions, fab, className }: BottomAppBarProps) {
  return (
    <div className={cx('md-bottom-app-bar', className)}>
      <div className="md-bottom-app-bar__actions">{actions}</div>
      {fab && (
        <button type="button" className="md-fab md-state md-focus-ring" aria-label={fab.label} onClick={fab.onClick}>
          <Icon name={fab.icon} />
        </button>
      )}
    </div>
  )
}

export interface FabProps {
  icon: string
  label: string
  /** Extended FAB shows the label as text. */
  extended?: boolean
  onClick?: () => void
  className?: string
}

export function Fab({ icon, label, extended, onClick, className }: FabProps) {
  return (
    <button
      type="button"
      className={cx('md-fab', extended && 'md-fab--extended', 'md-state md-focus-ring', className)}
      aria-label={extended ? undefined : label}
      onClick={onClick}
    >
      <Icon name={icon} />
      {extended && <span className="md-fab__label">{label}</span>}
    </button>
  )
}
