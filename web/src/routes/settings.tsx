import { createFileRoute, redirect } from '@tanstack/react-router'
import { getSession } from '@/lib/get-session'

export const Route = createFileRoute('/settings')({
  beforeLoad: async () => {
    const session = await getSession()
    if (!session?.user) {
      throw redirect({ to: '/login', search: { redirect: '/settings' } })
    }
    return { user: session.user }
  },
  component: Settings,
})

function Settings() {
  const { user } = Route.useRouteContext()
  return <div>Logged in as {user.email}</div> // placeholder, replaced once we build the real page
}