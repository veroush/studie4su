import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { AuthLayout } from '../components/auth/auth-layout'
import { AuthForm } from '../components/auth/auth-form'
import { authClient } from '../lib/auth-client'

type AuthMode = 'login' | 'register'

export const Route = createFileRoute('/login')({
  component: Login,
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => ({
    redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
  }),
})

const quotes: Record<AuthMode, { text: string; book: string; author: string }> = {
  login: {
    text: '"Every failure is a step to success"',
    book: 'Lectures on the History of Moral Philosophy in England',
    author: 'by William Whewell',
  },
  register: {
    text: '"The strongest principle of growth lies in the human choice."',
    book: 'Daniel Deronda',
    author: 'by George Eliot',
  },
}

function Login() {
  const { redirect } = Route.useSearch()
  const navigate = useNavigate()
  const [mode, setMode] = useState<AuthMode>('login')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
        setError('Onjuist e-mailadres of wachtwoord.')
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
          ? 'Dit e-mailadres is al in gebruik.'
          : 'Er is iets misgegaan. Probeer het opnieuw.',
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