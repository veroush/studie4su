import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { getSession } from '@/lib/get-session'

export const Route = createFileRoute('/admin')({
  beforeLoad: async ({ location }) => {
    const session = await getSession()
    if (!session?.user) {
      throw redirect({ to: '/login', search: { redirect: location.pathname } })
    }
    if (session.user.role !== 'admin') {
      throw redirect({ to: '/' })
    }
    return { user: session.user }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <Outlet />
}