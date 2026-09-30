import { useEffect, useRef, useState } from 'react'
import { Badge, FilterChip, HorizontalCard, Icon, IconButton, SegmentedButton } from '../components'
import { cx } from '../components/cx'
import { TODAY, addDays, shortDay } from '../app/dates'
import { stagger } from '../app/motion'
import { useGo } from '../app/nav'
import { Screen } from '../app/Screen'
import { useLevel, useStore } from '../app/store'
import type { Trophy } from '../app/types'
import { HobbyGlyph, InfoRow, Meter, SectionHeader } from '../app/ui'
import './screens.css'

type Metric = 'hours' | 'sessions' | 'completion'

export function Progress() {
  const { state } = useStore()
  const { go } = useGo()
  const level = useLevel()
  const [range, setRange] = useState<'week' | 'month'>('month')
  const [metric, setMetric] = useState<Metric>('completion')
  const active = state.hobbies.filter((h) => h.active)

  const weekStart = addDays(TODAY, -6)
  const weekDone = state.sessions.filter((s) => s.status === 'done' && s.date >= weekStart && s.date <= TODAY)
  const weekPlanned = state.sessions.filter((s) => s.date >= weekStart && s.date <= TODAY)
  const hours = range === 'week' ? Math.round((weekDone.reduce((m, s) => m + s.minutes, 0) / 60) * 10) / 10 : 18.5
  const sessions = range === 'week' ? weekDone.length : 42
  const completion = range === 'week' ? Math.round((weekDone.length / Math.max(1, weekPlanned.length)) * 100) : 86

  const valueFor = (h: (typeof active)[number]) => {
    if (metric === 'completion') return { v: h.consistency, label: `${Math.round(h.consistency * 100)}%` }
    const maxHours = Math.max(...active.map((x) => x.hoursThisMonth))
    const maxSessions = Math.max(...active.map((x) => x.sessionsThisMonth))
    return metric === 'hours'
      ? { v: h.hoursThisMonth / maxHours, label: `${h.hoursThisMonth} h` }
      : { v: h.sessionsThisMonth / maxSessions, label: `${h.sessionsThisMonth} sessions` }
  }
  const sorted = [...active].sort((a, b) => valueFor(b).v - valueFor(a).v)
  const mostConsistent = [...active].sort((a, b) => b.consistency - a.consistency)[0]
  const bestStreak = [...state.hobbies].sort((a, b) => b.bestStreak - a.bestStreak)[0]
  const newRewards = state.trophies.filter((t) => t.isNew).length

  return (
    <Screen
      title="Progress"
      subtitle={range === 'week' ? 'Last 7 days' : 'Last 30 days'}
      back={false}
      actions={
        <>
          <Badge value={newRewards || undefined}>
            <IconButton icon="emoji_events" label={newRewards ? `Rewards, ${newRewards} new` : 'Rewards'} onClick={() => go('/rewards')} />
          </Badge>
          <IconButton icon="account_circle" label="Profile" onClick={() => go('/profile')} />
        </>
      }
    >
      <SegmentedButton
        label="Time range"
        value={[range]}
        onChange={([v]) => v && setRange(v)}
        segments={[
          { value: 'week', label: 'Week' },
          { value: 'month', label: 'Month' },
        ]}
      />
      <div className="dm-chips" role="group" aria-label="Rank hobbies by">
        <FilterChip label={`${hours} hours`} selected={metric === 'hours'} onClick={() => setMetric('hours')} />
        <FilterChip label={`${sessions} sessions`} selected={metric === 'sessions'} onClick={() => setMetric('sessions')} />
        <FilterChip label={`${completion}% completed`} selected={metric === 'completion'} onClick={() => setMetric('completion')} />
      </div>

      <InfoRow
        leading={<span className="dm-level-badge md-typescale-title-medium">{level.level}</span>}
        overline="Level"
        title={`${state.profile.title} · ${state.profile.xp.toLocaleString()} XP`}
        detail={`${level.toNext} XP to level ${level.level + 1}`}
        trailing={<Icon name="chevron_right" />}
        onClick={() => go('/rewards')}
        className="dm-level-row"
      />

      <SectionHeader title="Consistency" action={metric === 'completion' ? 'Completion' : metric === 'hours' ? 'Hours' : 'Sessions'} />
      <div key={metric} className="dm-stack-16 dm-enter">
        {sorted.map((h, i) => {
          const { v, label } = valueFor(h)
          return (
            <div key={h.id} style={stagger(i)}>
              <Meter label={h.name} value={label} progress={v} onClick={() => go(`/hobbies/${h.id}/progress`)} />
            </div>
          )
        })}
      </div>

      <SectionHeader title="Highlights" />
      <div>
        <InfoRow
          leading={<HobbyGlyph hobbyId={mostConsistent.id} icon="trending_up" size={32} />}
          title={`Most consistent · ${mostConsistent.name}`}
          detail={`${mostConsistent.sessionsThisMonth} sessions · ${mostConsistent.hoursThisMonth} hours`}
          trailing="+12%"
          onClick={() => go(`/hobbies/${mostConsistent.id}/progress`)}
        />
        <InfoRow
          leading={<HobbyGlyph hobbyId={bestStreak.id} icon="local_fire_department" size={32} />}
          title={`Best streak · ${bestStreak.name}`}
          detail={`${bestStreak.bestStreak} consecutive days`}
          trailing={`${bestStreak.bestStreak} days`}
          onClick={() => go(`/hobbies/${bestStreak.id}`)}
        />
      </div>
    </Screen>
  )
}

