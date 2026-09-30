import { useState } from 'react'
import { Avatar, Button, Dialog, FilterChip, Icon, IconButton, SearchBar, SegmentedButton, Slider, Switch, TextField } from '../components'
import { clock, duration, longDay } from '../app/dates'
import { stagger } from '../app/motion'
import { useGo } from '../app/nav'
import { Screen } from '../app/Screen'
import { useSnackbar } from '../app/snackbar'
import { byTime, useLevel, useStore } from '../app/store'
import type { Settings as SettingsT } from '../app/types'
import { EmptyState, HobbyGlyph, InfoRow, Meter, SectionHeader } from '../app/ui'
import { useTheme } from '../theme/theme'
import './screens.css'

const initialsOf = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

export function Profile() {
  const { state, dispatch } = useStore()
  const { go } = useGo()
  const snack = useSnackbar()
  const level = useLevel()
  const theme = useTheme()
  const [dialog, setDialog] = useState<'details' | 'goals' | 'reset' | null>(null)
  const [name, setName] = useState(state.profile.name)
  const [email, setEmail] = useState(state.profile.email)
  const [target, setTarget] = useState(state.preferences.weeklyTarget)
  const active = state.hobbies.filter((h) => h.active).length
  const paused = state.hobbies.filter((h) => !h.active && h.bestStreak > 0).length
  const weeklyMinutes = state.sessions.filter((s) => s.date >= '2026-10-05' && s.date <= '2026-10-11').reduce((m, s) => m + s.minutes, 0)

  const saveDetails = () => {
    if (!name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return
    dispatch({ type: 'updateProfile', name: name.trim(), email: email.trim() })
    setDialog(null)
    snack('Details updated')
  }

  return (
    <Screen title="Profile" subtitle={`${state.profile.name} · Level ${level.level}`} back="/">
      <div className="dm-profile-hero dm-center dm-enter">
        <span style={stagger(0)}>
          <Avatar initials={initialsOf(state.profile.name)} size={80} />
        </span>
        <h2 className="dm-display md-typescale-headline-large" style={stagger(1)}>
          {state.profile.name}
        </h2>
        <p className="md-typescale-body-medium dm-muted" style={stagger(2)}>
          {state.profile.title} · Member since {state.profile.memberSince}
        </p>
      </div>

      <Meter label={`Level ${level.level}`} value={`${state.profile.xp.toLocaleString()} XP`} progress={level.progress} onClick={() => go('/rewards')} />

      <div>
        <InfoRow leading={<Icon name="badge" />} title="Personal details" detail="Name and email" trailing="Edit" onClick={() => setDialog('details')} />
        <InfoRow leading={<Icon name="interests" />} title="Hobby preferences" detail={`${active} active hobbies · ${paused} paused`} trailing="Manage" onClick={() => go('/hobbies', 'tab')} />
        <InfoRow
          leading={<Icon name="flag" />}
          title="Weekly goals"
          detail={`${state.preferences.weeklyTarget} sessions · ${duration(weeklyMinutes)}`}
          trailing="Edit"
          onClick={() => setDialog('goals')}
        />
        <div className="dm-setting">
          <InfoRow leading={<Icon name="event" />} title="Connected calendar" detail="Google Calendar · Synced" />
          <Switch defaultChecked aria-label="Sync with Google Calendar" onChange={(e) => snack(e.target.checked ? 'Calendar sync on' : 'Calendar sync paused')} />
        </div>
        <InfoRow leading={<Icon name="notifications" />} title="Notifications & AI" detail="Reminders, planning, and privacy" trailing={<Icon name="chevron_right" />} onClick={() => go('/settings')} />
      </div>

      <div className="dm-stack-12">
        <SectionHeader title="Appearance" />
        <SegmentedButton
          label="Theme"
          value={[theme.scheme]}
          onChange={([v]) => v && theme.setTheme({ scheme: v })}
          segments={[
            { value: 'light', label: 'Light', icon: 'light_mode' },
            { value: 'dark', label: 'Dark', icon: 'dark_mode' },
            { value: 'system', label: 'Auto', icon: 'contrast' },
          ]}
        />
      </div>

      <div>
        <InfoRow leading={<Icon name="palette" />} title="Design system" detail="Tokens and components behind Daymark" trailing={<Icon name="chevron_right" />} onClick={() => go('/system')} />
        <InfoRow leading={<Icon name="restart_alt" />} title="Reset demo data" detail="Restore Alex’s seeded week" onClick={() => setDialog('reset')} />
        <InfoRow
          leading={<Icon name="logout" />}
          title="Sign out"
          onClick={() => {
            dispatch({ type: 'signOut' })
            go('/welcome', 'down', { replace: true })
          }}
        />
      </div>

      <Dialog
        open={dialog === 'details'}
        onClose={() => setDialog(null)}
        headline="Personal details"
        actions={
          <>
            <Button variant="text" onClick={() => setDialog(null)}>
              Cancel
            </Button>
            <Button variant="text" onClick={saveDetails}>
              Save
            </Button>
          </>
        }
      >
        <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} error={!name.trim()} supportingText={name.trim() ? undefined : 'Tell us what to call you'} />
        <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </Dialog>

      <Dialog
        open={dialog === 'goals'}
        onClose={() => setDialog(null)}
        headline="Weekly goals"
        actions={
          <>
            <Button variant="text" onClick={() => setDialog(null)}>
              Cancel
            </Button>
            <Button
              variant="text"
              onClick={() => {
                dispatch({ type: 'setPreferences', patch: { weeklyTarget: target } })
                setDialog(null)
                snack(`Weekly target set to ${target} sessions`)
              }}
            >
              Save
            </Button>
          </>
        }
      >
        <p>How many sessions feel right for a normal week?</p>
        <div className="dm-dialog-slider">
          <Slider label="Sessions per week" min={1} max={7} value={target} onChange={setTarget} valueText={`${target} sessions`} />
          <span className="md-typescale-title-medium dm-accent">{target} sessions</span>
        </div>
      </Dialog>

      <Dialog
        open={dialog === 'reset'}
        onClose={() => setDialog(null)}
        icon="restart_alt"
        headline="Reset demo data?"
        actions={
          <>
            <Button variant="text" onClick={() => setDialog(null)}>
              Cancel
            </Button>
            <Button
              variant="text"
              onClick={() => {
                dispatch({ type: 'reset' })
                setDialog(null)
                go('/welcome', 'down', { replace: true })
              }}
            >
              Reset
            </Button>
          </>
        }
      >
        <p>Your sessions, reflections, XP and settings go back to Alex’s starting week. This can’t be undone.</p>
      </Dialog>
    </Screen>
  )
}

