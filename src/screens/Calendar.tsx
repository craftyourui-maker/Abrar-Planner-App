import { useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { Button, Checkbox, FilterChip, IconButton, SegmentedButton } from '../components'
import { cx } from '../components/cx'
import { TODAY, addDays, clock, clockRange, dayOfMonth, duration, longDay, monthName, parse, partOfDay, weekdayShort } from '../app/dates'
import { stagger } from '../app/motion'
import { useGo } from '../app/nav'
import { Screen } from '../app/Screen'
import { useSnackbar } from '../app/snackbar'
import { sessionsOn, useStore } from '../app/store'
import type { Session } from '../app/types'
import { EmptyState, HobbyGlyph, InfoRow, SectionHeader } from '../app/ui'
import './screens.css'

const WINDOW_START = '2026-10-01'

export function Calendar() {
  const { state } = useStore()
  const { go } = useGo()
  const [params, setParams] = useSearchParams()
  const [view, setView] = useState<'days' | 'month'>('days')
  const selected = params.get('d') ?? TODAY
  const select = (d: string) => setParams({ d }, { replace: true })
  const daySessions = sessionsOn(state, selected)
  const has = (d: string) => state.sessions.some((s) => s.date === d)
  const hobby = (id: string) => state.hobbies.find((h) => h.id === id)!

  const days = Array.from({ length: 14 }, (_, i) => addDays(WINDOW_START, i))
  const monthStart = selected.slice(0, 8) + '01'
  const lead = (parse(monthStart).getDay() + 6) % 7 // Monday-first grid
  const daysInMonth = new Date(parse(monthStart).getFullYear(), parse(monthStart).getMonth() + 1, 0).getDate()

  return (
    <Screen
      title="Calendar"
      subtitle={`${monthName(selected)} ${selected.slice(0, 4)}`}
      back={false}
      actions={
        <>
          <IconButton icon="today" label="Jump to today" onClick={() => select(TODAY)} disabled={selected === TODAY} />
          <IconButton icon="search" label="Search" onClick={() => go('/search', 'up')} />
        </>
      }
    >
      <SegmentedButton
        label="Calendar view"
        value={[view]}
        onChange={([v]) => v && setView(v)}
        segments={[
          { value: 'days', label: 'Two weeks', icon: 'view_week' },
          { value: 'month', label: 'Month', icon: 'calendar_view_month' },
        ]}
      />

      {view === 'days' ? (
        <div className="dm-chips dm-day-chips" role="group" aria-label="Pick a day">
          {days.map((d) => (
            <FilterChip
              key={d}
              label={
                <span className="dm-day-chip">
                  {dayOfMonth(d)} {weekdayShort(d)}
                  {has(d) && <span className="dm-dot" />}
                </span>
              }
              selected={d === selected}
              onClick={() => select(d)}
              aria-label={`${longDay(d)}${has(d) ? ', has sessions' : ''}`}
            />
          ))}
        </div>
      ) : (
        <div className="dm-month dm-pop" role="grid" aria-label={monthName(selected)}>
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
            <span key={i} className="dm-month__head md-typescale-label-medium" aria-hidden>
              {d}
            </span>
          ))}
          {Array.from({ length: lead }, (_, i) => (
            <span key={`b${i}`} />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const d = `${monthStart.slice(0, 8)}${String(i + 1).padStart(2, '0')}`
            return (
              <button
                key={d}
                type="button"
                className={cx('dm-month__day md-state md-focus-ring', d === selected && 'dm-month__day--selected', d === TODAY && 'dm-month__day--today')}
                aria-label={`${longDay(d)}${has(d) ? ', has sessions' : ''}`}
                aria-pressed={d === selected}
                onClick={() => select(d)}
              >
                <span className="md-typescale-body-medium">{i + 1}</span>
                {has(d) && <span className="dm-dot" />}
              </button>
            )
          })}
        </div>
      )}

      <div className="dm-section-header">
        <button type="button" className="dm-day-link md-state md-focus-ring" onClick={() => go(`/calendar/${selected}`)}>
          <span className="dm-section-title md-typescale-title-large">{longDay(selected)}</span>
          <span className="dm-accent md-typescale-label-medium">Open day</span>
        </button>
        <button type="button" className="dm-link md-typescale-label-large md-state md-focus-ring" onClick={() => go(`/create?date=${selected}`, 'up')}>
          + Add
        </button>
      </div>

      <div key={selected} className="dm-enter">
        {daySessions.map((s, i) => {
          const h = hobby(s.hobbyId)
          return (
            <InfoRow
              key={s.id}
              style={stagger(i)}
              done={s.status === 'done'}
              leading={<HobbyGlyph hobbyId={h.id} icon={s.status === 'done' ? 'check' : h.icon} size={32} />}
              title={s.title}
              detail={`${clock(s.time)} · ${h.name}`}
              trailing={duration(s.minutes)}
              onClick={() => go(`/sessions/${s.id}`)}
            />
          )
        })}
        {daySessions.length === 0 && (
          <EmptyState
            icon="event_available"
            title="A free day"
            body={selected < TODAY ? 'Nothing was logged this day.' : 'Nothing planned yet. Add a session, or leave it open to rest.'}
            action={
              selected >= TODAY && (
                <Button variant="tonal" icon="add" onClick={() => go(`/create?date=${selected}`, 'up')}>
                  Add a session
                </Button>
              )
            }
          />
        )}
      </div>
    </Screen>
  )
}