export function Rewards() {
  const { state, dispatch } = useStore()
  const { go } = useGo()
  const level = useLevel()
  const newOnes = state.trophies.filter((t) => t.isNew)
  const recent = state.trophies
    .filter((t) => t.status === 'unlocked')
    .sort((a, b) => (b.unlockedOn ?? '').localeCompare(a.unlockedOn ?? ''))
    .slice(0, 2)
  const milestones = ['creative-week', 'deep-focus'].map((id) => state.trophies.find((t) => t.id === id)!)
  const chest = state.trophies.find((t) => t.id === 'weekly-chest')!

  const viewAll = () => {
    go('/rewards/trophies')
    if (newOnes.length) setTimeout(() => dispatch({ type: 'seeTrophies' }), 600)
  }

  return (
    <Screen title="Rewards" subtitle={`Level ${level.level} · ${state.profile.xp.toLocaleString()} XP`} back="/progress">
      <Meter label={`Level ${level.level} · ${state.profile.title}`} value={`${level.toNext} XP to level ${level.level + 1}`} progress={level.progress} />

      {newOnes.length > 0 && (
        <button type="button" className="dm-new-rewards md-state md-focus-ring dm-pop" onClick={viewAll}>
          <span className="dm-new-rewards__count md-typescale-label-small">{newOnes.length}</span>
          <span className="md-typescale-body-medium">
            {newOnes.length === 1 ? 'A new reward is' : `${['Zero', 'One', 'Two', 'Three', 'Four', 'Five'][newOnes.length] ?? newOnes.length} new rewards are`} ready to view.
          </span>
          <Icon name="chevron_right" />
        </button>
      )}

      <SectionHeader title="Recently unlocked" action="View all" onAction={viewAll} />
      <div className="dm-card-list dm-enter">
        {recent.map((t, i) => (
          <HorizontalCard
            key={t.id}
            style={stagger(i)}
            variant={i === 0 ? 'filled' : 'outlined'}
            title={t.name}
            subhead={`${t.description.replace(/\.$/, '')} · Unlocked ${t.unlockedOn === TODAY ? 'today' : shortDay(t.unlockedOn!)}`}
            leading={<TrophyGlyph trophy={t} />}
            media={<TrophyMedia trophy={t} />}
          />
        ))}
      </div>

      <SectionHeader title="Next milestones" />
      <div className="dm-stack-16">
        {milestones.map((t) => (
          <Meter key={t.id} label={t.name} value={`${t.progress} of ${t.total}${t.id === 'creative-week' ? ' hobbies' : ' long sessions'}`} progress={t.progress / t.total} />
        ))}
      </div>
      <HorizontalCard
        variant="filled"
        title={chest.name}
        subhead={chest.status === 'unlocked' ? 'Opened! +100 XP added to your week.' : `Complete ${chest.total - chest.progress} more ${chest.total - chest.progress === 1 ? 'session' : 'sessions'} by Sunday`}
        leading={<TrophyGlyph trophy={chest} />}
        media={<TrophyMedia trophy={chest} />}
      />
    </Screen>
  )
}