function SettingRow({ icon, title, detail, checked, onChange }: { icon: string; title: string; detail: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="dm-setting md-state">
      <InfoRow leading={<Icon name={icon} />} title={title} detail={detail} />
      <Switch checked={checked} onChange={(e) => onChange(e.target.checked)} aria-label={title} />
    </label>
  )
}

export function Settings() {
  const { state, dispatch } = useStore()
  const snack = useSnackbar()
  const s = state.settings
  const set = (patch: Partial<SettingsT>) => dispatch({ type: 'updateSettings', patch })
  const [dialog, setDialog] = useState<'privacy' | 'quiet' | null>(null)
  const [quiet, setQuiet] = useState({ start: s.quietStart, end: s.quietEnd })

  return (
    <Screen title="Notifications & AI" subtitle="Reminders, planning, and privacy" back="/profile">
      <SectionHeader title="Notifications" />
      <div>
        <SettingRow icon="alarm" title="Session reminders" detail={s.sessionReminders ? `${s.reminderLead === 60 ? '1 hour' : `${s.reminderLead} minutes`} before` : 'Off'} checked={s.sessionReminders} onChange={(v) => set({ sessionReminders: v })} />
        {s.sessionReminders && (
          <div className="dm-chips dm-setting-options dm-pop" role="group" aria-label="Remind me">
            {([10, 30, 60] as const).map((m) => (
              <FilterChip key={m} label={m === 60 ? '1 hour' : `${m} min`} selected={s.reminderLead === m} onClick={() => set({ reminderLead: m })} />
            ))}
          </div>
        )}
        <SettingRow icon="today" title="Daily agenda" detail={s.dailyAgenda ? `Every morning at ${clock(s.agendaTime)}` : 'Off'} checked={s.dailyAgenda} onChange={(v) => set({ dailyAgenda: v })} />
        <SettingRow icon="local_fire_department" title="Streak nudges" detail="Only when a streak is at risk" checked={s.streakNudges} onChange={(v) => set({ streakNudges: v })} />
      </div>

      <SectionHeader title="AI assistance" />
      <div>
        <SettingRow icon="auto_awesome" title="Automatic task breakdowns" detail="Suggest steps and timing for new activities" checked={s.autoBreakdown} onChange={(v) => set({ autoBreakdown: v })} />
        <SettingRow icon="event_repeat" title="Smart rescheduling" detail="Rebalance missed sessions automatically" checked={s.smartRescheduling} onChange={(v) => set({ smartRescheduling: v })} />
        <InfoRow leading={<Icon name="shield_person" />} title="AI data & privacy" detail={`Personalization ${s.personalization ? 'on' : 'off'} · Review controls`} trailing="View" onClick={() => setDialog('privacy')} />
        <InfoRow
          leading={<Icon name="bedtime" />}
          title="Quiet hours"
          detail={`${clock(s.quietStart)} – ${clock(s.quietEnd)}`}
          trailing="Edit"
          onClick={() => {
            setQuiet({ start: s.quietStart, end: s.quietEnd })
            setDialog('quiet')
          }}
        />
      </div>

      <Dialog
        open={dialog === 'privacy'}
        onClose={() => setDialog(null)}
        icon="shield_person"
        headline="AI data & privacy"
        actions={
          <Button variant="text" onClick={() => setDialog(null)}>
            Done
          </Button>
        }
      >
        <p>Daymark’s planner uses your hobbies, goals, availability and session reflections to size new sessions. Nothing is shared with other people.</p>
        <label className="dm-setting">
          <span className="md-typescale-body-large">Personalize plans from my history</span>
          <Switch checked={s.personalization} onChange={(e) => set({ personalization: e.target.checked })} aria-label="Personalize plans from my history" />
        </label>
      </Dialog>

      <Dialog
        open={dialog === 'quiet'}
        onClose={() => setDialog(null)}
        icon="bedtime"
        headline="Quiet hours"
        actions={
          <>
            <Button variant="text" onClick={() => setDialog(null)}>
              Cancel
            </Button>
            <Button
              variant="text"
              onClick={() => {
                set({ quietStart: quiet.start, quietEnd: quiet.end })
                setDialog(null)
                snack(`Quiet from ${clock(quiet.start)} to ${clock(quiet.end)}`)
              }}
            >
              Save
            </Button>
          </>
        }
      >
        <p>No reminders or nudges during these hours.</p>
        <div className="dm-inline-editor__row">
          <TextField label="From" type="time" value={quiet.start} onChange={(e) => e.target.value && setQuiet({ ...quiet, start: e.target.value })} />
          <TextField label="Until" type="time" value={quiet.end} onChange={(e) => e.target.value && setQuiet({ ...quiet, end: e.target.value })} />
        </div>
      </Dialog>
    </Screen>
  )
}

