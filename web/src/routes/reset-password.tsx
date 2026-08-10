
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Lock, ArrowRight, ShieldCheck } from 'lucide-react'
import { AuthLayout } from '../components/auth/auth-layout'
import { ApiBanner } from '../components/auth/api-banner'
import { SuccessStatePanel } from '../components/auth/success-state-panel'
import { PasswordVisibilityToggle } from '../components/auth/password-visibility-toggle'
import { PasswordStrengthMeter } from '../components/auth/password-strength-meter'
import { authClient } from '../lib/auth-client'
import { useLanguage } from '../lib/i18n/language-context'

export const Route = createFileRoute('/reset-password')({
  component: ResetPassword,
  validateSearch: (search: Record<string, unknown>): { token?: string; error?: string } => ({
    token: typeof search.token === 'string' ? search.token : undefined,
    error: typeof search.error === 'string' ? search.error : undefined,
  }),
})

type PageState = 'invalid' | 'form' | 'success'

function ResetPassword() {
  const { token, error } = Route.useSearch()
  const navigate = useNavigate()
  const { t } = useLanguage()

  const quote = {
    text: t('auth.resetPasswordQuoteText'),
    book: t('auth.resetPasswordQuoteBook'),
    author: '',
  }

  // No separate validate-token endpoint exists in Better Auth — the token
  // is only actually checked when resetPassword() is called. Missing token
  // or a redirect-time ?error=INVALID_TOKEN goes straight to invalid;
  // everything else goes straight to the form.
  const [state, setState] = useState<PageState>(
    !token || error === 'INVALID_TOKEN' ? 'invalid' : 'form',
  )

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [visible, setVisible] = useState(false)
  const [visibleConfirm, setVisibleConfirm] = useState(false)
  const [pwError, setPwError] = useState('')
  const [confirmError, setConfirmError] = useState('')
  const [apiError, setApiError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (state !== 'success') return
    const id = setTimeout(() => navigate({ to: '/login' }), 3000)
    return () => clearTimeout(id)
  }, [state, navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPwError('')
    setConfirmError('')
    setApiError(null)

    if (!password) {
      setPwError(t('auth.passwordRequired'))
      return
    }
    if (password.length < 8) {
      setPwError(t('auth.passwordTooShort'))
      return
    }
    if (password !== confirm) {
      setConfirmError(t('auth.passwordsDontMatch'))
      return
    }
    if (!token) {
      setState('invalid')
      return
    }

    setPending(true)
    const { error: resetError } = await authClient.resetPassword({
      newPassword: password,
      token,
    })
    setPending(false)

    if (resetError) {
      setState('invalid')
      return
    }
    setState('success')
  }

  return (
    <AuthLayout quote={quote}>
      <div className="w-full max-w-[430px] overflow-hidden rounded-[20px] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.16)]">
        <div className="bg-gradient-to-br from-[#2fa84f] to-[#259243] px-6 py-7 text-center text-white">
          <div className="mx-auto mb-3 grid h-[58px] w-[58px] place-items-center rounded-full bg-white/15">
            <ShieldCheck className="h-7 w-7" aria-hidden="true" />
          </div>
          <h1 className="font-display m-0 text-[1.85rem]">{t('auth.resetPasswordTitle')}</h1>
          <p className="mt-2 mb-0 opacity-95">{t('auth.resetPasswordSubtitle')}</p>
        </div>

        <div className="px-6 pb-6 pt-5">
          {state === 'invalid' && (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <p className="text-[#6b7280]">
                {t('auth.linkExpired')}
              </p>
              <Link
                to="/forgot-password"
                className="mt-1 rounded-xl bg-[#2fa84f] px-4 py-3 text-white hover:bg-[#259243]"
              >
                {t('auth.requestNewLink')}
              </Link>
            </div>
          )}

          {state === 'form' && (
            <>
              {apiError && <ApiBanner variant="error" message={apiError} />}
              <form onSubmit={handleSubmit} noValidate>
                <label className="mb-4 block">
                  <span className="mb-1.5 block font-semibold text-[#111827]">{t('auth.newPasswordLabel')}</span>
                  <div className="flex items-center gap-2.5 rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5">
                    <Lock className="h-[18px] w-[18px] shrink-0 text-[#6b7280]" aria-hidden="true" />
                    <input
                      type={visible ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      required
                      className="w-full border-0 bg-transparent text-[1rem] text-[#111827] outline-none"
                    />
                    <PasswordVisibilityToggle visible={visible} onToggle={() => setVisible(!visible)} />
                  </div>
                  <PasswordStrengthMeter password={password} />
                  {pwError && <span className="mt-1 block text-sm text-[#dc2626]">{pwError}</span>}
                </label>

                <label className="mb-1 block">
                  <span className="mb-1.5 block font-semibold text-[#111827]">{t('auth.confirmPasswordLabel')}</span>
                  <div className="flex items-center gap-2.5 rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5">
                    <Lock className="h-[18px] w-[18px] shrink-0 text-[#6b7280]" aria-hidden="true" />
                    <input
                      type={visibleConfirm ? 'text' : 'password'}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      autoComplete="new-password"
                      required
                      className="w-full border-0 bg-transparent text-[1rem] text-[#111827] outline-none"
                    />
                    <PasswordVisibilityToggle
                      visible={visibleConfirm}
                      onToggle={() => setVisibleConfirm(!visibleConfirm)}
                    />
                  </div>
                  {confirmError && <span className="mt-1 block text-sm text-[#dc2626]">{confirmError}</span>}
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
                  <span>{t('auth.savePassword')}</span>
                </button>
              </form>
            </>
          )}

          {state === 'success' && (
            <SuccessStatePanel
              title={t('auth.passwordChanged')}
              description={t('auth.passwordChangedDescription')}
              action={
                <Link
                  to="/login"
                  className="mt-2 inline-flex items-center gap-2 rounded-xl bg-[#2fa84f] px-4 py-3 text-white hover:bg-[#259243]"
                >
                  {t('auth.goToLogin')}
                </Link>
              }
            />
          )}
        </div>
      </div>
    </AuthLayout>
  )
}