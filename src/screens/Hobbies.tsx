import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AssistChip, Button, Dialog, FilterChip, HorizontalCard, Icon, IconButton, SearchBar, SegmentedButton, Tabs, TextField } from '../components'
import { TODAY, addDays, clock, duration, fullDay, monthName, dayOfMonth, relativeDay, shortDay } from '../app/dates'
import { stagger } from '../app/motion'
import { useGo } from '../app/nav'
import { Screen } from '../app/Screen'
import { useSnackbar } from '../app/snackbar'
import { byTime, useHobby, useStore } from '../app/store'
import type { Hobby } from '../app/types'
import { EmptyState, HobbyGlyph, HobbyMedia, InfoRow, Meter, SectionHeader } from '../app/ui'
import './screens.css'

type Filter = 'all' | 'active' | 'paused'

export function HobbyLibrary() {
  const { state } = useStore()
  const { go } = useGo()
  const [filter, setFilter] = useState<Filter>('active')
  const [query, setQuery] = useState('')
  const owned = state.hobbies.filter((h) => h.active || h.sessionsThisMonth > 0 || h.bestStreak > 0)
  const active = owned.filter((h) => h.active)
  const shown = owned.filter(
    (h) => (filter === 'all' || (filter === 'active') === h.active) && h.name.toLowerCase().includes(query.trim().toLowerCase()),
  )

  return (
    <Screen
      title="Hobby library"
      subtitle={`${active.length} active ${active.length === 1 ? 'hobby' : 'hobbies'}`}
      back={false}
      actions={<IconButton icon="search" label="Search everything" onClick={() => go('/search', 'up')} />}
    >
      <SearchBar
        placeholder="Search hobbies and activities"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        trailing={query && <IconButton icon="close" label="Clear search" onClick={() => setQuery('')} />}
      />
      <div className="dm-chips" role="group" aria-label="Filter hobbies">
        <FilterChip label="All" selected={filter === 'all'} onClick={() => setFilter('all')} />
        <FilterChip label="Active" selected={filter === 'active'} onClick={() => setFilter('active')} />
        <FilterChip label="Paused" selected={filter === 'paused'} onClick={() => setFilter('paused')} />
      </div>
      <div key={filter} className="dm-card-list dm-enter">
        {shown.map((h, i) => (
          <HorizontalCard
            key={h.id}
            style={stagger(i)}
            interactive
            role="link"
            aria-label={`${h.name}, ${h.statLine}`}
            onClick={() => go(`/hobbies/${h.id}`)}
            onKeyDown={(e) => e.key === 'Enter' && go(`/hobbies/${h.id}`)}
            variant={i === 0 && h.active ? 'filled' : 'outlined'}
            className={h.active ? undefined : 'dm-paused'}
            title={h.name}
            subhead={h.statLine}
            leading={<HobbyGlyph hobbyId={h.id} icon={h.icon} transitionName={`hobby-${h.id}`} />}
            media={<HobbyMedia hobby={h} />}
          />
        ))}
        {shown.length === 0 && (
          <EmptyState
            icon={query ? 'search_off' : 'pause_circle'}
            title={query ? `No hobby matches “${query}”` : 'Nothing paused'}
            body={query ? 'Try a shorter word, or check the other filters.' : 'Paused hobbies keep their streak history until you come back.'}
          />
        )}
      </div>
    </Screen>
  )
}

type MediaKind = 'video' | 'photos' | 'audio'
const mediaAccept: Record<MediaKind, string> = { video: 'video/*', photos: 'image/*', audio: 'audio/*' }

