import type { InputHTMLAttributes, ReactNode } from 'react'
import { cx } from './cx'
import { Icon } from './Icon'
import './SearchBar.css'

export interface SearchBarProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Leading element; defaults to a search icon. The kit shows a menu IconButton. */
  leading?: ReactNode
  trailing?: ReactNode
  label?: string
}

export function SearchBar({ leading, trailing, placeholder = 'Search', label, className, ...rest }: SearchBarProps) {
  return (
    <div className={cx('md-search-bar', className)}>
      <span className="md-search-bar__leading">{leading ?? <Icon name="search" />}</span>
      <input type="search" className="md-search-bar__input" placeholder={placeholder} aria-label={label ?? placeholder} {...rest} />
      {trailing && <span className="md-search-bar__trailing">{trailing}</span>}
    </div>
  )
}
