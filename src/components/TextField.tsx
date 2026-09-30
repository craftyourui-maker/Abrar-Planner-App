import { useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { cx } from './cx'
import { Icon } from './Icon'
import './TextField.css'

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string
  variant?: 'outlined' | 'filled'
  leadingIcon?: string
  /** Trailing element — e.g. an IconButton to clear the field. */
  trailing?: ReactNode
  supportingText?: string
  error?: boolean
}

export function TextField({
  label,
  variant = 'outlined',
  leadingIcon,
  trailing,
  supportingText,
  error,
  className,
  id,
  placeholder = ' ',
  ...rest
}: TextFieldProps) {
  const autoId = useId()
  const inputId = id ?? autoId
  const supportId = supportingText ? `${inputId}-support` : undefined
  return (
    <div className={cx('md-text-field', `md-text-field--${variant}`, error && 'md-text-field--error', leadingIcon && 'md-text-field--with-leading', className)}>
      <div className="md-text-field__container">
        {leadingIcon && <Icon name={leadingIcon} className="md-text-field__leading" />}
        {/* placeholder=" " lets CSS float the label via :placeholder-shown */}
        <input
          id={inputId}
          className="md-text-field__input"
          placeholder={placeholder}
          aria-invalid={error || undefined}
          aria-describedby={supportId}
          {...rest}
        />
        <label htmlFor={inputId} className="md-text-field__label">
          {label}
        </label>
        {variant === 'outlined' && (
          <fieldset className="md-text-field__outline" aria-hidden>
            <legend>
              <span>{label}</span>
            </legend>
          </fieldset>
        )}
        {trailing && <span className="md-text-field__trailing">{trailing}</span>}
      </div>
      {supportingText && (
        <p id={supportId} className="md-text-field__supporting">
          {supportingText}
        </p>
      )}
    </div>
  )
}
