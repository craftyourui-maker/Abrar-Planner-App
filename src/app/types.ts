export type HobbyId = string
export type SessionId = string

export interface Goal {
  title: string
  target: string // ISO date
  milestones: number
  progress: number // 0–1
  horizonWeeks: number
  summary: string
}

export interface Hobby {
  id: HobbyId
  name: string
  icon: string
  category: string
  active: boolean
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  streak: number
  bestStreak: number
  hoursThisMonth: number
  sessionsThisMonth: number
  consistency: number // 0–1 over the last 30 days
  statLine: string
  goal?: Goal
}

export interface Task {
  id: string
  title: string
  detail: string
  minutes: number
  done: boolean
}

export type SessionStatus = 'planned' | 'done'
export type Feeling = 'easy' | 'right' | 'hard'

export interface Session {
  id: SessionId
  hobbyId: HobbyId
  title: string
  date: string // YYYY-MM-DD
  time: string // HH:MM, 24h
  minutes: number
  place?: string
  tasks: Task[]
  status: SessionStatus
  energy?: 'low' | 'medium' | 'high'
  reminder: 0 | 10 | 30 | 60
  xp: number
  completedAt?: string // HH:MM
  feeling?: Feeling
  note?: string
  focusNote?: string
}

export interface Trophy {
  id: string
  name: string
  description: string
  series?: string
  status: 'unlocked' | 'progress' | 'locked'
  progress: number
  total: number
  unlockedOn?: string
  rarity?: 'Common' | 'Rare' | 'Epic'
  icon: string
  isNew?: boolean
}

export interface Settings {
  sessionReminders: boolean
  reminderLead: 10 | 30 | 60
  dailyAgenda: boolean
  agendaTime: string
  streakNudges: boolean
  autoBreakdown: boolean
  smartRescheduling: boolean
  personalization: boolean
  quietStart: string
  quietEnd: string
}

export interface Profile {
  name: string
  email: string
  title: string
  memberSince: string
  xp: number
  weekXp: number
  signedIn: boolean
  onboarded: boolean
}

export interface Availability {
  days: number[] // 0 = Mon … 6 = Sun
  times: Array<'morning' | 'lunch' | 'after-work' | 'evening'>
}

export interface Preferences {
  experience: 'Beginner' | 'Intermediate' | 'Advanced'
  intentions: string[]
  weeklyTarget: number
  availability: Availability
}

export interface AppState {
  version: 1
  profile: Profile
  hobbies: Hobby[]
  sessions: Session[]
  trophies: Trophy[]
  settings: Settings
  preferences: Preferences
}
