import { cx } from './cx'
import { Icon } from './Icon'
import './NavigationBar.css'

export interface NavigationDestination<T extends string> {
  value: T
  label: string
  icon: string
  badge?: number | true
}

export interface NavigationBarProps<T extends string> {
  destinations: NavigationDestination<T>[]
  value: T
  onChange: (value: T) => void
  className?: string
}

/** Bottom navigation bar for 3–5 primary destinations. */
export function NavigationBar<T extends string>({ destinations, value, onChange, className }: NavigationBarProps<T>) {
  return (
    <nav className={cx('md-navigation-bar', className)}>
      {destinations.map((d) => {
        const active = d.value === value
        return (
          <button
            key={d.value}
            type="button"
            aria-current={active ? 'page' : undefined}
            className={cx('md-navigation-bar__item', active && 'md-navigation-bar__item--active')}
            onClick={() => onChange(d.value)}
          >
            <span className="md-navigation-bar__indicator md-state md-focus-ring">
              <Icon name={d.icon} filled={active} />
              {d.badge !== undefined && (
                <span className={cx('md-navigation-bar__badge', d.badge === true && 'md-navigation-bar__badge--dot')}>
                  {d.badge === true ? null : d.badge}
                </span>
              )}
            </span>
            <span className="md-navigation-bar__label">{d.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
