import type { ButtonHTMLAttributes } from 'react'
import { cx } from './cx'
import { Icon } from './Icon'
import './IconButton.css'

export type IconButtonVariant = 'standard' | 'filled' | 'tonal' | 'outlined'

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  icon: string
  /** Accessible name — icon buttons have no visible label. */
  label: string
  variant?: IconButtonVariant
  /** Set for toggle icon buttons; renders the filled glyph and selected colors. */
  selected?: boolean
}

export function IconButton({ icon, label, variant = 'standard', selected, className, type = 'button', ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      aria-pressed={selected}
      className={cx('md-icon-button', `md-icon-button--${variant}`, selected && 'md-icon-button--selected', 'md-state md-focus-ring', className)}
      {...rest}
    >
      <Icon name={icon} filled={selected} />
    </button>
  )
}
