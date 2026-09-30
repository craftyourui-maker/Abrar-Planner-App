import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from './cx'
import { Avatar } from './Avatar'
import './Card.css'

export type CardVariant = 'filled' | 'outlined' | 'elevated'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  /** Makes the whole card an interactive surface with state layers. */
  interactive?: boolean
}

export function Card({ variant = 'filled', interactive, className, children, ...rest }: CardProps) {
  return (
    <div
      className={cx('md-card', `md-card--${variant}`, interactive && 'md-card--interactive md-state md-focus-ring', className)}
      tabIndex={interactive ? 0 : undefined}
      {...rest}
    >
      {children}
    </div>
  )
}

export interface HorizontalCardProps extends Omit<CardProps, 'title'> {
  title: ReactNode
  subhead?: ReactNode
  /** Monogram shown in the leading avatar. */
  initials?: string
  leading?: ReactNode
  /** Image URL or custom node for the trailing media slot; a neutral placeholder renders when omitted. */
  media?: ReactNode
  mediaAlt?: string
}

/** The kit's "Horizontal card — Media & text" layout, used for Daymark hobby cards. */
export function HorizontalCard({ title, subhead, initials, leading, media, mediaAlt = '', className, ...rest }: HorizontalCardProps) {
  return (
    <Card className={cx('md-horizontal-card', className)} {...rest}>
      <div className="md-horizontal-card__content">
        {leading ?? (initials && <Avatar initials={initials} />)}
        <div className="md-horizontal-card__text">
          <div className="md-horizontal-card__title">{title}</div>
          {subhead && <div className="md-horizontal-card__subhead">{subhead}</div>}
        </div>
      </div>
      <div className="md-horizontal-card__media">{typeof media === 'string' ? <img src={media} alt={mediaAlt} /> : (media ?? <MediaPlaceholder />)}</div>
    </Card>
  )
}

function MediaPlaceholder() {
  return <span className="md-horizontal-card__placeholder" aria-hidden />
}