/** Practice clips live only for this visit (object URLs), which is enough to try the flow. */
function MediaJournal({ hobby, kind }: { hobby: Hobby; kind: MediaKind }) {
  const [items, setItems] = useState<Record<MediaKind, Array<{ url: string; name: string }>>>({ video: [], photos: [], audio: [] })
  const input = useRef<HTMLInputElement>(null)
  const list = items[kind]
  useEffect(() => () => Object.values(items).flat().forEach((i) => URL.revokeObjectURL(i.url)), []) // eslint-disable-line react-hooks/exhaustive-deps

  const add = (files: FileList | null) => {
    if (!files?.length) return
    setItems((prev) => ({ ...prev, [kind]: [...Array.from(files).map((f) => ({ url: URL.createObjectURL(f), name: f.name })), ...prev[kind]] }))
  }

  const noun = kind === 'photos' ? 'photo' : kind === 'video' ? 'video' : 'recording'
  return (
    <div className="dm-journal" role="tabpanel" aria-label={`${hobby.name} ${kind}`}>
      <input ref={input} type="file" accept={mediaAccept[kind]} multiple hidden onChange={(e) => add(e.target.files)} />
      {list.length === 0 ? (
        <button type="button" className="dm-journal__empty md-state md-focus-ring" onClick={() => input.current?.click()}>
          <Icon name={kind === 'video' ? 'videocam' : kind === 'photos' ? 'add_photo_alternate' : 'mic'} size={28} />
          <span className="md-typescale-label-large">Add a {noun}</span>
          <span className="md-typescale-body-small dm-muted">Hear and see how you’re improving over time.</span>
        </button>
      ) : (
        <div className="dm-journal__grid">
          {list.map((m) => (
            <figure key={m.url} className="dm-journal__item dm-pop">
              {kind === 'photos' && <img src={m.url} alt={m.name} />}
              {kind === 'video' && <video src={m.url} controls aria-label={m.name} />}
              {kind === 'audio' && <audio src={m.url} controls aria-label={m.name} />}
            </figure>
          ))}
          <button type="button" className="dm-journal__add md-state md-focus-ring" onClick={() => input.current?.click()} aria-label={`Add another ${noun}`}>
            <Icon name="add" />
          </button>
        </div>
      )}
    </div>
  )
}

