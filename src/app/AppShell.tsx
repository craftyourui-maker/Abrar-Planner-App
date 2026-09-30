import { useCallback, useEffect, useRef, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { NavigationBar, Snackbar, type SnackbarMessage } from '../components'
import { useGo } from './nav'
import { SnackbarContext, type SnackOptions } from './snackbar'
import { useStore } from './store'
import './app.css'

const tabs = [
  { value: '/', label: 'Today', icon: 'today' },
  { value: '/calendar', label: 'Calendar', icon: 'calendar_month' },
  { value: '/hobbies', label: 'Hobbies', icon: 'interests' },
  { value: '/progress', label: 'Progress', icon: 'insights' },
]

/** Which tab a route belongs to; routes that return undefined hide the bar. */
function tabFor(path: string) {
  if (path === '/') return '/'
  if (path === '/calendar') return '/calendar'
  if (path === '/hobbies') return '/hobbies'
  if (['/progress', '/rewards', '/profile'].includes(path)) return '/progress'
  return undefined
}

const PUBLIC = ['/welcome', '/sign-in', '/sign-up']

export function AppShell() {
  const { state } = useStore()
  const location = useLocation()
  const { go } = useGo()
  const tab = tabFor(location.pathname)

  // ---- snackbar queue: one at a time, 4s each, with an exit animation ----
  const [queue, setQueue] = useState<SnackbarMessage[]>([])
  const [leaving, setLeaving] = useState(false)
  const nextId = useRef(0)
  const current = queue[0] ?? null

  const snack = useCallback((text: string, opts: SnackOptions = {}) => {
    setQueue((q) => [...q, { id: ++nextId.current, text, ...opts }])
  }, [])

  const dismiss = useCallback(() => {
    setLeaving(true)
    setTimeout(() => {
      setQueue((q) => q.slice(1))
      setLeaving(false)
    }, 180)
  }, [])

  useEffect(() => {
    if (!current) return
    const t = setTimeout(dismiss, current.actionLabel ? 6000 : 4000)
    return () => clearTimeout(t)
  }, [current, dismiss])

  const onboarding = location.pathname.startsWith('/onboarding')
  if (!state.profile.signedIn && !PUBLIC.includes(location.pathname)) return <Navigate to="/welcome" replace />
  if (state.profile.signedIn && !state.profile.onboarded && !onboarding) return <Navigate to="/onboarding/hobbies" replace />

  return (
    <SnackbarContext.Provider value={snack}>
      <div className="dm-stage">
        <div className="dm-device">
          <main key={location.pathname} className="dm-screen" style={{ viewTransitionName: 'screen' }}>
            <Outlet />
          </main>
          {tab && (
            <div className="dm-nav" style={{ viewTransitionName: 'nav-bar' }}>
              <NavigationBar destinations={tabs} value={tab} onChange={(to) => to !== location.pathname && go(to, 'tab')} />
            </div>
          )}
          <Snackbar message={current} leaving={leaving} onDismiss={dismiss} offset={tab ? 80 : 88} />
        </div>
      </div>
    </SnackbarContext.Provider>
  )
}
