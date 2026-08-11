import { Link } from '@tanstack/react-router'
import { authClient } from '@/lib/auth-client'

interface AuthGateProps {
  children: React.ReactNode
  resumeTo: string
}

// Wraps quiz results — if the user isn't logged in, prompts them to
// log in and resume this exact step afterwards instead of the result.
export function AuthGate({ children, resumeTo }: AuthGateProps) {
  const { data: session } = authClient.useSession()

  if (session?.user) return <>{children}</>

  return (
    <div role="status">
      <p>Log in om je resultaten te bekijken en te bewaren.</p>
      <Link to="/login" search={{ redirect: resumeTo }}>
        Inloggen
      </Link>
    </div>
  )
}
