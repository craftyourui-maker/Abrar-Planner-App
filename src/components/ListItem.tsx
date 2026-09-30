import type { ReactNode } from 'react'
import { cx } from './cx'
import { Icon } from './Icon'
import './ListItem.css'

export interface ListItemProps {
  headline: ReactNode
  supportingText?: ReactNode
  overline?: ReactNode
  /** Icon name, or any node (Avatar, Checkbox…). */
  leading?: string | ReactNode
  /** Short trailing text, e.g. "+40 XP" or "Edit". */
  trailingText?: ReactNode
  /** Icon name, or any node (Switch, IconButton…). */
  trailing?: string | ReactNode
  onClick?: () => void
  selected?: boolean
  className?: string
}

export function ListItem({ headline, supportingText, overline, leading, trailingText, trailing, onClick, selected, className }: ListItemProps) {
  const lines = 1 + (supportingText ? 1 : 0) + (overline ? 1 : 0)
  const content = (
    <>
      {leading && <span className="md-list-item__leading">{typeof leading === 'string' ? <Icon name={leading} /> : leading}</span>}
      <span className="md-list-item__text">
        {overline && <span className="md-list-item__overline">{overline}</span>}
        <span className="md-list-item__headline">{headline}</span>
        {supportingText && <span className="md-list-item__supporting">{supportingText}</span>}
      </span>
      {trailingText && <span className="md-list-item__trailing-text">{trailingText}</span>}
      {trailing && <span className="md-list-item__trailing">{typeof trailing === 'string' ? <Icon name={trailing} /> : trailing}</span>}
    </>
  )
  const classes = cx('md-list-item', `md-list-item--${lines}-line`, selected && 'md-list-item--selected', onClick && 'md-state md-focus-ring', className)
  return onClick ? (
    <button type="button" className={classes} onClick={onClick}>
      {content}
    </button>
  ) : (
    <div className={classes}>{content}</div>
  )
}

export function List({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div role="list" className={cx('md-list', className)}>
      {children}
    </div>
  )
}