function TrophyGlyph({ trophy }: { trophy: Trophy }) {
  return (
    <span className={cx('dm-trophy-glyph', `dm-trophy-glyph--${trophy.status}`)} aria-hidden>
      <Icon name={trophy.status === 'locked' ? 'lock' : trophy.icon} filled={trophy.status === 'unlocked'} size={22} />
    </span>
  )
}

function TrophyMedia({ trophy }: { trophy: Trophy }) {
  const p = trophy.progress / trophy.total
  return (
    <span className={cx('dm-trophy-media', `dm-trophy-media--${trophy.status}`)} aria-hidden>
      {trophy.status === 'progress' ? <span className="dm-trophy-media__fill md-typescale-label-large">{Math.round(p * 100)}%</span> : <Icon name={trophy.status === 'unlocked' ? 'workspace_premium' : 'lock'} size={30} />}
    </span>
  )
}

type TrophyFilter = 'all' | 'unlocked' | 'progress'

export function Trophies() {
  const { state } = useStore()
  const [filter, setFilter] = useState<TrophyFilter>('unlocked')
  const [featuredId, setFeaturedId] = useState('steady-hands')
  const scrollTop = useRef<HTMLDivElement>(null)
  const counts = {
    all: state.trophies.length,
    unlocked: state.trophies.filter((t) => t.status === 'unlocked').length,
    progress: state.trophies.filter((t) => t.status === 'progress').length,
  }
  const shown = state.trophies.filter((t) => filter === 'all' || t.status === filter)
  const featured = state.trophies.find((t) => t.id === featuredId)!
  const mastery = state.trophies.filter((t) => t.series === 'Mastery')
  const masteryDone = mastery.filter((t) => t.status === 'unlocked').length

  useEffect(() => {
    scrollTop.current?.closest('.dm-scroll')?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [featuredId])

  const statusLine = (t: Trophy) =>
    t.status === 'unlocked' ? `Unlocked ${t.unlockedOn === TODAY ? 'today' : shortDay(t.unlockedOn!)}` : t.status === 'progress' ? `${t.progress} of ${t.total}` : 'Locked'

  return (
    <Screen title="Trophy collection" subtitle={`${counts.unlocked} of ${counts.all} unlocked`} back="/rewards">
      <div ref={scrollTop} className="dm-chips" role="group" aria-label="Filter trophies">
        <FilterChip label={`All ${counts.all}`} selected={filter === 'all'} onClick={() => setFilter('all')} />
        <FilterChip label={`Unlocked ${counts.unlocked}`} selected={filter === 'unlocked'} onClick={() => setFilter('unlocked')} />
        <FilterChip label={`In progress ${counts.progress}`} selected={filter === 'progress'} onClick={() => setFilter('progress')} />
      </div>

      <div key={featured.id} className="dm-featured dm-center" aria-live="polite">
        <span className={cx('dm-featured__icon', `dm-featured__icon--${featured.status}`)}>
          <Icon name={featured.status === 'locked' ? 'lock' : featured.icon} filled size={40} />
        </span>
        <h2 className="dm-featured__name md-typescale-display-small">{featured.name}</h2>
        <p className="md-typescale-body-medium dm-muted">
          {featured.description} {statusLine(featured)}
          {featured.rarity ? ` · ${featured.rarity}.` : '.'}
        </p>
      </div>

      <Meter label="Mastery series" value={`${masteryDone} of ${mastery.length} trophies`} progress={masteryDone / mastery.length} />

      <SectionHeader title="Collection" />
      <div key={filter} className="dm-card-list dm-enter">
        {shown.map((t, i) => (
          <HorizontalCard
            key={t.id}
            style={stagger(i)}
            interactive
            role="button"
            aria-pressed={t.id === featuredId}
            aria-label={`${t.name}, ${statusLine(t)}`}
            onClick={() => setFeaturedId(t.id)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setFeaturedId(t.id))}
            variant={t.status === 'unlocked' ? 'filled' : 'outlined'}
            className={cx(t.status === 'locked' && 'dm-paused', t.id === featuredId && 'dm-card--current')}
            title={t.name}
            subhead={`${t.description.replace(/\.$/, '')} · ${statusLine(t)}`}
            leading={<TrophyGlyph trophy={t} />}
            media={<TrophyMedia trophy={t} />}
          />
        ))}
      </div>
    </Screen>
  )
}
