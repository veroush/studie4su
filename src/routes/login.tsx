import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { AuthLayout } from '../components/auth/auth-layout'
import { AuthForm } from '../components/auth/auth-form'
import { authClient } from '../lib/auth-client'
import { useLanguage } from '../lib/i18n/language-context'

type AuthMode = 'login' | 'register'

export const Route = createFileRoute('/login')({
  component: Login,
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => ({
    redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
  }),
})

function Login() {
  const { redirect } = Route.useSearch()
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [mode, setMode] = useState<AuthMode>('login')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const quotes: Record<AuthMode, { text: string; book: string; author: string }> = {
    login: {
      text: t('auth.loginQuoteText'),
      book: t('auth.loginQuoteBook'),
      author: t('auth.loginQuoteAuthor'),
    },
    register: {
      text: t('auth.registerQuoteText'),
      book: t('auth.registerQuoteBook'),
      author: t('auth.registerQuoteAuthor'),
    },
  }

  function resolveDestination(role?: string) {
    if (redirect) return redirect
    return role === 'admin' ? '/admin/dashboard' : '/'
  }

  async function handleSubmit(values: { name?: string; email: string; password: string }) {
    setError(null)
    setPending(true)

    if (mode === 'login') {
      const { data, error: authError } = await authClient.signIn.email({
        email: values.email,
        password: values.password,
      })

      setPending(false)

      if (authError) {
        setError(t('auth.loginError'))
        return
      }

      navigate({ to: resolveDestination(data?.user?.role) })
      return
    }

    const { data, error: authError } = await authClient.signUp.email({
      name: values.name ?? '',
      email: values.email,
      password: values.password,
    })

    setPending(false)

    if (authError) {
      setError(
        authError.message?.toLowerCase().includes('already')
          ? t('auth.registerEmailInUseError')
          : t('auth.registerGenericError'),
      )
      return
    }

    // New sign-ups always default to role "student" (see auth.ts additionalFields),
    // so this never resolves to /admin/dashboard for a fresh registration.
    navigate({ to: resolveDestination(data?.user?.role) })
  }

  return (
    <AuthLayout quote={quotes[mode]}>
      <AuthForm mode={mode} onModeChange={setMode} onSubmit={handleSubmit} pending={pending} error={error} />
    </AuthLayout>
  )
}