export function HobbyDetail() {
  const { id } = useParams()
  const hobby = useHobby(id)
  const { state, dispatch } = useStore()
  const { go } = useGo()
  const snack = useSnackbar()
  const [tab, setTab] = useState<MediaKind>('video')
  const [editing, setEditing] = useState(false)
  const [goalTitle, setGoalTitle] = useState(hobby?.goal?.title ?? '')
  const [goalDate, setGoalDate] = useState(hobby?.goal?.target ?? addDays(TODAY, 42))

  if (!hobby) return <MissingScreen what="hobby" back="/hobbies" />
  const upcoming = state.sessions.filter((s) => s.hobbyId === hobby.id && s.status === 'planned' && s.date >= TODAY).sort(byTime)

  const togglePaused = () => {
    dispatch({ type: 'setHobbyActive', id: hobby.id, active: !hobby.active })
    snack(hobby.active ? `${hobby.name} paused · streak history kept` : `Welcome back to ${hobby.name}`, {
      actionLabel: 'Undo',
      onAction: () => dispatch({ type: 'setHobbyActive', id: hobby.id, active: hobby.active }),
    })
  }

  const saveGoal = () => {
    if (!goalTitle.trim()) return
    dispatch({
      type: 'updateGoal',
      hobbyId: hobby.id,
      goal: hobby.goal
        ? { ...hobby.goal, title: goalTitle.trim(), target: goalDate }
        : { title: goalTitle.trim(), target: goalDate, milestones: 4, progress: 0, horizonWeeks: 6, summary: goalTitle.trim() },
    })
    setEditing(false)
    snack('Goal updated')
  }

  return (
    <Screen
      title={hobby.name}
      subtitle={`${hobby.streak}-day streak · ${hobby.level}`}
      back="/hobbies"
      actions={
        <>
          <IconButton icon="insights" label={`${hobby.name} progress`} onClick={() => go(`/hobbies/${hobby.id}/progress`)} />
          <IconButton icon={hobby.active ? 'pause_circle' : 'play_circle'} label={hobby.active ? 'Pause hobby' : 'Resume hobby'} onClick={togglePaused} />
        </>
      }
    >
      <div className="dm-hobby-hero">
        <HobbyGlyph hobbyId={hobby.id} icon={hobby.icon} size={64} transitionName={`hobby-${hobby.id}`} />
        <p className="md-typescale-body-medium dm-muted">{hobby.category}</p>
      </div>

      <Tabs
        label="Practice journal"
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'video', label: 'Video' },
          { value: 'photos', label: 'Photos' },
          { value: 'audio', label: 'Audio' },
        ]}
      />
      <MediaJournal key={tab} hobby={hobby} kind={tab} />

      {hobby.goal && (
        <Meter
          label={hobby.goal.summary.split(' ').slice(-2).join(' ').replace(/^\w/, (c) => c.toUpperCase())}
          value={`${Math.round(hobby.goal.progress * 100)}%`}
          progress={hobby.goal.progress}
          onClick={() => go(`/hobbies/${hobby.id}/progress`)}
        />
      )}

      <div className="dm-chips">
        <AssistChip label={`${hobby.streak} day streak`} icon="local_fire_department" elevated />
        <AssistChip label={`${hobby.hoursThisMonth} hours`} icon="schedule" />
      </div>

      <SectionHeader title="Current goal" action={hobby.goal ? 'Edit goal' : 'Set a goal'} onAction={() => setEditing(true)} />
      {hobby.goal ? (
        <HorizontalCard
          variant="filled"
          title={hobby.goal.title}
          subhead={`Target: ${shortDay(hobby.goal.target)} · ${hobby.goal.milestones} milestones`}
          leading={<HobbyGlyph hobbyId={hobby.id} icon="flag" />}
          media={<HobbyMedia hobby={hobby} />}
        />
      ) : (
        <p className="md-typescale-body-medium dm-muted">A clear goal helps Daymark size your sessions. Try something you could finish in six weeks.</p>
      )}

      <SectionHeader title="Upcoming sessions" action="See all" onAction={() => go('/calendar', 'tab')} />
      <div className="dm-enter">
        {upcoming.map((s, i) => (
          <InfoRow
            key={s.id}
            style={stagger(i)}
            leading={<HobbyGlyph hobbyId={hobby.id} icon={hobby.icon} size={32} />}
            title={s.title}
            detail={`${relativeDay(s.date)} · ${clock(s.time)}`}
            trailing={duration(s.minutes)}
            onClick={() => go(`/sessions/${s.id}`)}
          />
        ))}
        {upcoming.length === 0 && (
          <EmptyState
            icon="event"
            title="No sessions planned"
            body={`Plan a ${hobby.name.toLowerCase()} session and it will appear here.`}
            action={
              <Button variant="tonal" icon="add" onClick={() => go(`/create?hobby=${hobby.id}`, 'up')}>
                Plan a session
              </Button>
            }
          />
        )}
      </div>

      <Dialog
        open={editing}
        onClose={() => setEditing(false)}
        headline={hobby.goal ? 'Edit goal' : 'Set a goal'}
        actions={
          <>
            <Button variant="text" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            <Button variant="text" onClick={saveGoal} disabled={!goalTitle.trim()}>
              Save
            </Button>
          </>
        }
      >
        <TextField label="Goal" value={goalTitle} onChange={(e) => setGoalTitle(e.target.value)} error={!goalTitle.trim()} supportingText={goalTitle.trim() ? undefined : 'Describe what “done” looks like'} />
        <TextField label="Target date" type="date" value={goalDate} min={TODAY} onChange={(e) => setGoalDate(e.target.value)} supportingText={fullDay(goalDate)} />
      </Dialog>
    </Screen>
  )
}

