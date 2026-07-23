import { useState } from 'react'
import { Mail, User, Lock } from 'lucide-react'
import { PasswordVisibilityToggle } from './password-visibility-toggle'
import { PasswordStrengthMeter } from './password-strength-meter'
import { ApiBanner } from './api-banner'

type AuthMode = 'login' | 'register'

interface AuthFormValues {
  name?: string
  email: string
  password: string
}

interface AuthFormProps {
  mode: AuthMode
  onModeChange: (mode: AuthMode) => void
  onSubmit: (values: AuthFormValues) => void
  pending?: boolean
  error?: string | null
}

export function AuthForm({ mode, onModeChange, onSubmit, pending = false, error }: AuthFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [visible, setVisible] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit(mode === 'register' ? { name, email, password } : { email, password })
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>{mode === 'login' ? 'Inloggen' : 'Account aanmaken'}</h1>

      {error && <ApiBanner variant="error" message={error} />}

      {mode === 'register' && (
        <label>
          <span>Naam</span>
          <User aria-hidden="true" />
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
        </label>
      )}

      <label>
        <span>E-mailadres</span>
        <Mail aria-hidden="true" />
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
      </label>

      <label>
        <span>Wachtwoord</span>
        <Lock aria-hidden="true" />
        <input
          type={visible ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          required
        />
        <PasswordVisibilityToggle visible={visible} onToggle={() => setVisible(!visible)} />
      </label>
      {mode === 'register' && <PasswordStrengthMeter password={password} />}

      {mode === 'login' && <a href="/forgot-password">Wachtwoord vergeten?</a>}

      <button type="submit" disabled={pending}>
        {mode === 'login' ? 'Inloggen' : 'Account aanmaken'}
      </button>

      <button type="button" onClick={() => onModeChange(mode === 'login' ? 'register' : 'login')}>
        {mode === 'login' ? 'Nog geen account? Registreren' : 'Al een account? Inloggen'}
      </button>
    </form>
  )
}
