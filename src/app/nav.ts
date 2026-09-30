import { useCallback } from 'react'
import { flushSync } from 'react-dom'
import { useNavigate, type To } from 'react-router-dom'

/**
 * Direction of a navigation, which picks the M3 transition pattern:
 * forward/back → shared axis X, tab → fade through, up → shared axis Y (modal-ish flows).
 */
export type NavDir = 'forward' | 'back' | 'tab' | 'up' | 'down'

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

function withTransition(dir: NavDir, update: () => void | Promise<void>) {
  const doc = document as Document & {
    startViewTransition?: (cb: () => void | Promise<void>) => { finished: Promise<void>; ready: Promise<void> }
  }
  if (!doc.startViewTransition || reducedMotion() || document.visibilityState !== 'visible') {
    void update()
    return
  }
  document.documentElement.dataset.navDir = dir
  const t = doc.startViewTransition(update)
  // A skipped transition (e.g. a second navigation mid-flight) rejects `ready`; the
  // DOM update itself still happens, so there is nothing to recover.
  t.ready.catch(() => {})
  t.finished
    .catch(() => {})
    .finally(() => {
      delete document.documentElement.dataset.navDir
    })
}

const settle = () => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())))

export function useGo() {
  const navigate = useNavigate()

  const go = useCallback(
    (to: To, dir: NavDir = 'forward', opts: { replace?: boolean; state?: unknown } = {}) =>
      withTransition(dir, () => {
        flushSync(() => navigate(to, opts))
      }),
    [navigate],
  )

  /** Back through history when there is some, otherwise up to `fallback`. */
  const back = useCallback(
    (fallback: To = '/') => {
      const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0
      withTransition('back', async () => {
        if (idx > 0) {
          const popped = new Promise<void>((r) => window.addEventListener('popstate', () => r(), { once: true }))
          navigate(-1)
          await Promise.race([popped, new Promise((r) => setTimeout(r, 250))])
          await settle()
        } else {
          flushSync(() => navigate(fallback, { replace: true }))
        }
      })
    },
    [navigate],
  )

  return { go, back }
}
