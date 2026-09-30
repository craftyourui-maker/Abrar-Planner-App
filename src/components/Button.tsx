import type { ButtonHTMLAttributes } from 'react'
import { cx } from './cx'
import { Icon } from './Icon'
import './Button.css'

export type ButtonVariant = 'filled' | 'tonal' | 'outlined' | 'text' | 'elevated'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  icon?: string
}

export function Button({ variant = 'filled', icon, className, children, type = 'button', ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      className={cx('md-button', `md-button--${variant}`, icon && 'md-button--with-icon', 'md-state md-focus-ring', className)}
      {...rest}
    >
      {icon && <Icon name={icon} size={18} filled />}
      <span className="md-button__label">{children}</span>
    </button>
  )
}
