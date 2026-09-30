import { useEffect, useRef, useState, type ReactNode } from 'react'
import { IconButton, TopAppBar } from '../components'
import { cx } from '../components/cx'
import { useGo } from './nav'

// The first screen of a visit keeps the browser's default focus; every screen after
// that moves focus to its headline so screen readers announce the change.
let firstScreen = true

export interface ScreenProps {
  title: string
  subtitle?: ReactNode
  /** Where the back arrow goes when there is no history; `false` hides it (tab roots). */
  back?: string | false
  actions?: ReactNode
  leading?: ReactNode
  /** Pinned bottom area — the kit's "Primary actions" row. */
  footer?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
}

/**
 * One screen of the app: top app bar that fills on scroll, a scrolling body, and an
 * optional pinned action row. Moves focus to the headline on arrival for screen readers.
 */
export function Screen({ title, subtitle, back = '/', actions, leading, footer, children, className, bodyClassName }: ScreenProps) {
  const { back: goBack } = useGo()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    document.title = `${title} · Daymark`
    if (firstScreen) {
      firstScreen = false
      return
    }
    const h1 = scrollRef.current?.parentElement?.querySelector<HTMLElement>('.md-top-app-bar__headline')
    h1?.setAttribute('tabindex', '-1')
    h1?.focus({ preventScroll: true })
  }, [title])

  return (
    <div className={cx('dm-screen-frame', className)}>
      <div className="dm-app-bar" style={{ viewTransitionName: 'app-bar' }}>
        <TopAppBar
          headline={title}
          subtitle={subtitle}
          scrolled={scrolled}
          leading={leading ?? (back !== false && <IconButton icon="arrow_back" label="Back" onClick={() => goBack(back)} />)}
          actions={actions}
          className={back === false && !leading ? 'dm-app-bar--root' : undefined}
        />
      </div>
      <div ref={scrollRef} className="dm-scroll" onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 4)}>
        <div className={cx('dm-body', bodyClassName)}>{children}</div>
      </div>
      {footer && <div className="dm-footer">{footer}</div>}
    </div>
  )
}
