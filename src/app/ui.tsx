// Daymark-level building blocks composed from the M3 components.
import type { CSSProperties, ReactNode } from 'react'
import { Icon, LinearProgress } from '../components'
import { cx } from '../components/cx'
import { hobbyTone } from './hobbyStyle'
import type { Hobby } from './types'

export function HobbyGlyph({ hobbyId, icon, size = 40, transitionName, className }: { hobbyId: string; icon: string; size?: number; transitionName?: string; className?: string }) {
  return (
    <span
      className={cx('dm-glyph', className)}
      style={{ ...hobbyTone(hobbyId), width: size, height: size, viewTransitionName: transitionName } as CSSProperties}
      aria-hidden
    >
      <Icon name={icon} size={Math.round(size * 0.55)} filled />
    </span>
  )
}

export function SectionHeader({ title, action, onAction, id }: { title: string; action?: string; onAction?: () => void; id?: string }) {
  return (
    <div className="dm-section-header">
      <h2 id={id} className="dm-section-title md-typescale-title-large">
        {title}
      </h2>
      {action && (
        <button type="button" className="dm-link md-typescale-label-large md-state md-focus-ring" onClick={onAction}>
          {action}
        </button>
      )}
    </div>
  )
}

/** Label + value line over a wavy progress bar — the kit's "Today's momentum" pattern. */
export function Meter({ label, value, progress, onClick }: { label: ReactNode; value: ReactNode; progress: number; onClick?: () => void }) {
  const body = (
    <>
      <span className="dm-meter__row">
        <span className="dm-meter__label md-typescale-title-medium-emphasized">{label}</span>
        <span className="dm-meter__value md-typescale-label-medium">{value}</span>
      </span>
      <LinearProgress value={progress} thickness={8} wave label={typeof label === 'string' ? label : 'Progress'} />
    </>
  )
  return onClick ? (
    <button type="button" className="dm-meter dm-meter--button md-state md-focus-ring" onClick={onClick}>
      {body}
    </button>
  ) : (
    <div className="dm-meter">{body}</div>
  )
}

export interface InfoRowProps {
  leading?: ReactNode
  overline?: ReactNode
  title: ReactNode
  detail?: ReactNode
  trailing?: ReactNode
  onClick?: () => void
  active?: boolean
  done?: boolean
  className?: string
  style?: CSSProperties
  label?: string
}

/** The kit's "Information row": leading glyph, emphasized title, small detail, trailing value. */
export function InfoRow({ leading, overline, title, detail, trailing, onClick, active, done, className, style, label }: InfoRowProps) {
  const content = (
    <>
      {leading && <span className="dm-row__leading">{leading}</span>}
      <span className="dm-row__text">
        {overline && <span className="dm-row__overline md-typescale-label-medium">{overline}</span>}
        <span className="dm-row__title md-typescale-title-medium-emphasized">{title}</span>
        {detail && <span className="dm-row__detail md-typescale-body-small">{detail}</span>}
      </span>
      {trailing !== undefined && <span className="dm-row__trailing md-typescale-label-large">{trailing}</span>}
    </>
  )
  const classes = cx('dm-row', active && 'dm-row--active', done && 'dm-row--done', onClick && 'md-state md-focus-ring', className)
  return onClick ? (
    <button type="button" className={classes} onClick={onClick} style={style} aria-label={label}>
      {content}
    </button>
  ) : (
    <div className={classes} style={style}>
      {content}
    </div>
  )
}

/** Card media: the hobby's tone with its symbol, replacing the kit's placeholder art. */
export function HobbyMedia({ hobby }: { hobby: Pick<Hobby, 'id' | 'icon'> }) {
  return (
    <span className="dm-media" style={hobbyTone(hobby.id)} aria-hidden>
      <Icon name={hobby.icon} size={36} />
    </span>
  )
}

export function EmptyState({ icon, title, body, action }: { icon: string; title: string; body: string; action?: ReactNode }) {
  return (
    <div className="dm-empty dm-pop">
      <span className="dm-empty__icon">
        <Icon name={icon} size={32} />
      </span>
      <p className="md-typescale-title-medium">{title}</p>
      <p className="md-typescale-body-medium dm-muted">{body}</p>
      {action}
    </div>
  )
}

export interface SessionCardProps {
  hobby: Pick<Hobby, 'id' | 'icon' | 'name'>
  title: ReactNode
  subhead: ReactNode
  variant?: 'filled' | 'outlined'
  onOpen: () => void
  /** Shows a play button in the media slot. */
  onStart?: () => void
  transitionName?: string
  style?: CSSProperties
}

/** Horizontal card whose body opens the item and whose media slot can start it. */
export function SessionCard({ hobby, title, subhead, variant = 'outlined', onOpen, onStart, transitionName, style }: SessionCardProps) {
  return (
    <div className={cx('md-card', `md-card--${variant}`, 'md-horizontal-card dm-session-card')} style={style}>
      <button type="button" className="md-horizontal-card__content dm-session-card__open md-state md-focus-ring" onClick={onOpen}>
        <HobbyGlyph hobbyId={hobby.id} icon={hobby.icon} transitionName={transitionName} />
        <span className="md-horizontal-card__text">
          <span className="md-horizontal-card__title">{title}</span>
          <span className="md-horizontal-card__subhead">{subhead}</span>
        </span>
      </button>
      <span className="md-horizontal-card__media dm-session-card__media">
        {onStart ? (
          <button type="button" className="dm-session-card__start md-state md-focus-ring" style={hobbyTone(hobby.id)} onClick={onStart} aria-label={`Start ${hobby.name} session`}>
            <span className="dm-session-card__play">
              <Icon name="play_arrow" filled size={28} />
            </span>
          </button>
        ) : (
          <HobbyMedia hobby={hobby} />
        )}
      </span>
    </div>
  )
}
