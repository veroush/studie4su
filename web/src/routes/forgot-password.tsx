// web/src/routes/forgot-password.tsx
import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { Mail, ArrowRight, KeyRound } from 'lucide-react'
import { AuthLayout } from '../components/auth/auth-layout'
import { ApiBanner } from '../components/auth/api-banner'
import { SuccessStatePanel } from '../components/auth/success-state-panel'
import { authClient } from '../lib/auth-client'

export const Route = createFileRoute('/forgot-password')({
  component: ForgotPassword,
})

const quote = {
  text: '"Het begin is het belangrijkste deel van het werk."',
  book: 'De Republiek',
  author: 'by Plato',
}

function validateEmail(value: string) {
  if (!value) return 'Vul je e-mailadres in.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Vul een geldig e-mailadres in.'
  return ''
}

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [fieldError, setFieldError] = useState('')
  const [apiError, setApiError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const err = validateEmail(email)
    setFieldError(err)
    if (err) return

    setPending(true)
    setApiError(null)

    // Never reveals whether the account exists — same silent-success
    // behavior as v1.
    const { error } = await authClient.requestPasswordReset({
      email,
      redirectTo: '/reset-password',
    })

    setPending(false)

    if (error) {
      setApiError('Er is iets misgegaan. Probeer het later opnieuw.')
      return
    }
    setSent(true)
  }

  return (
    <AuthLayout quote={quote}>
      <div className="w-full max-w-[430px] overflow-hidden rounded-[20px] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.16)]">
        <div className="bg-gradient-to-br from-[#2fa84f] to-[#259243] px-6 py-7 text-center text-white">
          <div className="mx-auto mb-3 grid h-[58px] w-[58px] place-items-center rounded-full bg-white/15">
            <KeyRound className="h-7 w-7" aria-hidden="true" />
          </div>
          <h1 className="font-display m-0 text-[1.85rem]">Wachtwoord vergeten</h1>
          <p className="mt-2 mb-0 opacity-95">Vul je e-mailadres in om een resetlink te ontvangen</p>
        </div>

        <div className="px-6 pb-6 pt-5">
          {apiError && <ApiBanner variant="error" message={apiError} />}

          {sent ? (
            <SuccessStatePanel
              title="Link verstuurd!"
              description="Controleer je inbox en klik op de link om je wachtwoord opnieuw in te stellen. Vergeet ook je spammap te controleren."
            />
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <label className="mb-1 block">
                <span className="mb-1.5 block font-semibold text-[#111827]">E-mailadres</span>
                <div className="flex items-center gap-2.5 rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5">
                  <Mail className="h-[18px] w-[18px] shrink-0 text-[#6b7280]" aria-hidden="true" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    placeholder="jouw@email.com"
                    required
                    className="w-full border-0 bg-transparent text-[1rem] text-[#111827] outline-none"
                  />
                </div>
                {fieldError && <span className="mt-1 block text-sm text-[#dc2626]">{fieldError}</span>}
              </label>

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
                <span>Resetlink versturen</span>
              </button>
            </form>
          )}

          <Link to="/login" className="mt-4 block text-center text-[#374151]">
            ← Terug naar inloggen
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}