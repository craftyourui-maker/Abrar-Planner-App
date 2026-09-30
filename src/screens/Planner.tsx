import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button, Checkbox, CircularProgress, FilterChip, HorizontalCard, Icon, IconButton, SegmentedButton, TextField } from '../components'
import { breakdown, effortFor, minutesIn } from '../app/ai'
import { TODAY, addDays, clock, duration, fullDay, parse, shortDay } from '../app/dates'
import { clearDraft, useDraft } from '../app/draft'
import { stagger } from '../app/motion'
import { useGo } from '../app/nav'
import { Screen } from '../app/Screen'
import { xpFor } from '../app/seed'
import { useSnackbar } from '../app/snackbar'
import { uid, useStore } from '../app/store'
import type { Session, Task } from '../app/types'
import { HobbyGlyph, HobbyMedia, InfoRow, Meter, SectionHeader } from '../app/ui'
import './screens.css'

interface PlannerDraft {
  hobbyName: string
  title: string
  date: string
  time: string
  minutes: number
  energy: 'low' | 'medium' | 'high'
  request: string
  variant: number
}

const nextSaturday = () => {
  const dow = parse(TODAY).getDay() // 0 Sun … 6 Sat
  return addDays(TODAY, (6 - dow + 7) % 7 || 7)
}

function usePlanner() {
  const [params] = useSearchParams()
  return useDraft<PlannerDraft>('planner', () => ({
    hobbyName: params.get('hobby') ? params.get('hobby')!.replace(/^\w/, (c) => c.toUpperCase()) : 'Guitar',
    title: 'Practice fingerstyle transitions',
    date: params.get('date') ?? TODAY,
    time: '18:30',
    minutes: 35,
    energy: 'medium',
    request: 'Improve smooth chord changes in 45 minutes.',
    variant: 0,
  }))
}

function useMatchedHobby(name: string) {
  const { state } = useStore()
  return state.hobbies.find((h) => h.name.toLowerCase() === name.trim().toLowerCase())
}

function Busy({ label }: { label: string }) {
  return (
    <span className="dm-busy">
      <CircularProgress size={18} thickness={2.5} label={label} />
      {label}
    </span>
  )
}

