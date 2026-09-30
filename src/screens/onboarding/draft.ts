import { useDraft } from '../../app/draft'
import type { Preferences } from '../../app/types'

export interface OnboardingDraft {
  hobbyIds: string[]
  experience: Preferences['experience']
  intentions: string[]
  weeklyTarget: number
  days: number[]
  times: Preferences['availability']['times']
}

export const useOnboarding = () =>
  useDraft<OnboardingDraft>('onboarding', () => ({
    hobbyIds: ['guitar', 'running', 'painting', 'reading', 'cooking'],
    experience: 'Intermediate',
    intentions: ['routine', 'skill'],
    weeklyTarget: 4,
    days: [1, 3, 5, 6],
    times: ['morning', 'after-work'],
  }))

export const intentions = [
  { id: 'routine', label: 'Build a routine' },
  { id: 'skill', label: 'Learn a skill' },
  { id: 'project', label: 'Finish a project' },
  { id: 'health', label: 'Feel healthier' },
  { id: 'unwind', label: 'Unwind' },
]

export const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export const timeOptions = [
  { id: 'morning', label: 'Morning', detail: 'up to 90 min', minutes: 60 },
  { id: 'lunch', label: 'Lunch', detail: '20–30 min', minutes: 25 },
  { id: 'after-work', label: 'After work', detail: '30–45 min', minutes: 40 },
  { id: 'evening', label: 'Evening', detail: '30–60 min', minutes: 45 },
] as const
