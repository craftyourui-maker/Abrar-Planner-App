import { useState, type ReactNode } from 'react'
import {
  AssistChip,
  Avatar,
  Badge,
  BottomAppBar,
  Button,
  Card,
  Checkbox,
  CircularProgress,
  Divider,
  Fab,
  FilterChip,
  HorizontalCard,
  IconButton,
  InputChip,
  LinearProgress,
  List,
  ListItem,
  NavigationBar,
  SearchBar,
  SegmentedButton,
  SuggestionChip,
  Switch,
  Tabs,
  TextField,
  TopAppBar,
} from '../components'
import './gallery.css'

const colorGroups: Array<{ name: string; roles: Array<[string, string]> }> = [
  {
    name: 'Accent',
    roles: [
      ['primary', 'on-primary'],
      ['primary-container', 'on-primary-container'],
      ['secondary', 'on-secondary'],
      ['secondary-container', 'on-secondary-container'],
      ['tertiary', 'on-tertiary'],
      ['tertiary-container', 'on-tertiary-container'],
      ['error', 'on-error'],
      ['error-container', 'on-error-container'],
    ],
  },
  {
    name: 'Surface',
    roles: [
      ['surface-dim', 'on-surface'],
      ['surface', 'on-surface'],
      ['surface-bright', 'on-surface'],
      ['surface-container-lowest', 'on-surface'],
      ['surface-container-low', 'on-surface'],
      ['surface-container', 'on-surface'],
      ['surface-container-high', 'on-surface'],
      ['surface-container-highest', 'on-surface'],
      ['inverse-surface', 'inverse-on-surface'],
      ['outline', 'surface'],
      ['outline-variant', 'on-surface'],
      ['inverse-primary', 'on-primary-container'],
    ],
  },
  {
    name: 'Fixed',
    roles: [
      ['primary-fixed', 'on-primary-fixed'],
      ['primary-fixed-dim', 'on-primary-fixed-variant'],
      ['secondary-fixed', 'on-secondary-fixed'],
      ['secondary-fixed-dim', 'on-secondary-fixed-variant'],
      ['tertiary-fixed', 'on-tertiary-fixed'],
      ['tertiary-fixed-dim', 'on-tertiary-fixed-variant'],
    ],
  },
]

const typeRoles = ['display', 'headline', 'title', 'body', 'label'].flatMap((g) =>
  ['large', 'medium', 'small'].map((s) => `${g}-${s}`),
)

const shapes = ['none', 'extra-small', 'small', 'medium', 'large', 'large-increased', 'extra-large', 'extra-large-increased', 'extra-extra-large', 'full']

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="gl-section">
      <h2 className="md-typescale-headline-small gl-section__title">{title}</h2>
      {children}
    </section>
  )
}

function Specimen({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="gl-specimen">
      <div className="gl-specimen__stage">{children}</div>
      <div className="gl-specimen__label md-typescale-label-medium">{label}</div>
    </div>
  )
}