export function HobbyProgress() {
  const { id } = useParams()
  const hobby = useHobby(id)
  const { state } = useStore()
  const [range, setRange] = useState<'week' | 'month' | 'quarter'>('month')
  const [metric, setMetric] = useState<'hours' | 'sessions' | 'completion'>('hours')
  if (!hobby) return <MissingScreen what="hobby" back="/progress" />

  const days = range === 'week' ? 7 : range === 'month' ? 30 : 90
  const from = addDays(TODAY, -(days - 1))
  const scale = days / 30
  const history = state.sessions.filter((s) => s.hobbyId === hobby.id && s.status === 'done').sort((a, b) => byTime(b, a))
  const weekDone = state.sessions.filter((s) => s.hobbyId === hobby.id && s.status === 'done' && s.date > addDays(TODAY, -7)).length
  const hours = Math.round(hobby.hoursThisMonth * scale * 10) / 10
  const sessions = Math.round(hobby.sessionsThisMonth * 3 * scale)
  const completion = Math.round(hobby.consistency * 100 - (range === 'quarter' ? 4 : 0))

  return (
    <Screen title={`${hobby.name} progress`} subtitle={`${monthName(from)} ${dayOfMonth(from)} – ${monthName(TODAY)} ${dayOfMonth(TODAY)}`} back={`/hobbies/${hobby.id}`}>
      <SegmentedButton
        label="Time range"
        value={[range]}
        onChange={([v]) => v && setRange(v)}
        segments={[
          { value: 'week', label: 'Week' },
          { value: 'month', label: 'Month' },
          { value: 'quarter', label: '3 months' },
        ]}
      />
      <div className="dm-chips" role="group" aria-label="Highlight a metric">
        <FilterChip label={`${hours} hours`} selected={metric === 'hours'} onClick={() => setMetric('hours')} />
        <FilterChip label={`${sessions} sessions`} selected={metric === 'sessions'} onClick={() => setMetric('sessions')} />
        <FilterChip label={`${completion}% completed`} selected={metric === 'completion'} onClick={() => setMetric('completion')} />
      </div>
      <SectionHeader title="Consistency" />
      <div className="dm-stack-16 dm-enter">
        <div style={stagger(0)}>
          <Meter label={hobby.name} value={`${hobby.streak} day streak`} progress={Math.min(1, hobby.streak / Math.max(hobby.bestStreak, 14))} />
        </div>
        <div style={stagger(1)}>
          <Meter label="Weekly target" value={`${weekDone} of ${state.preferences.weeklyTarget} sessions`} progress={weekDone / state.preferences.weeklyTarget} />
        </div>
        {hobby.goal && (
          <div style={stagger(2)}>
            <Meter label="Goal progress" value={`${Math.round(hobby.goal.progress * 100)}%`} progress={hobby.goal.progress} />
          </div>
        )}
      </div>
      <SectionHeader title="Recent history" />
      <div className="dm-enter">
        {history.slice(0, 6).map((s, i) => (
          <InfoRow
            key={s.id}
            style={stagger(i)}
            leading={<HobbyGlyph hobbyId={hobby.id} icon="check" size={32} />}
            title={s.title}
            detail={`${shortDay(s.date)} · ${duration(s.minutes)} · ${s.feeling === 'right' ? 'Great focus' : s.feeling === 'hard' ? 'Challenging' : s.feeling === 'easy' ? 'Felt easy' : 'Completed'}`}
            trailing={`+${s.xp} XP`}
          />
        ))}
        {history.length === 0 && <p className="md-typescale-body-medium dm-muted">Finished sessions appear here with their XP.</p>}
      </div>
    </Screen>
  )
}

export function MissingScreen({ what, back }: { what: string; back: string }) {
  const { go } = useGo()
  return (
    <Screen title="Not found" back={back}>
      <EmptyState
        icon="explore_off"
        title={`That ${what} isn’t here`}
        body="It may have been removed, or the link is out of date."
        action={
          <Button variant="tonal" onClick={() => go(back, 'back')}>
            Go back
          </Button>
        }
      />
    </Screen>
  )
}
