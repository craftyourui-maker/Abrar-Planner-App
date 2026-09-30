import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button, Checkbox, CircularProgress, CountUp, Dialog, FilterChip, HorizontalCard, Icon, IconButton, SegmentedButton, TextField } from '../components'
import { cx } from '../components/cx'
import { TODAY, clock, duration, fullDay, longDay } from '../app/dates'
import { useDraft } from '../app/draft'
import { stagger } from '../app/motion'
import { useGo } from '../app/nav'
import { Screen } from '../app/Screen'
import { xpFor } from '../app/seed'
import { useSnackbar } from '../app/snackbar'
import { nextTask, uid, useHobby, useSession, useStore } from '../app/store'
import type { Feeling, Session, Task } from '../app/types'
import { HobbyGlyph, HobbyMedia, InfoRow, Meter, SectionHeader } from '../app/ui'
import { MissingScreen } from './Hobbies'
import './screens.css'

const reminderLabel = (m: number) => (m === 0 ? 'None' : m === 60 ? '1 hour' : `${m} min`)

export function EditSession() {
  const { id } = useParams()
  const original = useSession(id)
  const hobby = useHobby(original?.hobbyId)
  const { dispatch } = useStore()
  const { go, back } = useGo()
  const snack = useSnackbar()
  const [s, setS] = useState<Session | undefined>(original)
  const [editing, setEditing] = useState<'when' | 'duration' | string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [newTaskId, setNewTaskId] = useState<string | null>(null)

  if (!original || !s || !hobby) return <MissingScreen what="session" back="/calendar" />
  const dirty = JSON.stringify(s) !== JSON.stringify(original)
  const taskMinutes = s.tasks.reduce((m, t) => m + t.minutes, 0)
  const set = (patch: Partial<Session>) => setS((prev) => prev && { ...prev, ...patch })
  const setTask = (tid: string, patch: Partial<Task>) => set({ tasks: s.tasks.map((t) => (t.id === tid ? { ...t, ...patch } : t)) })

  const save = () => {
    if (!s.title.trim()) return
    dispatch({ type: 'updateSession', session: { ...s, title: s.title.trim(), xp: s.status === 'done' ? s.xp : xpFor(s.minutes) } })
    back(`/calendar/${s.date}`)
    snack('Changes saved')
  }

  const remove = () => {
    dispatch({ type: 'deleteSession', id: s.id })
    setConfirmDelete(false)
    back(`/calendar/${s.date}`)
    snack(`${original.title} deleted`, { actionLabel: 'Undo', onAction: () => dispatch({ type: 'addSession', session: original }) })
  }

  const addTask = () => {
    const t: Task = { id: uid('t'), title: '', detail: 'New task', minutes: 5, done: false }
    setNewTaskId(t.id)
    set({ tasks: [...s.tasks, t] })
    setEditing(t.id)
  }

  return (
    <Screen
      title={s.status === 'done' ? 'Session details' : 'Edit session'}
      subtitle={`${hobby.name} · ${original.title}`}
      back={`/calendar/${s.date}`}
      actions={
        <>
          {s.status === 'planned' && <IconButton icon="play_arrow" label="Start session" onClick={() => go(`/sessions/${s.id}/practice`, 'up')} />}
          <IconButton icon="delete" label="Delete session" onClick={() => setConfirmDelete(true)} />
        </>
      }
      footer={
        <Button onClick={save} disabled={!dirty || !s.title.trim()}>
          {dirty ? 'Save changes' : 'No changes yet'}
        </Button>
      }
    >
      <TextField label="Session title" value={s.title} onChange={(e) => set({ title: e.target.value })} error={!s.title.trim()} supportingText={s.title.trim() ? undefined : 'A title helps you spot it on your calendar'} />

      <div>
        <InfoRow
          leading={<Icon name="event" />}
          overline="Date and time"
          title={`${longDay(s.date)} · ${clock(s.time)}`}
          trailing={editing === 'when' ? 'Done' : 'Edit'}
          onClick={() => setEditing(editing === 'when' ? null : 'when')}
          label="Edit date and time"
        />
        {editing === 'when' && (
          <div className="dm-inline-editor dm-pop">
            <div className="dm-inline-editor__row">
              <TextField label="Date" type="date" value={s.date} onChange={(e) => e.target.value && set({ date: e.target.value })} />
              <TextField label="Start" type="time" value={s.time} onChange={(e) => e.target.value && set({ time: e.target.value })} />
            </div>
          </div>
        )}
        <InfoRow
          leading={<Icon name="timer" />}
          overline="Duration"
          title={taskMinutes === s.minutes ? `AI recommends ${duration(taskMinutes)}` : `Tasks add up to ${duration(taskMinutes)}`}
          trailing={duration(s.minutes)}
          onClick={() => setEditing(editing === 'duration' ? null : 'duration')}
          label={`Edit duration, currently ${duration(s.minutes)}`}
        />
        {editing === 'duration' && (
          <div className="dm-inline-editor dm-pop">
            <SegmentedButton
              label="Duration"
              value={[String(s.minutes)]}
              onChange={([v]) => v && set({ minutes: Number(v) })}
              segments={[...new Set([20, 30, 45, 60, taskMinutes])].sort((a, b) => a - b).slice(0, 5).map((m) => ({ value: String(m), label: `${m}m` }))}
            />
          </div>
        )}
      </div>

      <SectionHeader title="Reminder" />
      <div className="dm-chips" role="group" aria-label="Reminder">
        {([0, 10, 30, 60] as const).map((m) => (
          <FilterChip key={m} label={reminderLabel(m)} selected={s.reminder === m} onClick={() => set({ reminder: m })} />
        ))}
      </div>

      <SectionHeader title="Tasks" />
      <ul className="dm-plain-list">
        {s.tasks.map((t) => (
          <li key={t.id} className={cx('dm-agenda-row', newTaskId === t.id && 'dm-pop')}>
            <Checkbox checked={t.done} onChange={(e) => setTask(t.id, { done: e.target.checked })} aria-label={`${t.title || 'New task'} done`} />
            {editing === t.id ? (
              <div className="dm-task-editor">
                <TextField label="Task" value={t.title} autoFocus onChange={(e) => setTask(t.id, { title: e.target.value })} />
                <div className="dm-task-editor__row">
                  <TextField label="Minutes" type="number" min={1} max={120} value={String(t.minutes)} onChange={(e) => setTask(t.id, { minutes: Math.max(1, Number(e.target.value) || 1) })} />
                  <IconButton
                    icon="delete"
                    label="Remove task"
                    onClick={() => {
                      set({ tasks: s.tasks.filter((x) => x.id !== t.id) })
                      setEditing(null)
                    }}
                  />
                  <IconButton icon="check" variant="tonal" label="Done editing" onClick={() => setEditing(null)} disabled={!t.title.trim()} />
                </div>
              </div>
            ) : (
              <InfoRow title={t.title || 'Untitled task'} detail={`${t.detail} · ${t.minutes} min`} trailing="Edit" done={t.done} onClick={() => setEditing(t.id)} label={`Edit ${t.title}`} />
            )}
          </li>
        ))}
      </ul>
      <div className="dm-center">
        <Button variant="tonal" icon="add" onClick={addTask}>
          Add task
        </Button>
      </div>

      <Dialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        icon="delete"
        headline="Delete this session?"
        actions={
          <>
            <Button variant="text" onClick={() => setConfirmDelete(false)}>
              Keep it
            </Button>
            <Button variant="text" onClick={remove}>
              Delete
            </Button>
          </>
        }
      >
        <p>
          {original.title} on {fullDay(original.date)} will be removed from your plan. You can undo right after.
        </p>
      </Dialog>
    </Screen>
  )
}

