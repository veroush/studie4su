import { createFileRoute, useRouteContext } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import '@/styles/admin-users.css'
import { UserList, type AdminUser } from '@/components/users/user-list'

export const Route = createFileRoute('/admin/users')({
  component: RouteComponent,
})

interface ToastItem { id: number; type: 'success' | 'error'; message: string }

function RouteComponent() {
  const { user: me } = useRouteContext({ from: '/admin' })

  const [users, setUsers] = useState<AdminUser[] | null>(null)
  const [loadError, setLoadError] = useState(false)

  const [toasts, setToasts] = useState<ToastItem[]>([])

  function showToast(message: string, type: 'success' | 'error' = 'success') {
    const id = Date.now()
    setToasts((t) => [...t, { id, type, message }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000)
  }

  async function loadUsers() {
    try {
      const res = await fetch('/api/admin/users')
      if (!res.ok) throw new Error('Failed to load')
      const data = await res.json()
      setUsers(Array.isArray(data) ? data : [])
      setLoadError(false)
    } catch (err) {
      setLoadError(true)
      console.error('[admin/users] load error:', err)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const stats = useMemo(() => {
    const list = users ?? []
    return {
      total: list.length,
      admins: list.filter((u) => u.role === 'admin').length,
      students: list.filter((u) => u.role === 'student').length,
    }
  }, [users])

  async function handleSaveRole(userId: string, newRole: string) {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || data.message || 'Failed to update role')

    setUsers((prev) => (prev ?? []).map((u) => (u.id === userId ? { ...u, role: newRole } : u)))
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h2 className="page-heading">All Users</h2>
          <p className="page-subheading">
            {users === null ? 'Loading...' : `${stats.total} user${stats.total !== 1 ? 's' : ''} registered`}
          </p>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-mini-card">
          <div className="stat-mini-label">Total Users</div>
          <div className="stat-mini-value">{users === null ? '—' : stats.total}</div>
        </div>
        <div className="stat-mini-card">
          <div className="stat-mini-label">Admins</div>
          <div className="stat-mini-value">{users === null ? '—' : stats.admins}</div>
        </div>
        <div className="stat-mini-card">
          <div className="stat-mini-label">Students</div>
          <div className="stat-mini-value">{users === null ? '—' : stats.students}</div>
        </div>
      </div>

      <UserList
        users={users}
        loadError={loadError}
        currentUserId={me?.id}
        onSaveRole={handleSaveRole}
        onToast={showToast}
      />

      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span className="toast-icon-wrap">{t.type === 'success' ? '✅' : '❌'}</span>
            <span className="toast-msg">{t.message}</span>
            <button type="button" className="toast-close-btn" onClick={() => setToasts((ts) => ts.filter((x) => x.id !== t.id))}>✕</button>
          </div>
        ))}
      </div>
    </>
  )
}