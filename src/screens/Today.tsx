import { AssistChip, Avatar, Button, CountUp, Fab, IconButton } from '../components'
import { TODAY, clock, duration, weekday } from '../app/dates'
import { stagger } from '../app/motion'
import { useGo } from '../app/nav'
import { Screen } from '../app/Screen'
import { sessionsOn, useStore } from '../app/store'
import { EmptyState, HobbyGlyph, InfoRow, Meter, SectionHeader, SessionCard } from '../app/ui'
import './screens.css'

export function Today() {
  const { state } = useStore()
  const { go } = useGo()
  const today = sessionsOn(state, TODAY)
  const done = today.filter((s) => s.status === 'done')
  const planned = today.filter((s) => s.status === 'planned')
  const hobby = (id: string) => state.hobbies.find((h) => h.id === id)!
  const streak = Math.max(...state.hobbies.filter((h) => h.active).map((h) => h.streak), 0)
  const first = state.profile.name.split(' ')[0]
  const initials = state.profile.name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)

  return (
    <Screen
      title={`Good morning, ${first}`}
      subtitle={`${weekday(TODAY)} · ${planned.length ? `${planned.length} ${planned.length === 1 ? 'session' : 'sessions'} planned` : 'all sessions done'}`}
      back={false}
      actions={
        <>
          <IconButton icon="search" label="Search" onClick={() => go('/search', 'up')} />
          <button type="button" className="dm-avatar-button md-state md-focus-ring" aria-label="Profile" onClick={() => go('/profile')}>
            <Avatar initials={initials} size={32} />
          </button>
        </>
      }
    >
      <Meter
        label="Today’s momentum"
        value={`${done.length} of ${today.length} complete`}
        progress={today.length ? done.length / today.length : 0}
        onClick={() => go(`/calendar/${TODAY}`)}
      />

      <div className="dm-chips">
        <AssistChip label={`${streak} day streak`} icon="local_fire_department" elevated onClick={() => go('/rewards')} />
        <AssistChip
          label={
            <>
              <CountUp value={state.profile.weekXp} /> XP this week
            </>
          }
          icon="bolt"
          onClick={() => go('/rewards')}
        />
      </div>

      <SectionHeader title="Up next" action="View agenda" onAction={() => go(`/calendar/${TODAY}`)} />
      {planned.length ? (
        <div className="dm-card-list dm-enter">
          {planned.map((s, i) => {
            const h = hobby(s.hobbyId)
            return (
              <SessionCard
                key={s.id}
                style={stagger(i)}
                hobby={h}
                variant={i === 0 ? 'filled' : 'outlined'}
                title={`${h.name} · ${s.title}`}
                subhead={`${clock(s.time)} · ${duration(s.minutes)} · ${s.focusNote ?? `${s.tasks.length} tasks`}`}
                onOpen={() => go(`/sessions/${s.id}`)}
                onStart={i === 0 ? () => go(`/sessions/${s.id}/practice`, 'up') : undefined}
              />
            )
          })}
        </div>
      ) : (
        <EmptyState
          icon="celebration"
          title="Everything’s done for today"
          body="That’s a full day of small wins. Plan something for tomorrow while you’re in the rhythm."
          action={
            <Button variant="tonal" icon="add" onClick={() => go('/create')}>
              Plan tomorrow
            </Button>
          }
        />
      )}

      <SectionHeader title="Daily wins" action="See all" onAction={() => go('/progress')} />
      {done.length ? (
        <div className="dm-enter">
          {done.map((s, i) => {
            const h = hobby(s.hobbyId)
            return (
              <InfoRow
                key={s.id}
                style={stagger(i)}
                leading={<HobbyGlyph hobbyId={h.id} icon={h.icon} size={32} />}
                title={s.title}
                detail={`${s.focusNote ?? duration(s.minutes)} · completed at ${clock(s.completedAt ?? s.time)}`}
                trailing={`+${s.xp} XP`}
                onClick={() => go(`/sessions/${s.id}`)}
              />
            )
          })}
        </div>
      ) : (
        <p className="md-typescale-body-medium dm-muted">Finish a session and it lands here with its XP.</p>
      )}

      <div className="dm-fab-anchor">
        <Fab icon="add" label="Plan" extended onClick={() => go('/create', 'up')} />
      </div>
    </Screen>
  )
}
