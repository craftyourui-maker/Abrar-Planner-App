import { createContext, useContext } from 'react'
import { TODAY, addDays } from './dates'
import { createSeed, levelFor, xpFor } from './seed'
import type { AppState, Feeling, Goal, HobbyId, Preferences, Session, SessionId, Settings, Task } from './types'

export const STORAGE_KEY = 'daymark-state-v1'

export type Action =
  | { type: 'reset' }
  | { type: 'signIn' }
  | { type: 'signUp'; name: string; email: string }
  | { type: 'signOut' }
  | { type: 'completeOnboarding'; hobbyIds: HobbyId[]; preferences: Preferences; plan: Session[] }
  | { type: 'addSession'; session: Session }
  | { type: 'updateSession'; session: Session }
  | { type: 'deleteSession'; id: SessionId }
  | { type: 'setTaskDone'; sessionId: SessionId; taskId: string; done: boolean }
  | { type: 'completeSession'; id: SessionId; minutes: number; at: string }
  | { type: 'reopenSession'; id: SessionId }
  | { type: 'reflect'; id: SessionId; feeling?: Feeling; note: string }
  | { type: 'setHobbyActive'; id: HobbyId; active: boolean }
  | { type: 'updateGoal'; hobbyId: HobbyId; goal: Goal }
  | { type: 'updateSettings'; patch: Partial<Settings> }
  | { type: 'seeTrophies' }
  | { type: 'rebalanceDay'; date: string }
  | { type: 'updateProfile'; name: string; email: string }
  | { type: 'setPreferences'; patch: Partial<Preferences> }

