import { useEffect, useId, useRef, type ReactNode } from 'react'
import { cx } from './cx'
import { Icon } from './Icon'
import './Dialog.css'

export interface DialogProps {
  open: boolean
  onClose: () => void
  headline: string
  icon?: string
  children?: ReactNode
  /** Buttons, right-aligned. */
  actions?: ReactNode
  className?: string
}

/** M3 basic dialog on the native <dialog> element: focus trap, Esc and inert backdrop for free. */
export function Dialog({ open, onClose, headline, icon, children, actions, className }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (open && !el.open) el.showModal()
    if (!open && el.open) el.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      className={cx('md-dialog', className)}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        // Clicking the backdrop (the dialog element itself, outside the surface) dismisses.
        if (e.target === ref.current) onClose()
      }}
    >
      <div className="md-dialog__surface">
        {icon && <Icon name={icon} className="md-dialog__icon" />}
        <h2 id={titleId} className={cx('md-dialog__headline', icon && 'md-dialog__headline--centered')}>
          {headline}
        </h2>
        {children && <div className="md-dialog__content">{children}</div>}
        {actions && <div className="md-dialog__actions">{actions}</div>}
      </div>
    </dialog>
  )
}
