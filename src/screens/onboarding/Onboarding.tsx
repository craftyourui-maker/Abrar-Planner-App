import { useMemo, useState } from 'react'
import { Button, FilterChip, HorizontalCard, Icon, SearchBar, SegmentedButton, Slider } from '../../components'
import { starterPlan } from '../../app/ai'
import { clock, duration, weekdayShort } from '../../app/dates'
import { clearDraft } from '../../app/draft'
import { stagger } from '../../app/motion'
import { useGo } from '../../app/nav'
import { Screen } from '../../app/Screen'
import { useSnackbar } from '../../app/snackbar'
import { useStore } from '../../app/store'
import { HobbyGlyph, HobbyMedia, InfoRow, Meter, SectionHeader } from '../../app/ui'
import { dayLabels, intentions, timeOptions, useOnboarding } from './draft'
import './onboarding.css'

const MIN_HOBBIES = 3

function StepDots({ step }: { step: number }) {
  return (
    <span className="dm-steps" aria-label={`Step ${step} of 4`}>
      {[1, 2, 3, 4].map((s) => (
        <span key={s} className={s === step ? 'dm-steps__dot dm-steps__dot--on' : s < step ? 'dm-steps__dot dm-steps__dot--done' : 'dm-steps__dot'} />
      ))}
    </span>
  )
}

export function ChooseHobbies() {
  const { state } = useStore()
  const { go } = useGo()
  const [draft, update] = useOnboarding()
  const [query, setQuery] = useState('')
  const all = state.hobbies
  const shown = all.filter((h) => h.name.toLowerCase().includes(query.trim().toLowerCase()))
  const picks = draft.hobbyIds.map((id) => all.find((h) => h.id === id)!).filter(Boolean)
  const enough = picks.length >= MIN_HOBBIES

  const toggle = (id: string) =>
    update((d) => ({ ...d, hobbyIds: d.hobbyIds.includes(id) ? d.hobbyIds.filter((x) => x !== id) : [...d.hobbyIds, id] }))

  return (
    <Screen
      title="Choose your hobbies"
      subtitle="Pick at least three. You can change these later."
      back="/welcome"
      actions={<StepDots step={1} />}
      footer={
        <Button disabled={!enough} onClick={() => go('/onboarding/pace')}>
          {enough ? 'Continue' : `Pick ${MIN_HOBBIES - picks.length} more`}
        </Button>
      }
    >
      <SearchBar placeholder="Search hobbies" value={query} onChange={(e) => setQuery(e.target.value)} label="Search hobbies" />
      <div className="dm-chips" role="group" aria-label="Hobbies">
        {shown.map((h) => (
          <FilterChip key={h.id} label={h.name} icon={h.icon} selected={draft.hobbyIds.includes(h.id)} onClick={() => toggle(h.id)} />
        ))}
        {shown.length === 0 && <p className="dm-muted md-typescale-body-medium">No hobby called “{query}” yet — try another word.</p>}
      </div>
      <SectionHeader title="Your picks" />
      <p className="dm-picks-count md-typescale-label-medium dm-accent" aria-live="polite">
        {picks.length} selected
      </p>
      <div className="dm-card-list">
        {picks.map((h) => (
          <HorizontalCard
            key={h.id}
            className="dm-pop"
            variant={h.id === picks[0]?.id ? 'filled' : 'outlined'}
            title={h.name}
            subhead={h.category}
            leading={<HobbyGlyph hobbyId={h.id} icon={h.icon} />}
            media={<HobbyMedia hobby={h} />}
          />
        ))}
      </div>
    </Screen>
  )
}

export function SetPace() {
  const { state } = useStore()
  const { go } = useGo()
  const [draft, update] = useOnboarding()
  const goals = draft.hobbyIds.map((id) => state.hobbies.find((h) => h.id === id)!).filter((h) => h?.goal)

  return (
    <Screen
      title="Set your pace"
      subtitle="Tell us where you are and where you want to go."
      back="/onboarding/hobbies"
      actions={<StepDots step={2} />}
      footer={<Button onClick={() => go('/onboarding/time')}>Continue</Button>}
    >
      <SectionHeader title="Experience level" />
      <SegmentedButton
        label="Experience level"
        value={[draft.experience]}
        onChange={([v]) => v && update({ experience: v })}
        segments={[
          { value: 'Beginner', label: 'Beginner' },
          { value: 'Intermediate', label: 'Intermediate' },
          { value: 'Advanced', label: 'Advanced' },
        ]}
      />
      <SectionHeader title="What would feel meaningful?" />
      <div className="dm-chips" role="group" aria-label="Intentions">
        {intentions.map((i) => (
          <FilterChip
            key={i.id}
            label={i.label}
            selected={draft.intentions.includes(i.id)}
            onClick={() =>
              update((d) => ({ ...d, intentions: d.intentions.includes(i.id) ? d.intentions.filter((x) => x !== i.id) : [...d.intentions, i.id] }))
            }
          />
        ))}
      </div>
      <div className="dm-stack-8">
        <div className="dm-meter__row">
          <span className="dm-meter__label md-typescale-title-medium-emphasized">Weekly target</span>
          <span className="dm-meter__value md-typescale-label-medium" aria-hidden>
            {draft.weeklyTarget} sessions
          </span>
        </div>
        <Slider
          label="Weekly target"
          min={1}
          max={7}
          value={draft.weeklyTarget}
          valueText={`${draft.weeklyTarget} sessions a week`}
          onChange={(v) => update({ weeklyTarget: v })}
        />
      </div>
      {goals.length > 0 && (
        <div className="dm-enter">
          {goals.map((h, i) => (
            <InfoRow
              key={h.id}
              style={stagger(i)}
              leading={<HobbyGlyph hobbyId={h.id} icon={h.icon} size={32} />}
              title={h.name}
              detail={h.goal!.summary}
              trailing={`${h.goal!.horizonWeeks} weeks`}
            />
          ))}
        </div>
      )}
    </Screen>
  )
}

