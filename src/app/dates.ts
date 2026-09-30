// Daymark's demo runs on a fixed "today" so the seeded plan always reads correctly.
export const TODAY = '2026-10-06'

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export function parse(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function iso(date: Date) {
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${m}-${d}`
}

export function addDays(isoDate: string, days: number) {
  const d = parse(isoDate)
  d.setDate(d.getDate() + days)
  return iso(d)
}

export const weekday = (isoDate: string) => WEEKDAYS[parse(isoDate).getDay()]
export const weekdayShort = (isoDate: string) => weekday(isoDate).slice(0, 3)
export const monthName = (isoDate: string) => MONTHS[parse(isoDate).getMonth()]
export const monthShort = (isoDate: string) => monthName(isoDate).slice(0, 3)
export const dayOfMonth = (isoDate: string) => parse(isoDate).getDate()

/** "Tuesday, Oct 6" */
export const longDay = (isoDate: string) => `${weekday(isoDate)}, ${monthShort(isoDate)} ${dayOfMonth(isoDate)}`
/** "Tuesday, October 6" */
export const fullDay = (isoDate: string) => `${weekday(isoDate)}, ${monthName(isoDate)} ${dayOfMonth(isoDate)}`
/** "Oct 6" */
export const shortDay = (isoDate: string) => `${monthShort(isoDate)} ${dayOfMonth(isoDate)}`

/** "Today", "Tomorrow", "Yesterday" or "Thu" */
export function relativeDay(isoDate: string) {
  if (isoDate === TODAY) return 'Today'
  if (isoDate === addDays(TODAY, 1)) return 'Tomorrow'
  if (isoDate === addDays(TODAY, -1)) return 'Yesterday'
  return weekdayShort(isoDate)
}

/** "18:30" → "6:30 PM" */
export function clock(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number)
  const suffix = h >= 12 ? 'PM' : 'AM'
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${suffix}`
}

/** "18:30" + 35 → "6:30–7:05 PM" */
export function clockRange(hhmm: string, minutes: number) {
  const [h, m] = hhmm.split(':').map(Number)
  const end = h * 60 + m + minutes
  const endStr = `${String(Math.floor(end / 60) % 24).padStart(2, '0')}:${String(end % 60).padStart(2, '0')}`
  const a = clock(hhmm)
  const b = clock(endStr)
  return a.slice(-2) === b.slice(-2) ? `${a.slice(0, -3)}–${b}` : `${a}–${b}`
}

export function duration(minutes: number) {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m ? `${h} h ${m} min` : `${h} h`
}

export function partOfDay(hhmm: string): 'Morning' | 'Afternoon' | 'Evening' {
  const h = Number(hhmm.split(':')[0])
  return h < 12 ? 'Morning' : h < 17 ? 'Afternoon' : 'Evening'
}