const GOAL_STEP = 0.06

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'reset':
      return createSeed()
    case 'signIn':
      return { ...state, profile: { ...state.profile, signedIn: true } }
    case 'signUp':
      return { ...state, profile: { ...state.profile, name: action.name, email: action.email, signedIn: true, onboarded: false } }
    case 'signOut':
      return { ...state, profile: { ...state.profile, signedIn: false } }
    case 'completeOnboarding': {
      // The starter plan replaces any plan sessions still pending this week.
      const weekEnd = addDays(TODAY, 7)
      const kept = state.sessions.filter(
        (s) => !(s.status === 'planned' && s.date >= TODAY && s.date < weekEnd && action.plan.some((p) => p.hobbyId === s.hobbyId && p.date === s.date)),
      )
      return {
        ...state,
        profile: { ...state.profile, onboarded: true },
        preferences: action.preferences,
        hobbies: state.hobbies.map((h) => ({ ...h, active: action.hobbyIds.includes(h.id) })),
        sessions: [...kept, ...action.plan],
      }
    }
    case 'addSession':
      return { ...state, sessions: [...state.sessions, action.session] }
    case 'updateSession':
      return { ...state, sessions: state.sessions.map((s) => (s.id === action.session.id ? action.session : s)) }
    case 'deleteSession':
      return { ...state, sessions: state.sessions.filter((s) => s.id !== action.id) }
    case 'setTaskDone':
      return {
        ...state,
        sessions: state.sessions.map((s) =>
          s.id === action.sessionId ? { ...s, tasks: s.tasks.map((t) => (t.id === action.taskId ? { ...t, done: action.done } : t)) } : s,
        ),
      }
    case 'completeSession': {
      const s = state.sessions.find((x) => x.id === action.id)
      if (!s || s.status === 'done') return state
      const xp = xpFor(action.minutes)
      const doneToday = state.sessions.some((x) => x.hobbyId === s.hobbyId && x.status === 'done' && x.date === s.date)
      return {
        ...state,
        profile: { ...state.profile, xp: state.profile.xp + xp, weekXp: state.profile.weekXp + xp },
        sessions: state.sessions.map((x) =>
          x.id === s.id
            ? { ...x, status: 'done', xp, minutes: action.minutes, completedAt: action.at, tasks: x.tasks.map((t) => ({ ...t, done: true })) }
            : x,
        ),
        hobbies: state.hobbies.map((h) =>
          h.id === s.hobbyId
            ? {
                ...h,
                streak: doneToday ? h.streak : h.streak + 1,
                bestStreak: Math.max(h.bestStreak, doneToday ? h.streak : h.streak + 1),
                sessionsThisMonth: h.sessionsThisMonth + 1,
                hoursThisMonth: Math.round((h.hoursThisMonth + action.minutes / 60) * 10) / 10,
                goal: h.goal && { ...h.goal, progress: Math.min(1, h.goal.progress + GOAL_STEP) },
              }
            : h,
        ),
        trophies: state.trophies.map((t) =>
          t.id === 'weekly-chest' && t.status === 'progress'
            ? t.progress + 1 >= t.total
              ? { ...t, progress: t.total, status: 'unlocked', unlockedOn: s.date, isNew: true }
              : { ...t, progress: t.progress + 1 }
            : t.id === 'deep-focus' && action.minutes >= 45 && t.status === 'progress'
              ? { ...t, progress: Math.min(t.total, t.progress + 1) }
              : t,
        ),
      }
    }
    case 'reopenSession': {
      const s = state.sessions.find((x) => x.id === action.id)
      if (!s || s.status !== 'done') return state
      return {
        ...state,
        profile: { ...state.profile, xp: state.profile.xp - s.xp, weekXp: Math.max(0, state.profile.weekXp - s.xp) },
        sessions: state.sessions.map((x) =>
          x.id === s.id ? { ...x, status: 'planned', completedAt: undefined, xp: xpFor(x.minutes), tasks: x.tasks.map((t) => ({ ...t, done: false })) } : x,
        ),
      }
    }
    case 'reflect':
      return {
        ...state,
        sessions: state.sessions.map((s) => (s.id === action.id ? { ...s, feeling: action.feeling, note: action.note } : s)),
      }
    case 'setHobbyActive':
      return { ...state, hobbies: state.hobbies.map((h) => (h.id === action.id ? { ...h, active: action.active } : h)) }
    case 'updateGoal':
      return { ...state, hobbies: state.hobbies.map((h) => (h.id === action.hobbyId ? { ...h, goal: action.goal } : h)) }
    case 'updateProfile':
      return { ...state, profile: { ...state.profile, name: action.name, email: action.email } }
    case 'setPreferences':
      return { ...state, preferences: { ...state.preferences, ...action.patch } }
    case 'updateSettings':
      return { ...state, settings: { ...state.settings, ...action.patch } }
    case 'seeTrophies':
      return { ...state, trophies: state.trophies.map((t) => ({ ...t, isNew: false })) }
    case 'rebalanceDay': {
      // Spread the day's unfinished sessions so each starts after the previous one
      // ends, with a 15-minute breather, beginning no earlier than 6:30 PM.
      const planned = state.sessions
        .filter((s) => s.date === action.date && s.status === 'planned')
        .sort((a, b) => a.time.localeCompare(b.time))
      let cursor = 18 * 60 + 30
      const moved = new Map<string, string>()
      for (const s of planned) {
        const [h, m] = s.time.split(':').map(Number)
        const start = Math.max(cursor, h * 60 + m)
        moved.set(s.id, `${String(Math.floor(start / 60)).padStart(2, '0')}:${String(start % 60).padStart(2, '0')}`)
        cursor = start + s.minutes + 15
      }
      return { ...state, sessions: state.sessions.map((s) => (moved.has(s.id) ? { ...s, time: moved.get(s.id)! } : s)) }
    }
  }
}

export function load(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as AppState
      if (parsed.version === 1) return parsed
    }
  } catch {
    /* unreadable storage — start from the seed */
  }
  return createSeed()
}

interface Store {
  state: AppState
  dispatch: (action: Action) => void
}

export const StoreContext = createContext<Store | null>(null)

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}

// ---------- selectors ----------

export const byTime = (a: Session, b: Session) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)

export function useHobby(id: string | undefined) {
  const { state } = useStore()
  return state.hobbies.find((h) => h.id === id)
}

export function useSession(id: string | undefined) {
  const { state } = useStore()
  return state.sessions.find((s) => s.id === id)
}

export function useLevel() {
  const { state } = useStore()
  return levelFor(state.profile.xp)
}

export const sessionsOn = (state: AppState, date: string) => state.sessions.filter((s) => s.date === date).sort(byTime)

export const nextTask = (tasks: Task[]) => tasks.find((t) => !t.done)

export const uid = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 9)}`