const pad = (n: number) => String(n).padStart(2, '0')
const mmss = (sec: number) => `${pad(Math.floor(Math.max(0, sec) / 60))}:${pad(Math.max(0, sec) % 60)}`

export function Practice() {
  const { id } = useParams()
  const session = useSession(id)
  const hobby = useHobby(session?.hobbyId)
  const { dispatch } = useStore()
  const { go, back } = useGo()
  // Elapsed time survives leaving and coming back to the session.
  const [timer, setTimer] = useDraft(`practice-${id}`, () => ({ elapsed: 0, running: true }))
  const [confirmLeave, setConfirmLeave] = useState(false)

  useEffect(() => {
    if (!timer.running) return
    const t = setInterval(() => setTimer((x) => ({ ...x, elapsed: x.elapsed + 1 })), 1000)
    return () => clearInterval(t)
  }, [timer.running, setTimer])

  if (!session || !hobby) return <MissingScreen what="session" back="/" />
  const total = session.minutes * 60
  const remaining = total - timer.elapsed
  const doneCount = session.tasks.filter((t) => t.done).length
  const current = nextTask(session.tasks)
  const doneMinutes = session.tasks.filter((t) => t.done).reduce((m, t) => m + t.minutes, 0)
  const currentLeft = current ? Math.max(0, doneMinutes + current.minutes - Math.floor(timer.elapsed / 60)) : 0
  const pace = timer.elapsed / 60 <= doneMinutes + (current?.minutes ?? 0) ? 'On pace' : 'Running over'

  const finish = () => {
    const minutes = Math.max(5, Math.round(timer.elapsed / 60), doneMinutes)
    const now = new Date()
    dispatch({ type: 'completeSession', id: session.id, minutes, at: `${pad(now.getHours())}:${pad(now.getMinutes())}` })
    setTimer({ elapsed: 0, running: false })
    go(`/sessions/${session.id}/done`, 'up', { replace: true })
  }

  const completeTask = (t: Task) => dispatch({ type: 'setTaskDone', sessionId: session.id, taskId: t.id, done: !t.done })

  return (
    <Screen
      title={`${hobby.name} practice`}
      subtitle={session.title}
      back="/"
      leading={<IconButton icon="arrow_back" label="Leave session" onClick={() => (timer.elapsed > 0 ? setConfirmLeave(true) : back('/'))} />}
      className="dm-practice"
      footer={
        <div className="dm-practice__controls">
          <Button variant="tonal" icon={timer.running ? 'pause' : 'play_arrow'} onClick={() => setTimer((x) => ({ ...x, running: !x.running }))}>
            {timer.running ? 'Pause' : timer.elapsed ? 'Resume' : 'Start'}
          </Button>
          <Button icon="flag" onClick={finish}>
            Finish
          </Button>
        </div>
      }
    >
      <div className={cx('dm-practice__ring', !timer.running && 'dm-practice__ring--paused')}>
        <CircularProgress value={Math.min(1, timer.elapsed / total)} size={216} thickness={22} wave={timer.running} label="Session time">
          <span className="dm-practice__time md-typescale-display-medium" aria-hidden>
            {remaining >= 0 ? mmss(remaining) : `+${mmss(-remaining)}`}
          </span>
          <span className="md-typescale-label-medium dm-muted">{remaining >= 0 ? 'left' : 'over time'}</span>
        </CircularProgress>
      </div>
      <p className="dm-practice__status md-typescale-label-large" aria-live="polite">
        {doneCount} of {session.tasks.length} tasks · {timer.running ? pace : 'Paused'}
      </p>
      <span className="md-visually-hidden" aria-live="polite">
        {Math.floor(Math.max(0, remaining) / 60)} minutes left
      </span>

      <ul className="dm-plain-list dm-enter">
        {session.tasks.map((t, i) => {
          const isCurrent = t.id === current?.id
          return (
            <li key={t.id} style={stagger(i)} className={cx('dm-agenda-row dm-practice__task', isCurrent && 'dm-practice__task--current', t.done && 'dm-practice__task--done')}>
              <Checkbox checked={t.done} onChange={() => completeTask(t)} aria-label={`${t.title} done`} />
              <InfoRow
                title={t.title}
                detail={t.done ? `Completed · ${t.minutes} min` : isCurrent ? `Current task · ${currentLeft} min left` : `${t.detail} · ${t.minutes} min`}
                trailing={t.done ? 'Done' : isCurrent ? 'Now' : `${t.minutes} min`}
                active={isCurrent}
              />
            </li>
          )
        })}
      </ul>

      <Dialog
        open={confirmLeave}
        onClose={() => setConfirmLeave(false)}
        icon="timer_pause"
        headline="Pause and leave?"
        actions={
          <>
            <Button variant="text" onClick={() => setConfirmLeave(false)}>
              Stay
            </Button>
            <Button
              variant="text"
              onClick={() => {
                setTimer((x) => ({ ...x, running: false }))
                setConfirmLeave(false)
                back('/')
              }}
            >
              Pause and leave
            </Button>
          </>
        }
      >
        <p>Your {mmss(timer.elapsed)} of practice is kept. Come back from Today to pick up where you left off.</p>
      </Dialog>
    </Screen>
  )
}