export function Search() {
  const { state } = useStore()
  const { go, back } = useGo()
  const [q, setQ] = useState('')
  const term = q.trim().toLowerCase()
  const hobbies = term ? state.hobbies.filter((h) => h.name.toLowerCase().includes(term) || h.category.toLowerCase().includes(term)) : []
  const sessions = term
    ? state.sessions.filter((s) => s.title.toLowerCase().includes(term) || s.tasks.some((t) => t.title.toLowerCase().includes(term))).sort(byTime)
    : []
  const hobby = (id: string) => state.hobbies.find((h) => h.id === id)!
  const suggestions = ['Guitar', 'Run', 'Ramen', 'Reading', 'Warm up']

  return (
    <div className="dm-screen-frame dm-search">
      <div className="dm-search__bar" style={{ viewTransitionName: 'app-bar' }}>
        <SearchBar
          autoFocus
          placeholder="Search hobbies and sessions"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          leading={<IconButton icon="arrow_back" label="Close search" onClick={() => back('/')} />}
          trailing={q && <IconButton icon="close" label="Clear search" onClick={() => setQ('')} />}
        />
      </div>
      <div className="dm-scroll">
        <div className="dm-body">
          {!term && (
            <div className="dm-stack-12">
              <SectionHeader title="Try" />
              <div className="dm-chips">
                {suggestions.map((s) => (
                  <FilterChip key={s} label={s} icon="history" onClick={() => setQ(s)} />
                ))}
              </div>
            </div>
          )}
          {hobbies.length > 0 && (
            <section className="dm-stack-8" aria-label="Hobbies">
              <SectionHeader title="Hobbies" />
              <div className="dm-enter">
                {hobbies.map((h, i) => (
                  <InfoRow key={h.id} style={stagger(i)} leading={<HobbyGlyph hobbyId={h.id} icon={h.icon} size={32} />} title={h.name} detail={h.statLine} onClick={() => go(`/hobbies/${h.id}`)} />
                ))}
              </div>
            </section>
          )}
          {sessions.length > 0 && (
            <section className="dm-stack-8" aria-label="Sessions">
              <SectionHeader title="Sessions" />
              <div className="dm-enter">
                {sessions.map((s, i) => {
                  const h = hobby(s.hobbyId)
                  return (
                    <InfoRow
                      key={s.id}
                      style={stagger(i)}
                      done={s.status === 'done'}
                      leading={<HobbyGlyph hobbyId={h.id} icon={s.status === 'done' ? 'check' : h.icon} size={32} />}
                      title={s.title}
                      detail={`${longDay(s.date)} · ${clock(s.time)}`}
                      trailing={duration(s.minutes)}
                      onClick={() => go(`/sessions/${s.id}`)}
                    />
                  )
                })}
              </div>
            </section>
          )}
          {term && !hobbies.length && !sessions.length && <EmptyState icon="search_off" title={`Nothing for “${q.trim()}”`} body="Search matches hobby names, session titles and task names." />}
          <p className="md-visually-hidden" aria-live="polite">
            {term ? `${hobbies.length + sessions.length} results` : ''}
          </p>
        </div>
      </div>
    </div>
  )
}