export function Gallery() {
  const [seg, setSeg] = useState<string[]>(['week'])
  const [chips, setChips] = useState<string[]>(['guitar'])
  const [tab, setTab] = useState('overview')
  const [nav, setNav] = useState('today')
  const [checks, setChecks] = useState({ a: true, b: false })
  const [sw, setSw] = useState({ a: true, b: false })
  const [tags, setTags] = useState(['Fingerstyle', 'Chords'])

  return (
    <div className="gl">
      <Section id="color" title="Color">
        {colorGroups.map((g) => (
          <div key={g.name} className="gl-block">
            <h3 className="md-typescale-title-medium gl-block__title">{g.name}</h3>
            <div className="gl-swatches">
              {g.roles.map(([bg, fg]) => (
                <div
                  key={bg}
                  className="gl-swatch"
                  style={{ background: `var(--md-sys-color-${bg})`, color: `var(--md-sys-color-${fg})` }}
                >
                  <span className="md-typescale-label-large">{bg}</span>
                  <code className="md-typescale-label-small">--md-sys-color-{bg}</code>
                </div>
              ))}
            </div>
          </div>
        ))}
      </Section>

      <Section id="type" title="Typography">
        <div className="gl-type">
          {typeRoles.map((r) => (
            <div key={r} className="gl-type__row">
              <span className="gl-type__meta md-typescale-label-medium">{r}</span>
              <span className={`md-typescale-${r} gl-type__sample`}>Grow a little, often</span>
            </div>
          ))}
        </div>
      </Section>

      <Section id="shape" title="Shape & elevation">
        <div className="gl-grid">
          {shapes.map((s) => (
            <Specimen key={s} label={s}>
              <div className="gl-shape" style={{ borderRadius: `var(--md-sys-shape-corner-${s})` }} />
            </Specimen>
          ))}
        </div>
        <div className="gl-grid">
          {[0, 1, 2, 3, 4, 5].map((l) => (
            <Specimen key={l} label={`level ${l}`}>
              <div className="gl-elevation" style={{ boxShadow: `var(--md-sys-elevation-level${l})` }} />
            </Specimen>
          ))}
        </div>
      </Section>

      <Section id="buttons" title="Buttons">
        <div className="gl-row">
          <Button>Filled</Button>
          <Button variant="tonal">Tonal</Button>
          <Button variant="elevated">Elevated</Button>
          <Button variant="outlined">Outlined</Button>
          <Button variant="text">Text</Button>
          <Button icon="stars">With icon</Button>
          <Button disabled>Disabled</Button>
        </div>
        <div className="gl-row">
          <IconButton icon="favorite" label="Favorite" />
          <IconButton icon="favorite" label="Favorite" selected />
          <IconButton icon="edit" label="Edit" variant="filled" />
          <IconButton icon="edit" label="Edit" variant="tonal" />
          <IconButton icon="edit" label="Edit" variant="outlined" />
          <IconButton icon="bookmark" label="Bookmark" variant="outlined" selected />
          <Fab icon="add" label="New session" />
          <Fab icon="edit" label="Plan with AI" extended />
        </div>
        <SegmentedButton
          label="Range"
          value={seg}
          onChange={setSeg}
          segments={[
            { value: 'day', label: 'Day' },
            { value: 'week', label: 'Week' },
            { value: 'month', label: 'Month' },
            { value: 'year', label: 'Year' },
          ]}
        />
      </Section>

      <Section id="chips" title="Chips">
        <div className="gl-row">
          {['guitar', 'running', 'painting'].map((c) => (
            <FilterChip
              key={c}
              label={c[0].toUpperCase() + c.slice(1)}
              selected={chips.includes(c)}
              onClick={() => setChips((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]))}
            />
          ))}
          <FilterChip label="Elevated" elevated />
          <AssistChip label="Add to calendar" icon="event" />
          <SuggestionChip label="30 min warm-up" />
          {tags.map((t) => (
            <InputChip key={t} label={t} onRemove={() => setTags((p) => p.filter((x) => x !== t))} />
          ))}
        </div>
      </Section>

      <Section id="inputs" title="Text fields & search">
        <div className="gl-cols">
          <TextField label="Hobby" defaultValue="Guitar" />
          <TextField label="Activity name" supportingText="Keep it short and specific" />
          <TextField label="Duration" variant="filled" defaultValue="35 min" />
          <TextField label="Email" error defaultValue="alex@" supportingText="Enter a complete email address" leadingIcon="mail" />
        </div>
        <SearchBar placeholder="Search hobbies and activities" trailing={<Avatar initials="A" size={30} />} />
      </Section>

      <Section id="selection" title="Selection controls">
        <div className="gl-row">
          <Checkbox aria-label="Warm up" checked={checks.a} onChange={(e) => setChecks({ ...checks, a: e.target.checked })} />
          <Checkbox aria-label="Scales" checked={checks.b} onChange={(e) => setChecks({ ...checks, b: e.target.checked })} />
          <Checkbox aria-label="Mixed" indeterminate />
          <Checkbox aria-label="Error" error />
          <Checkbox aria-label="Disabled" disabled checked readOnly />
          <Switch aria-label="Reminders" checked={sw.a} onChange={(e) => setSw({ ...sw, a: e.target.checked })} />
          <Switch aria-label="AI planning" checked={sw.b} onChange={(e) => setSw({ ...sw, b: e.target.checked })} icons />
          <Switch aria-label="Disabled" disabled />
        </div>
      </Section>

      <Section id="progress" title="Progress indicators">
        <div className="gl-stack">
          <LinearProgress value={0.2} thickness={8} wave label="Wave, 8dp" />
          <LinearProgress value={0.6} thickness={4} wave label="Wave, 4dp" />
          <LinearProgress value={0.45} label="Flat, 4dp" />
        </div>
        <div className="gl-row">
          <CircularProgress value={0.7} label="Flat" />
          <CircularProgress value={0.7} wave label="Wave" />
          <CircularProgress label="Loading" />
        </div>
      </Section>

      <Section id="containment" title="Cards, lists & badges">
        <div className="gl-cols">
          <Card variant="elevated" className="gl-card">
            <h3 className="md-typescale-title-medium">Elevated</h3>
            <p className="md-typescale-body-medium">surface-container-low · level 1</p>
          </Card>
          <Card variant="filled" className="gl-card">
            <h3 className="md-typescale-title-medium">Filled</h3>
            <p className="md-typescale-body-medium">surface-container-highest</p>
          </Card>
          <Card variant="outlined" className="gl-card">
            <h3 className="md-typescale-title-medium">Outlined</h3>
            <p className="md-typescale-body-medium">surface · outline-variant</p>
          </Card>
        </div>
        <HorizontalCard interactive title="Guitar · Fingerstyle" subhead="6:30 PM · 35 min · 4 tasks" initials="G" />
        <Card variant="outlined">
          <List>
            <ListItem leading="stars" headline="Morning reading" supportingText="20 pages · 7:42 AM" trailingText="+40 XP" />
            <Divider inset />
            <ListItem
              leading={<Avatar initials="R" />}
              headline="Running"
              supportingText="3 runs this week"
              trailing="chevron_right"
              onClick={() => undefined}
            />
            <Divider inset />
            <ListItem leading="notifications" headline="Session reminders" trailing={<Switch aria-label="Session reminders" defaultChecked />} />
          </List>
        </Card>
        <div className="gl-row">
          <Badge>
            <IconButton icon="notifications" label="Notifications" />
          </Badge>
          <Badge value={3}>
            <IconButton icon="mail" label="Messages" />
          </Badge>
          <Avatar initials="AM" size={56} />
        </div>
      </Section>

      <Section id="navigation" title="Navigation">
        <div className="gl-frame">
          <TopAppBar
            leading={<IconButton icon="arrow_back" label="Back" />}
            headline="Good morning, Alex"
            subtitle="Tuesday · 3 sessions planned"
            actions={<IconButton icon="search" label="Search" />}
          />
          <Tabs
            label="Hobby sections"
            value={tab}
            onChange={setTab}
            tabs={[
              { value: 'overview', label: 'Overview' },
              { value: 'sessions', label: 'Sessions' },
              { value: 'notes', label: 'Notes' },
            ]}
          />
          <TopAppBar variant="large" headline="Trophy collection" leading={<IconButton icon="arrow_back" label="Back" />} />
          <BottomAppBar
            actions={
              <>
                <IconButton icon="search" label="Search" />
                <IconButton icon="delete" label="Delete" />
                <IconButton icon="archive" label="Archive" />
                <IconButton icon="forward" label="Forward" />
              </>
            }
            fab={{ icon: 'add', label: 'New session' }}
          />
          <NavigationBar
            value={nav}
            onChange={setNav}
            destinations={[
              { value: 'today', label: 'Today', icon: 'today' },
              { value: 'calendar', label: 'Calendar', icon: 'calendar_month', badge: true },
              { value: 'hobbies', label: 'Hobbies', icon: 'interests' },
              { value: 'progress', label: 'Progress', icon: 'trending_up', badge: 2 },
            ]}
          />
        </div>
      </Section>
    </div>
  )
}
