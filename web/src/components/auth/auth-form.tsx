import { useState } from 'react'
import { Mail, User, Lock, ArrowRight, UserRound } from 'lucide-react'
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
    <div className="w-full max-w-[430px] overflow-hidden rounded-[20px] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.16)]">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#2fa84f] to-[#259243] px-6 py-7 text-center text-white">
        <div className="mx-auto mb-3 grid h-[58px] w-[58px] place-items-center rounded-full bg-white/15">
          <UserRound className="h-7 w-7" aria-hidden="true" />
        </div>
        <h1 className="font-display m-0 text-[1.85rem]">
          {mode === 'login' ? 'Welkom terug' : 'Maak je account'}
        </h1>
        <p className="mt-2 mb-0 opacity-95">
          {mode === 'login'
            ? 'Log in om verder te gaan met je studiekeuze'
            : 'Begin je reis naar de perfecte studie'}
        </p>
      </div>

      {/* Body */}
      <div className="px-6 pb-6 pt-5">
        {error && <ApiBanner variant="error" message={error} />}

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <label className="mb-4 block">
              <span className="mb-1.5 block font-semibold text-[#111827]">Naam</span>
              <div className="flex items-center gap-2.5 rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5">
                <User className="h-[18px] w-[18px] shrink-0 text-[#6b7280]" aria-hidden="true" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  placeholder="Naam"
                  required
                  className="w-full border-0 bg-transparent text-[1rem] outline-none"
                />
              </div>
            </label>
          )}

          <label className="mb-4 block">
            <span className="mb-1.5 block font-semibold text-[#111827]">Email</span>
            <div className="flex items-center gap-2.5 rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5">
              <Mail className="h-[18px] w-[18px] shrink-0 text-[#6b7280]" aria-hidden="true" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="Email"
                required
                className="w-full border-0 bg-transparent text-[1rem] outline-none"
              />
            </div>
          </label>

          <label className="mb-1 block">
            <span className="mb-1.5 block font-semibold text-[#111827]">Wachtwoord</span>
            <div className="flex items-center gap-2.5 rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5">
              <Lock className="h-[18px] w-[18px] shrink-0 text-[#6b7280]" aria-hidden="true" />
              <input
                type={visible ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                placeholder="Wachtwoord"
                required
                className="w-full border-0 bg-transparent text-[1rem] outline-none"
              />
              <PasswordVisibilityToggle visible={visible} onToggle={() => setVisible(!visible)} />
            </div>
          </label>
          {mode === 'register' && <PasswordStrengthMeter password={password} />}

          {mode === 'login' && (
            <div className="mb-3 mt-1 text-right">
              <a href="/forgot-password" className="text-sm text-[#6b7280] transition-colors hover:text-[#2fa84f]">
                Wachtwoord vergeten?
              </a>
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#2fa84f] px-4 py-3.5 text-[1rem] text-white transition-colors hover:bg-[#259243] disabled:cursor-not-allowed disabled:opacity-80"
          >
            {pending ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              <ArrowRight className="h-[17px] w-[17px]" aria-hidden="true" />
            )}
            <span>{mode === 'login' ? 'Inloggen' : 'Account aanmaken'}</span>
          </button>
        </form>

        <div className="mt-4 flex justify-center gap-1.5">
          <p className="m-0 text-[#111827]">
            {mode === 'login' ? 'Nog geen account?' : 'Heb je al een account?'}
          </p>
          <button
            type="button"
            onClick={() => onModeChange(mode === 'login' ? 'register' : 'login')}
            className="font-bold text-[#2fa84f]"
          >
            {mode === 'login' ? 'Maak er één aan' : 'Log in'}
          </button>
        </div>

        <a href="/" className="mt-4 block text-center text-[#374151]">
          ← Terug naar home
        </a>
      </div>
    </div>
  )
}