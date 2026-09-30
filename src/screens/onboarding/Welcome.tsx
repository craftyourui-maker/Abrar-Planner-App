import { useState } from 'react'
import { Button, CircularProgress, FilterChip, HorizontalCard } from '../../components'
import { useGo } from '../../app/nav'
import { Screen } from '../../app/Screen'
import { HobbyMedia } from '../../app/ui'
import { stagger } from '../../app/motion'
import './onboarding.css'

const promises = [
  { id: 'smarter', label: 'Plan smarter', line: 'AI turns “I want to get better at guitar” into a 35-minute session with four clear steps.' },
  { id: 'time', label: 'Protect your time', line: 'Sessions fit the evenings and weekends you actually have, with quiet hours respected.' },
  { id: 'rewards', label: 'Earn rewards', line: 'Every finished session earns XP, extends a streak, and moves a trophy closer.' },
]

export function Welcome() {
  const { go } = useGo()
  const [picked, setPicked] = useState('smarter')
  const promise = promises.find((p) => p.id === picked)!

  return (
    <Screen
      title="Daymark"
      subtitle="Make time for what makes you, you."
      back={false}
      footer={
        <>
          <Button icon="stars" onClick={() => go('/sign-up')}>
            Get started
          </Button>
          <Button variant="text" onClick={() => go('/sign-in')}>
            I already have an account
          </Button>
        </>
      }
    >
      <div className="dm-welcome dm-enter">
        <div className="dm-welcome__mark" style={stagger(0)}>
          <CircularProgress value={0.93} size={144} thickness={18} wave label="Daymark" />
        </div>
        <div className="dm-stack-12 dm-center" style={stagger(1)}>
          <h2 className="dm-display md-typescale-display-small">Grow a little, often.</h2>
          <p className="dm-muted md-typescale-body-large">Daymark uses AI to shape realistic hobby sessions, then celebrates every small win.</p>
        </div>
        <div className="dm-stack-12" style={stagger(2)}>
          <div className="dm-chips" role="group" aria-label="What Daymark does">
            {promises.map((p) => (
              <FilterChip key={p.id} label={p.label} selected={picked === p.id} onClick={() => setPicked(p.id)} />
            ))}
          </div>
          <p key={promise.id} className="dm-welcome__promise md-typescale-body-medium dm-pop" aria-live="polite">
            {promise.line}
          </p>
        </div>
        <div style={stagger(3)}>
          <HorizontalCard
            title="Your next good hour"
            subhead="Guitar, running, painting, reading, or cooking—organized around real life."
            leading={<span className="dm-welcome__clock md-typescale-label-large">6:30</span>}
            media={<HobbyMedia hobby={{ id: 'guitar', icon: 'music_note' }} />}
          />
        </div>
      </div>
    </Screen>
  )
}
