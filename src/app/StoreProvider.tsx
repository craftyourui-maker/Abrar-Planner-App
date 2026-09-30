import { useEffect, useMemo, useReducer, type ReactNode } from 'react'
import { STORAGE_KEY, StoreContext, load, reducer } from './store'

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* storage unavailable — state still works for this visit */
    }
  }, [state])
  const value = useMemo(() => ({ state, dispatch }), [state])
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
