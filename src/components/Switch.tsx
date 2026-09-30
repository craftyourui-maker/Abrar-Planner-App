import type { InputHTMLAttributes } from 'react'
import { cx } from './cx'
import { Icon } from './Icon'
import './Switch.css'

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Show a check/close glyph inside the handle. */
  icons?: boolean
}

export function Switch({ icons, className, checked, ...rest }: SwitchProps) {
  return (
    <span className={cx('md-switch', icons && 'md-switch--icons', className)}>
      <input type="checkbox" role="switch" checked={checked} className="md-switch__input" {...rest} />
      <span className="md-switch__track" aria-hidden>
        <span className="md-switch__handle">{icons && <Icon name={checked ? 'check' : 'close'} size={16} />}</span>
      </span>
    </span>
  )
}