type Filter = 'all' | 'planned' | 'done'

export function DayAgenda() {
  const { date = TODAY } = useParams()
  const { state, dispatch } = useStore()
  const { go } = useGo()
  const snack = useSnackbar()
  const [filter, setFilter] = useState<Filter>('all')
  const all = sessionsOn(state, date)
  const shown = all.filter((s) => filter === 'all' || s.status === filter)
  const total = all.reduce((m, s) => m + s.minutes, 0)
  const next = all.find((s) => s.status === 'planned')
  const hobby = (id: string) => state.hobbies.find((h) => h.id === id)!
  const groups = (['Morning', 'Afternoon', 'Evening'] as const).map((p) => ({ part: p, items: shown.filter((s) => partOfDay(s.time) === p) })).filter((g) => g.items.length)

  const toggle = (s: Session) => {
    if (s.status === 'done') {
      dispatch({ type: 'reopenSession', id: s.id })
      snack(`${s.title} moved back to planned`)
    } else {
      dispatch({ type: 'completeSession', id: s.id, minutes: s.minutes, at: s.time })
      snack(`${s.title} done · +${s.xp} XP`, { actionLabel: 'Undo', onAction: () => dispatch({ type: 'reopenSession', id: s.id }) })
    }
  }

  const rebalance = () => {
    const before = all.filter((s) => s.status === 'planned')
    dispatch({ type: 'rebalanceDay', date })
    snack('AI spaced your evening with 15-minute breathers', {
      actionLabel: 'Undo',
      onAction: () => before.forEach((s) => dispatch({ type: 'updateSession', session: s })),
    })
  }

  return (
    <Screen
      title={longDay(date)}
      subtitle={`${all.length} ${all.length === 1 ? 'session' : 'sessions'} · ${duration(total)}`}
      back={`/calendar?d=${date}`}
      actions={<IconButton icon="add" label="Add session" onClick={() => go(`/create?date=${date}`, 'up')} />}
    >
      <div className="dm-chips" role="group" aria-label="Filter sessions">
        <FilterChip label="All" selected={filter === 'all'} onClick={() => setFilter('all')} />
        <FilterChip label="Planned" selected={filter === 'planned'} onClick={() => setFilter('planned')} />
        <FilterChip label="Completed" selected={filter === 'done'} onClick={() => setFilter('done')} />
      </div>

      {groups.map((g) => (
        <section key={`${filter}-${g.part}`} className="dm-stack-8" aria-labelledby={`part-${g.part}`}>
          <SectionHeader id={`part-${g.part}`} title={g.part} />
          <div className="dm-enter">
            {g.items.map((s, i) => {
              const h = hobby(s.hobbyId)
              const isNext = s.id === next?.id
              return (
                <div key={s.id} className={cx('dm-agenda-row', s.status === 'done' && 'dm-agenda-row--done')} style={stagger(i)}>
                  <Checkbox
                    checked={s.status === 'done'}
                    onChange={() => toggle(s)}
                    aria-label={s.status === 'done' ? `Mark ${s.title} as not done` : `Mark ${s.title} as done`}
                  />
                  <InfoRow
                    title={s.title}
                    detail={`${clockRange(s.time, s.minutes)}${s.place ? ` · ${s.place}` : ''}`}
                    trailing={s.status === 'done' ? 'Done' : isNext ? 'Next' : duration(s.minutes)}
                    leading={<HobbyGlyph hobbyId={h.id} icon={h.icon} size={28} />}
                    onClick={() => go(isNext && date === TODAY ? `/sessions/${s.id}/practice` : `/sessions/${s.id}`, isNext && date === TODAY ? 'up' : 'forward')}
                    label={isNext && date === TODAY ? `Start ${s.title}` : undefined}
                  />
                </div>
              )
            })}
          </div>
        </section>
      ))}

      {shown.length === 0 && (
        <EmptyState
          icon={filter === 'done' ? 'hourglass_empty' : 'task_alt'}
          title={filter === 'done' ? 'Nothing finished yet' : filter === 'planned' ? 'Nothing left to do' : 'A free day'}
          body={filter === 'planned' ? 'Every session today is complete.' : 'Sessions you plan for this day show up here.'}
        />
      )}

      {all.some((s) => s.status === 'planned') && (
        <div className="dm-center">
          <Button variant="tonal" icon="auto_awesome" onClick={rebalance}>
            Ask AI to rebalance
          </Button>
        </div>
      )}
    </Screen>
  )
}