const feelings: Array<{ id: Feeling; label: string }> = [
  { id: 'easy', label: 'Too easy' },
  { id: 'right', label: 'Just right' },
  { id: 'hard', label: 'Challenging' },
]

/** Twelve sparks around the ring; angles and distances are fixed so the burst is calm, not random. */
function Burst() {
  const sparks = useMemo(() => Array.from({ length: 12 }, (_, i) => ({ angle: i * 30 + (i % 2) * 12, dist: 108 + (i % 3) * 14, delay: (i % 4) * 40 })), [])
  return (
    <span className="dm-burst" aria-hidden>
      {sparks.map((s, i) => (
        <span
          key={i}
          className={cx('dm-burst__spark', i % 3 === 0 && 'dm-burst__spark--tertiary', i % 3 === 1 && 'dm-burst__spark--round')}
          style={{ '--angle': `${s.angle}deg`, '--dist': `${s.dist}px`, animationDelay: `${300 + s.delay}ms` } as React.CSSProperties}
        />
      ))}
    </span>
  )
}

export function NiceWork() {
  const { id } = useParams()
  const session = useSession(id)
  const hobby = useHobby(session?.hobbyId)
  const { state, dispatch } = useStore()
  const { go } = useGo()
  const snack = useSnackbar()
  const [feeling, setFeeling] = useState<Feeling | undefined>(session?.feeling ?? 'right')
  const [note, setNote] = useState(session?.note ?? '')
  const [ringDone, setRingDone] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setRingDone(true), 150)
    return () => clearTimeout(t)
  }, [])

  if (!session || !hobby) return <MissingScreen what="session" back="/" />
  const reward = state.trophies.find((t) => t.isNew && t.status === 'unlocked' && t.unlockedOn === session.date) ?? state.trophies.find((t) => t.id === 'steady-hands')!
  const goal = hobby.goal

  const save = () => {
    dispatch({ type: 'reflect', id: session.id, feeling, note: note.trim() })
    go('/', 'down', { replace: true })
    snack(`Reflection saved · ${hobby.streak}-day ${hobby.name.toLowerCase()} streak`)
  }

  return (
    <Screen
      title="Nice work!"
      subtitle={
        <>
          {hobby.name} practice completed · +<CountUp value={session.xp} from={0} duration={1200} /> XP
        </>
      }
      back="/"
      footer={<Button onClick={save}>Save reflection</Button>}
      className="dm-celebrate"
    >
      <div className="dm-celebrate__hero">
        <div className="dm-celebrate__ring">
          <Burst />
          <CircularProgress value={ringDone ? 1 : 0} size={136} thickness={14} wave label="Session complete">
            <Icon name="star" filled size={44} className="dm-celebrate__star" />
          </CircularProgress>
        </div>
        <h2 className="dm-display dm-celebrate__title md-typescale-headline-large">Streak extended!</h2>
        <p className="md-typescale-body-medium dm-muted">
          You practiced {hobby.name.toLowerCase()} for {duration(session.minutes)} and reached a {hobby.streak}-day streak.
        </p>
      </div>

      {goal && <Meter label={goal.title.replace(/^Play /, '').replace(/ end to end$/, '') + ' goal'} value={`${Math.round(goal.progress * 100)}% · +6%`} progress={goal.progress} />}

      <div className="dm-stack-12">
        <SectionHeader title="How did it feel?" />
        <div className="dm-chips" role="group" aria-label="How did it feel?">
          {feelings.map((f) => (
            <FilterChip key={f.id} label={f.label} selected={feeling === f.id} onClick={() => setFeeling(feeling === f.id ? undefined : f.id)} />
          ))}
        </div>
      </div>

      <TextField
        label="A note for next time"
        placeholder="What clicked? What to try next?"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        supportingText={feeling === 'hard' ? 'Daymark will shorten the next session’s hardest task.' : feeling === 'easy' ? 'Daymark will add a stretch task next time.' : undefined}
      />

      <HorizontalCard
        variant="filled"
        className="dm-reward-card"
        title={`Reward earned · ${reward.name}`}
        subhead={`${reward.description.replace(/\.$/, '')} · +${session.xp} XP`}
        leading={<HobbyGlyph hobbyId={hobby.id} icon={reward.icon} />}
        media={<HobbyMedia hobby={{ id: hobby.id, icon: 'workspace_premium' }} />}
        interactive
        onClick={() => go('/rewards/trophies')}
        onKeyDown={(e) => e.key === 'Enter' && go('/rewards/trophies')}
        role="link"
        aria-label={`Reward earned: ${reward.name}. View trophies`}
      />
      {session.date !== TODAY && <p className="md-typescale-body-small dm-muted">Logged for {fullDay(session.date)}.</p>}
    </Screen>
  )
}
