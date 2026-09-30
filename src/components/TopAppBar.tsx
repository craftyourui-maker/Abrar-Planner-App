import type { ReactNode } from 'react'
import { cx } from './cx'
import './TopAppBar.css'

export interface TopAppBarProps {
  headline: ReactNode
  subtitle?: ReactNode
  /** Usually a back/menu IconButton. */
  leading?: ReactNode
  /** Up to three trailing IconButtons. */
  actions?: ReactNode
  variant?: 'small' | 'medium' | 'large'
  /** Apply the scrolled fill (surface-container) to separate from content. */
  scrolled?: boolean
  className?: string
}

export function TopAppBar({ headline, subtitle, leading, actions, variant = 'small', scrolled, className }: TopAppBarProps) {
  return (
    <header className={cx('md-top-app-bar', `md-top-app-bar--${variant}`, scrolled && 'md-top-app-bar--scrolled', className)}>
      <div className="md-top-app-bar__row">
        {leading && <div className="md-top-app-bar__leading">{leading}</div>}
        {variant === 'small' && (
          <div className="md-top-app-bar__text">
            <h1 className="md-top-app-bar__headline">{headline}</h1>
            {subtitle && <p className="md-top-app-bar__subtitle">{subtitle}</p>}
          </div>
        )}
        {actions && <div className="md-top-app-bar__actions">{actions}</div>}
      </div>
      {variant !== 'small' && (
        <div className="md-top-app-bar__text md-top-app-bar__text--expanded">
          <h1 className="md-top-app-bar__headline">{headline}</h1>
          {subtitle && <p className="md-top-app-bar__subtitle">{subtitle}</p>}
        </div>
      )}
    </header>
  )
}
