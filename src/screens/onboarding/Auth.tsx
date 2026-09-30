import { useState, type FormEvent } from 'react'
import { Button, CircularProgress, IconButton, TextField } from '../../components'
import { useGo } from '../../app/nav'
import { Screen } from '../../app/Screen'
import { useStore } from '../../app/store'
import { stagger } from '../../app/motion'
import './onboarding.css'

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())

function PasswordField({ value, onChange, error, supportingText, autoComplete }: { value: string; onChange: (v: string) => void; error?: boolean; supportingText?: string; autoComplete: string }) {
  const [visible, setVisible] = useState(false)
  return (
    <TextField
      label="Password"
      type={visible ? 'text' : 'password'}
      value={value}
      autoComplete={autoComplete}
      onChange={(e) => onChange(e.target.value)}
      error={error}
      supportingText={supportingText}
      leadingIcon="lock"
      trailing={
        <IconButton
          icon={visible ? 'visibility_off' : 'visibility'}
          label={visible ? 'Hide password' : 'Show password'}
          onClick={() => setVisible((v) => !v)}
        />
      }
    />
  )
}

function Submitting() {
  return (
    <span className="dm-submitting">
      <CircularProgress size={18} thickness={2.5} label="Working" />
    </span>
  )
}

export function SignIn() {
  const { state, dispatch } = useStore()
  const { go } = useGo()
  const [email, setEmail] = useState(state.profile.email)
  const [password, setPassword] = useState('')
  const [tried, setTried] = useState(false)
  const [busy, setBusy] = useState(false)

  const emailError = tried && !emailOk(email) ? 'Enter an email like alex@example.com' : undefined
  const passwordError = tried && password.length < 8 ? 'Passwords are at least 8 characters' : undefined

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setTried(true)
    if (!emailOk(email) || password.length < 8) return
    setBusy(true)
    setTimeout(() => {
      dispatch({ type: 'signIn' })
      go(state.profile.onboarded ? '/' : '/onboarding/hobbies', 'up', { replace: true })
    }, 650)
  }

  return (
    <Screen
      title="Welcome back"
      subtitle="Sign in to continue your rhythm."
      back="/welcome"
      footer={
        <>
          <Button type="submit" form="sign-in" disabled={busy}>
            {busy ? <Submitting /> : 'Sign in'}
          </Button>
          <Button variant="tonal" onClick={() => go('/sign-up')}>
            Create an account
          </Button>
        </>
      }
    >
      <form id="sign-in" className="dm-stack-16 dm-enter" onSubmit={submit} noValidate>
        <div style={stagger(0)}>
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            leadingIcon="mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!emailError}
            supportingText={emailError}
          />
        </div>
        <div style={stagger(1)}>
          <PasswordField value={password} onChange={setPassword} error={!!passwordError} supportingText={passwordError ?? 'Any 8+ characters work in this demo'} autoComplete="current-password" />
        </div>
      </form>
    </Screen>
  )
}

export function SignUp() {
  const { dispatch } = useStore()
  const { go } = useGo()
  const [name, setName] = useState('Alex Morgan')
  const [email, setEmail] = useState('alex@example.com')
  const [password, setPassword] = useState('')
  const [tried, setTried] = useState(false)
  const [busy, setBusy] = useState(false)

  const nameError = tried && !name.trim() ? 'Tell us what to call you' : undefined
  const emailError = tried && !emailOk(email) ? 'Enter an email like alex@example.com' : undefined
  const passwordError = tried && password.length < 8 ? `${8 - password.length} more characters needed` : undefined

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setTried(true)
    if (!name.trim() || !emailOk(email) || password.length < 8) return
    setBusy(true)
    setTimeout(() => {
      dispatch({ type: 'signUp', name: name.trim(), email: email.trim() })
      go('/onboarding/hobbies', 'up', { replace: true })
    }, 650)
  }

  return (
    <Screen
      title="Create your account"
      subtitle="One place for every curiosity."
      back="/welcome"
      footer={
        <>
          <Button type="submit" form="sign-up" disabled={busy}>
            {busy ? <Submitting /> : 'Create account'}
          </Button>
          <Button variant="tonal" onClick={() => go('/sign-in')}>
            I already have an account
          </Button>
        </>
      }
    >
      <form id="sign-up" className="dm-stack-16 dm-enter" onSubmit={submit} noValidate>
        <div style={stagger(0)}>
          <TextField label="Name" autoComplete="name" leadingIcon="person" value={name} onChange={(e) => setName(e.target.value)} error={!!nameError} supportingText={nameError} />
        </div>
        <div style={stagger(1)}>
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            leadingIcon="mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!emailError}
            supportingText={emailError}
          />
        </div>
        <div style={stagger(2)}>
          <PasswordField value={password} onChange={setPassword} error={!!passwordError} supportingText={passwordError ?? '8+ characters'} autoComplete="new-password" />
        </div>
      </form>
    </Screen>
  )
}