export function CreateActivity() {
  const { state, dispatch } = useStore()
  const { go, back } = useGo()
  const snack = useSnackbar()
  const [params] = useSearchParams()
  const [draft, update] = usePlanner()
  const [editingWhen, setEditingWhen] = useState(false)
  const [tried, setTried] = useState(false)
  const hobby = useMatchedHobby(draft.hobbyName)

  // Arriving with ?date= or ?hobby= always wins over an older draft.
  useEffect(() => {
    const date = params.get('date')
    const h = params.get('hobby')
    if (date) update({ date })
    if (h) update({ hobbyName: state.hobbies.find((x) => x.id === h)?.name ?? draft.hobbyName })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const when = draft.date === TODAY ? 'today' : draft.date === addDays(TODAY, 1) ? 'tomorrow' : draft.date === nextSaturday() ? 'weekend' : 'custom'
  const hobbyError = tried && !hobby ? (draft.hobbyName.trim() ? `Add ${draft.hobbyName.trim()} in your hobby library first, or pick one below` : 'Choose a hobby') : undefined
  const titleError = tried && !draft.title.trim() ? 'Give the activity a short name' : undefined

  const create = () => {
    setTried(true)
    if (!hobby || !draft.title.trim()) return
    const tasks: Task[] = state.settings.autoBreakdown
      ? breakdown(hobby.id, `${draft.minutes} min`, 0, draft.minutes)
      : [{ id: uid('t'), title: draft.title.trim(), detail: 'Your plan', minutes: draft.minutes, done: false }]
    const session: Session = {
      id: uid('s'),
      hobbyId: hobby.id,
      title: draft.title.trim(),
      date: draft.date,
      time: draft.time,
      minutes: draft.minutes,
      tasks,
      status: 'planned',
      energy: draft.energy,
      reminder: state.settings.sessionReminders ? state.settings.reminderLead : 0,
      xp: xpFor(draft.minutes),
    }
    dispatch({ type: 'addSession', session })
    clearDraft('planner')
    go(`/calendar/${draft.date}`, 'down', { replace: true })
    snack(`Added to ${shortDay(draft.date)}${state.settings.autoBreakdown ? ` · ${tasks.length} AI tasks` : ''}`, {
      actionLabel: 'Undo',
      onAction: () => dispatch({ type: 'deleteSession', id: session.id }),
    })
  }

  return (
    <Screen
      title="Create activity"
      subtitle="Add a focused session to your plan"
      back="/"
      leading={<IconButton icon="close" label="Close" onClick={() => back('/')} />}
      footer={<Button onClick={create}>Create activity</Button>}
    >
      <div className="dm-stack-12">
        <TextField
          label="Hobby"
          value={draft.hobbyName}
          onChange={(e) => update({ hobbyName: e.target.value })}
          leadingIcon={hobby?.icon ?? 'interests'}
          error={!!hobbyError}
          supportingText={hobbyError}
          trailing={draft.hobbyName && <IconButton icon="cancel" label="Clear hobby" onClick={() => update({ hobbyName: '' })} />}
        />
        {!hobby && (
          <div className="dm-chips dm-pop" role="group" aria-label="Your hobbies">
            {state.hobbies
              .filter((h) => h.active)
              .map((h) => (
                <FilterChip key={h.id} label={h.name} icon={h.icon} onClick={() => update({ hobbyName: h.name })} />
              ))}
          </div>
        )}
        <TextField label="Activity name" value={draft.title} onChange={(e) => update({ title: e.target.value })} error={!!titleError} supportingText={titleError} />
      </div>

      <div className="dm-stack-12">
        <SectionHeader title="When" />
        <div className="dm-chips" role="group" aria-label="When">
          <FilterChip label="Today" selected={when === 'today'} onClick={() => update({ date: TODAY })} />
          <FilterChip label="Tomorrow" selected={when === 'tomorrow'} onClick={() => update({ date: addDays(TODAY, 1) })} />
          <FilterChip label="This weekend" selected={when === 'weekend'} onClick={() => update({ date: nextSaturday() })} />
        </div>
        <InfoRow
          leading={<Icon name="event" />}
          overline={fullDay(draft.date)}
          title={`${clock(draft.time)} · ${duration(draft.minutes)}`}
          trailing={editingWhen ? 'Done' : 'Edit'}
          onClick={() => setEditingWhen((v) => !v)}
          label={editingWhen ? 'Done editing date and time' : `Edit date and time, currently ${fullDay(draft.date)} at ${clock(draft.time)} for ${duration(draft.minutes)}`}
        />
        {editingWhen && (
          <div className="dm-inline-editor dm-pop">
            <div className="dm-inline-editor__row">
              <TextField label="Date" type="date" min={TODAY} value={draft.date} onChange={(e) => e.target.value && update({ date: e.target.value })} />
              <TextField label="Start" type="time" value={draft.time} onChange={(e) => e.target.value && update({ time: e.target.value })} />
            </div>
            <SegmentedButton
              label="Duration"
              value={[String(draft.minutes)]}
              onChange={([v]) => v && update({ minutes: Number(v) })}
              segments={['20', '35', '45', '60'].map((m) => ({ value: m, label: `${m}m` }))}
            />
          </div>
        )}
      </div>

      <div className="dm-stack-12">
        <SectionHeader title="Energy" />
        <div className="dm-chips" role="group" aria-label="Energy">
          {(['low', 'medium', 'high'] as const).map((e) => (
            <FilterChip key={e} label={e[0].toUpperCase() + e.slice(1)} selected={draft.energy === e} onClick={() => update({ energy: e })} />
          ))}
        </div>
      </div>

      <div className="dm-center">
        <Button
          variant="tonal"
          icon="auto_awesome"
          onClick={() => {
            setTried(true)
            if (hobby) go('/plan', 'forward')
          }}
        >
          Define tasks with AI
        </Button>
      </div>
    </Screen>
  )
}

const tryAdding = [
  { label: 'My current level', text: (level: string) => ` I’m ${level.toLowerCase()}.` },
  { label: 'Available equipment', text: () => ' I have a metronome and a capo.' },
  { label: 'Desired difficulty', text: () => ' Keep it challenging but doable.' },
  { label: 'A warm-up', text: () => ' Start with a short warm-up.' },
]

export function PlanWithAI() {
  const { go } = useGo()
  const [draft, update] = usePlanner()
  const hobby = useMatchedHobby(draft.hobbyName)
  const [busy, setBusy] = useState(false)
  const [used, setUsed] = useState<string[]>([])
  const minutes = minutesIn(draft.request)

  const generate = () => {
    if (!draft.request.trim()) return
    setBusy(true)
    setTimeout(() => go('/plan/review', 'forward'), 900)
  }

  return (
    <Screen
      title="Plan with AI"
      subtitle="Turn an idea into a focused activity"
      back="/create"
      footer={
        <Button onClick={generate} disabled={busy || !draft.request.trim()} icon={busy ? undefined : 'auto_awesome'}>
          {busy ? <Busy label="Planning…" /> : 'Generate plan'}
        </Button>
      }
    >
      <div className="dm-intro">
        <span className="dm-tag md-typescale-label-large">
          <Icon name="auto_awesome" size={18} filled />
          AI planner
        </span>
        <p className="md-typescale-body-medium dm-muted">Describe the outcome, time, and energy you have.</p>
      </div>
      <TextField
        label="What do you want to do?"
        value={draft.request}
        onChange={(e) => update({ request: e.target.value })}
        supportingText={minutes ? `Planning for ${duration(minutes)}` : 'Be specific for a better plan — include how long you have'}
        autoFocus
      />
      <SectionHeader title="Try adding" />
      <div className="dm-chips" role="group" aria-label="Add detail to your request">
        {tryAdding.map((t) => (
          <FilterChip
            key={t.label}
            label={t.label}
            selected={used.includes(t.label)}
            disabled={used.includes(t.label)}
            onClick={() => {
              setUsed((u) => [...u, t.label])
              update({ request: draft.request.trimEnd() + t.text(hobby?.level ?? 'Intermediate') })
            }}
          />
        ))}
      </div>
      {hobby && (
        <HorizontalCard
          variant="filled"
          title="Context included"
          subhead={`${hobby.level} ${hobby.name.toLowerCase()}${hobby.goal ? ` · Goal: ${hobby.goal.summary.toLowerCase()} by ${shortDay(hobby.goal.target)}` : ''}`}
          leading={<HobbyGlyph hobbyId={hobby.id} icon={hobby.icon} />}
          media={<HobbyMedia hobby={hobby} />}
        />
      )}
    </Screen>
  )
}

export function ReviewPlan() {
  const { state, dispatch } = useStore()
  const { go } = useGo()
  const snack = useSnackbar()
  const [draft, update] = usePlanner()
  const hobby = useMatchedHobby(draft.hobbyName) ?? state.hobbies[0]
  const tasks = useMemo(() => breakdown(hobby.id, draft.request, draft.variant, draft.minutes), [hobby.id, draft.request, draft.variant, draft.minutes])
  // Task ids are new on every generation, so an exclusion set never goes stale.
  const [excluded, setExcluded] = useState<Set<string>>(new Set())
  const [readyFor, setReadyFor] = useState<Task[] | null>(null)
  const thinking = readyFor !== tasks

  // A short "thinking" beat, then the tasks stream in.
  useEffect(() => {
    const t = setTimeout(() => setReadyFor(tasks), 700)
    return () => clearTimeout(t)
  }, [tasks])

  const chosen = tasks.filter((t) => !excluded.has(t.id))
  const total = chosen.reduce((s, t) => s + t.minutes, 0)
  const effort = effortFor(chosen.length ? chosen : tasks)

  const add = () => {
    const session: Session = {
      id: uid('s'),
      hobbyId: hobby.id,
      title: draft.title.trim() || `${hobby.name} session`,
      date: draft.date,
      time: draft.time,
      minutes: total,
      tasks: chosen.map((t) => ({ ...t, done: false })),
      status: 'planned',
      energy: draft.energy,
      reminder: state.settings.sessionReminders ? state.settings.reminderLead : 0,
      xp: xpFor(total),
    }
    dispatch({ type: 'addSession', session })
    clearDraft('planner')
    go(`/calendar/${draft.date}`, 'down', { replace: true })
    snack(`Added to ${shortDay(draft.date)} · ${chosen.length} tasks`, { actionLabel: 'Undo', onAction: () => dispatch({ type: 'deleteSession', id: session.id }) })
  }

  return (
    <Screen
      title="Review AI plan"
      subtitle={thinking ? 'Breaking it down…' : `${chosen.length} tasks · ${duration(total)} total`}
      back="/plan"
      footer={
        <Button onClick={add} disabled={thinking || chosen.length === 0}>
          {chosen.length === 0 ? 'Keep at least one task' : 'Add to agenda'}
        </Button>
      }
    >
      <div className="dm-split">
        <span className="dm-tag md-typescale-label-large">
          <Icon name="auto_awesome" size={18} filled />
          AI generated
        </span>
        <span className="dm-accent md-typescale-label-large">{thinking ? '…' : duration(total)}</span>
      </div>

      {thinking ? (
        <div className="dm-stack-12" aria-busy="true" aria-label="Generating tasks">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="dm-skeleton" style={{ height: 56, animationDelay: `${i * 120}ms` }} />
          ))}
        </div>
      ) : (
        <ul className="dm-plain-list dm-enter" aria-label="Tasks">
          {tasks.map((t, i) => (
            <li key={t.id} className="dm-agenda-row" style={stagger(i)}>
              <Checkbox
                checked={!excluded.has(t.id)}
                aria-label={`Keep ${t.title}`}
                onChange={(e) =>
                  setExcluded((x) => {
                    const next = new Set(x)
                    if (e.target.checked) next.delete(t.id)
                    else next.add(t.id)
                    return next
                  })
                }
              />
              <InfoRow title={t.title} detail={t.detail} trailing={duration(t.minutes)} done={excluded.has(t.id)} />
            </li>
          ))}
        </ul>
      )}

      <Meter label="Effort balance" value={effort.label} progress={effort.value} />
      <div className="dm-center">
        <Button variant="tonal" icon="autorenew" disabled={thinking} onClick={() => update({ variant: draft.variant + 1 })}>
          Regenerate breakdown
        </Button>
      </div>
    </Screen>
  )
}
