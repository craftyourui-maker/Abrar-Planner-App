import { cx } from './cx'
import { IconButton } from './IconButton'
import './Snackbar.css'

export interface SnackbarMessage {
  id: number
  text: string
  actionLabel?: string
  onAction?: () => void
}

export interface SnackbarProps {
  message: SnackbarMessage | null
  leaving: boolean
  onDismiss: () => void
  /** Lift above a bottom bar. */
  offset?: number
}

/** Presentational M3 snackbar; the host that queues messages lives in the app shell. */
export function Snackbar({ message, leaving, onDismiss, offset = 0 }: SnackbarProps) {
  return (
    <div className="md-snackbar-region" style={{ bottom: offset + 16 }} role="status" aria-live="polite">
      {message && (
        <div key={message.id} className={cx('md-snackbar', leaving && 'md-snackbar--leaving')}>
          <span className="md-snackbar__text">{message.text}</span>
          {message.actionLabel && (
            <button
              type="button"
              className="md-snackbar__action md-state md-focus-ring"
              onClick={() => {
                message.onAction?.()
                onDismiss()
              }}
            >
              {message.actionLabel}
            </button>
          )}
          <IconButton icon="close" label="Dismiss" className="md-snackbar__close" onClick={onDismiss} />
        </div>
      )}
    </div>
  )
}
