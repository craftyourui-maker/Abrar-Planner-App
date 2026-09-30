import { useEffect, useRef, type InputHTMLAttributes } from 'react'
import { cx } from './cx'
import { Icon } from './Icon'
import './Checkbox.css'

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  indeterminate?: boolean
  error?: boolean
}

export function Checkbox({ indeterminate = false, error, className, checked, ...rest }: CheckboxProps) {
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate
  }, [indeterminate])
  const glyph = indeterminate ? 'check_indeterminate_small' : checked ? 'check_small' : null
  return (
    <span className={cx('md-checkbox', error && 'md-checkbox--error', className)}>
      <input ref={ref} type="checkbox" checked={checked} className="md-checkbox__input" {...rest} />
      <span className="md-checkbox__box" aria-hidden>
        {glyph && <Icon key={glyph} name={glyph} size={18} className="md-checkbox__glyph" />}
      </span>
    </span>
  )
}