export function FindTime() {
  const { go } = useGo()
  const [draft, update] = useOnboarding()
  const weekdays = draft.days.filter((d) => d < 5).length
  const weekend = draft.days.filter((d) => d >= 5).length
  const weekdayTime = timeOptions.find((t) => t.id !== 'morning' && draft.times.includes(t.id)) ?? timeOptions[2]
  const weekendTime = draft.times.includes('morning') ? timeOptions[0] : weekdayTime
  const minutes = weekdays * weekdayTime.minutes + weekend * weekendTime.minutes
  const ready = draft.days.length > 0 && draft.times.length > 0

  return (
    <Screen
      title="Find your time"
      subtitle="We’ll fit sessions around your week."
      back="/onboarding/pace"
      actions={<StepDots step={3} />}
      footer={
        <Button disabled={!ready} icon="auto_awesome" onClick={() => go('/onboarding/plan')}>
          {ready ? 'Build my plan' : 'Pick a day and a time'}
        </Button>
      }
    >
      <SectionHeader title="Days that work" />
      <div className="dm-chips" role="group" aria-label="Days that work">
        {dayLabels.map((d, i) => (
          <FilterChip
            key={d}
            label={d}
            selected={draft.days.includes(i)}
            onClick={() => update((x) => ({ ...x, days: x.days.includes(i) ? x.days.filter((y) => y !== i) : [...x.days, i] }))}
          />
        ))}
      </div>
      <SectionHeader title="Preferred times" />
      <div className="dm-chips" role="group" aria-label="Preferred times">
        {timeOptions.map((t) => (
          <FilterChip
            key={t.id}
            label={t.label}
            selected={draft.times.includes(t.id)}
            onClick={() => update((x) => ({ ...x, times: x.times.includes(t.id) ? x.times.filter((y) => y !== t.id) : [...x.times, t.id] }))}
          />
        ))}
      </div>
      <div>
        <InfoRow leading={<span className="dm-row-icon"><Icon name="work" size={18} /></span>} title="Weekdays" detail={`${weekdayTime.label} · ${weekdayTime.detail}`} trailing={`${weekdays} ${weekdays === 1 ? 'day' : 'days'}`} />
        <InfoRow leading={<span className="dm-row-icon"><Icon name="weekend" size={18} /></span>} title="Weekend" detail={`${weekendTime.label} · ${weekendTime.detail}`} trailing={`${weekend} ${weekend === 1 ? 'day' : 'days'}`} />
      </div>
      <Meter label="Planned hobby time" value={`${duration(minutes)} / week`} progress={Math.min(1, minutes / 300)} />
    </Screen>
  )
}

export function StarterPlan() {
  const { state, dispatch } = useStore()
  const { go } = useGo()
  const snack = useSnackbar()
  const [draft] = useOnboarding()
  const hobbies = draft.hobbyIds.map((id) => state.hobbies.find((h) => h.id === id)!).filter(Boolean)
  const plan = useMemo(
    () => starterPlan(hobbies, { days: draft.days, times: draft.times }, draft.weeklyTarget).sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)),
    // Regenerate only when the inputs change, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [draft.hobbyIds.join(), draft.days.join(), draft.times.join(), draft.weeklyTarget],
  )
  const covered = new Set(plan.map((s) => s.hobbyId)).size
  const uniqueDays = new Set(plan.map((s) => s.date)).size

  const start = () => {
    dispatch({
      type: 'completeOnboarding',
      hobbyIds: draft.hobbyIds,
      plan,
      preferences: {
        experience: draft.experience,
        intentions: draft.intentions,
        weeklyTarget: draft.weeklyTarget,
        availability: { days: draft.days, times: draft.times },
      },
    })
    clearDraft('onboarding')
    go('/', 'up', { replace: true })
    snack(`Plan started · ${plan.length} sessions this week`)
  }

  return (
    <Screen
      title="Your starter plan"
      subtitle="AI draft · tuned to your goals and availability"
      back="/onboarding/time"
      actions={<StepDots step={4} />}
      footer={<Button onClick={start}>Start this plan</Button>}
    >
      <div className="dm-intro">
        <span className="dm-tag md-typescale-label-large">
          <Icon name="auto_awesome" size={18} filled />
          AI draft
        </span>
        <p className="md-typescale-body-medium dm-muted">
          Balanced across {uniqueDays} {uniqueDays === 1 ? 'day' : 'days'}
          {uniqueDays > 2 ? ' with recovery built in.' : '.'}
        </p>
      </div>
      <SectionHeader title="Week one" action="Edit" onAction={() => go('/onboarding/time', 'back')} />
      <div className="dm-enter">
        {plan.map((s, i) => {
          const h = state.hobbies.find((x) => x.id === s.hobbyId)!
          return (
            <InfoRow
              key={s.id}
              style={stagger(i)}
              leading={<HobbyGlyph hobbyId={h.id} icon={h.icon} size={32} />}
              title={s.title}
              detail={`${weekdayShort(s.date)} · ${clock(s.time)} · ${h.name}`}
              trailing={`${s.minutes} min`}
            />
          )
        })}
      </div>
      <Meter label="Goal coverage" value={`${covered} of ${hobbies.length} hobbies`} progress={hobbies.length ? covered / hobbies.length : 0} />
      {covered < hobbies.length && (
        <p className="md-typescale-body-small dm-muted">Raise your weekly target or add a day to cover every hobby in week one.</p>
      )}
    </Screen>
  )
}
