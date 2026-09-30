import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cx } from './cx'
import { Icon } from './Icon'
import './Chip.css'

interface BaseChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  label: ReactNode
  icon?: string
  /** Elevated chips sit on busy backgrounds; outlined is the default. */
  elevated?: boolean
}

export interface FilterChipProps extends BaseChipProps {
  selected?: boolean
}

/** Filter chip — toggles a filter; shows a leading check when selected. */
export function FilterChip({ label, icon, selected, elevated, className, type = 'button', ...rest }: FilterChipProps) {
  const leading = selected ? 'check' : icon
  return (
    <button
      type={type}
      aria-pressed={selected ?? false}
      className={cx(
        'md-chip md-chip--filter',
        selected && 'md-chip--selected',
        elevated && 'md-chip--elevated',
        leading && 'md-chip--with-leading',
        'md-state md-focus-ring',
        className,
      )}
      {...rest}
    >
      {leading && <Icon key={leading} name={leading} size={18} className={selected ? 'md-chip__check' : undefined} />}
      <span className="md-chip__label">{label}</span>
    </button>
  )
}

/** Assist chip — a smart, contextual action. */
export function AssistChip({ label, icon, elevated, className, type = 'button', ...rest }: BaseChipProps) {
  return (
    <button
      type={type}
      className={cx('md-chip md-chip--assist', elevated && 'md-chip--elevated', icon && 'md-chip--with-leading', 'md-state md-focus-ring', className)}
      {...rest}
    >
      {icon && <Icon name={icon} size={18} />}
      <span className="md-chip__label">{label}</span>
    </button>
  )
}

/** Suggestion chip — a dynamically generated suggestion, e.g. from AI. */
export function SuggestionChip({ label, icon, elevated, className, type = 'button', ...rest }: BaseChipProps) {
  return (
    <button
      type={type}
      className={cx('md-chip md-chip--suggestion', elevated && 'md-chip--elevated', icon && 'md-chip--with-leading', 'md-state md-focus-ring', className)}
      {...rest}
    >
      {icon && <Icon name={icon} size={18} />}
      <span className="md-chip__label">{label}</span>
    </button>
  )
}

export interface InputChipProps extends BaseChipProps {
  onRemove?: () => void
}

/** Input chip — a discrete piece of user-entered information, removable. */
export function InputChip({ label, icon, onRemove, className }: InputChipProps) {
  return (
    <span className={cx('md-chip md-chip--input', icon && 'md-chip--with-leading', onRemove && 'md-chip--with-trailing', className)}>
      {icon && <Icon name={icon} size={18} />}
      <span className="md-chip__label">{label}</span>
      {onRemove && (
        <button type="button" className="md-chip__remove md-state md-focus-ring" aria-label={typeof label === 'string' ? `Remove ${label}` : 'Remove'} onClick={onRemove}>
          <Icon name="close" size={18} />
        </button>
      )}
    </span>
  )
}
