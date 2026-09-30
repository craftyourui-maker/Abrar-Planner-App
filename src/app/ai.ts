// A deterministic stand-in for Daymark's AI planner: it reads the time budget out of
// the request, picks a task template for the hobby, and scales it to fit.
import { TODAY, addDays } from './dates'
import { guitarTasks, xpFor } from './seed'
import type { Availability, Hobby, Session, Task } from './types'
import { uid } from './store'

type Template = Array<[string, string, number]>

const templates: Record<string, Template[]> = {
  guitar: [
    guitarTasks().map((t) => [t.title, t.detail, t.minutes] as [string, string, number]),
    [
      ['Spider walk warm-up', 'Frets 1–4 · 70 BPM', 6],
      ['Slow-motion changes', 'G → Am → C · lift and land together', 14],
      ['Anchor-finger drills', 'Keep finger 3 planted between shapes', 12],
      ['Record one take', 'Listen back for gaps between chords', 13],
    ],
  ],
  running: [
    [
      ['Dynamic warm-up', 'Leg swings, skips, high knees', 8],
      ['Easy run', 'Conversational effort', 30],
      ['Strides', '4 × 20 seconds, walk back', 7],
    ],
    [
      ['Brisk walk', 'Loosen up', 5],
      ['Run–walk intervals', '5 × (4 min run, 1 min walk)', 25],
      ['Cool-down stretch', 'Calves, hamstrings, hips', 10],
    ],
  ],
  painting: [
    [
      ['Mix a value scale', 'Nine steps, one hue', 12],
      ['Thumbnail sketches', 'Three compositions, 3 min each', 10],
      ['Color study', 'Limited palette of three', 18],
      ['Reflect and label', 'Note what surprised you', 5],
    ],
    [
      ['Warm-up washes', 'Wet-on-wet gradients', 10],
      ['Edge practice', 'Hard, soft, lost edges', 15],
      ['Small landscape', '10 × 15 cm', 20],
    ],
  ],
  reading: [
    [
      ['Settle in', 'Phone in another room', 3],
      ['Focused reading', 'One chapter', 20],
      ['Capture one idea', 'A sentence in your notebook', 5],
    ],
  ],
  cooking: [
    [
      ['Mise en place', 'Prep and measure everything', 12],
      ['Technique focus', 'One new skill from the recipe', 15],
      ['Cook and plate', 'Taste as you go', 15],
      ['Notes for next time', 'What to change', 3],
    ],
  ],
}

const generic: Template[] = [
  [
    ['Warm up', 'Ease into it', 5],
    ['Focused practice', 'The one thing that matters today', 25],
    ['Wrap up', 'Note what to try next time', 5],
  ],
]

/** Reads "45 minutes", "1 hour", "1.5 h" etc. out of free text. */
export function minutesIn(text: string) {
  const min = text.match(/(\d+)\s*(?:min|minutes?|m\b)/i)
  if (min) return Number(min[1])
  const hr = text.match(/(\d+(?:\.\d+)?)\s*(?:h|hours?|hr)\b/i)
  if (hr) return Math.round(Number(hr[1]) * 60)
  return null
}

export function breakdown(hobbyId: string, request: string, variant = 0, fallbackMinutes = 45): Task[] {
  const pool = templates[hobbyId] ?? generic
  const template = pool[variant % pool.length]
  const target = minutesIn(request) ?? fallbackMinutes
  const base = template.reduce((sum, [, , m]) => sum + m, 0)
  // Scale each task, then give any rounding remainder to the longest task.
  const scaled = template.map(([title, detail, m]) => ({ title, detail, minutes: Math.max(3, Math.round((m * target) / base)) }))
  const diff = target - scaled.reduce((s, t) => s + t.minutes, 0)
  const longest = scaled.reduce((a, b) => (b.minutes > a.minutes ? b : a))
  longest.minutes += diff
  return scaled.map((t) => ({ ...t, id: uid('t'), done: false }))
}

export function effortFor(tasks: Task[]) {
  const total = tasks.reduce((s, t) => s + t.minutes, 0)
  const longest = Math.max(...tasks.map((t) => t.minutes))
  const focus = longest / total > 0.35 ? 'Focused' : 'Varied'
  const load = total >= 60 ? 'high' : total >= 30 ? 'medium' : 'light'
  return { label: `${focus} · ${load}`, value: Math.min(1, total / 75) }
}

const planTitles: Record<string, [string, number, string][]> = {
  guitar: [['Fingerstyle foundations', 35, 'Living room']],
  running: [['Easy run + strides', 30, 'River path']],
  painting: [['Color mixing study', 45, 'Studio corner']],
  reading: [['Sunday reading reset', 25, 'Sofa']],
  cooking: [['Weeknight ramen', 40, 'Kitchen']],
  photography: [['Golden hour walk', 40, 'Neighborhood']],
  yoga: [['Gentle flow', 25, 'Living room']],
  gardening: [['Balcony herb care', 20, 'Balcony']],
}

const slotTime = { morning: '07:00', lunch: '12:30', 'after-work': '18:30', evening: '20:00' } as const
const weekendSlot = { morning: '10:00', lunch: '12:30', 'after-work': '16:00', evening: '20:00' } as const

/** Builds week one: one session per chosen hobby, spread across the chosen days. */
export function starterPlan(hobbies: Hobby[], availability: Availability, weeklyTarget: number): Session[] {
  const days = [...availability.days].sort((a, b) => a - b)
  const times = availability.times.length ? availability.times : (['after-work'] as const)
  // TODAY is a Tuesday (index 1, Monday = 0)
  const dateFor = (day: number) => addDays(TODAY, day >= 1 ? day - 1 : day + 6)
  const count = Math.min(weeklyTarget, Math.max(1, days.length), hobbies.length || 1)
  return hobbies.slice(0, count).map((h, i) => {
    const day = days[i % days.length] ?? 1
    const weekend = day >= 5
    const slot = times[i % times.length]
    const [title, minutes, place] = planTitles[h.id]?.[0] ?? [`${h.name} session`, 30, 'Home']
    return {
      id: uid('s'),
      hobbyId: h.id,
      title,
      date: dateFor(day),
      time: (weekend ? weekendSlot : slotTime)[slot],
      minutes,
      place,
      tasks: breakdown(h.id, `${minutes} min`),
      status: 'planned',
      reminder: 30,
      xp: xpFor(minutes),
    }
  })
}
