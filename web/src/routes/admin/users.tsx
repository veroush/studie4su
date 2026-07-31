import { createFileRoute, useRouteContext } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import '@/styles/admin-users.css'

export const Route = createFileRoute('/admin/users')({
  component: RouteComponent,
})

interface User {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
}

const PAGE_SIZE = 15

interface ToastItem { id: number; type: 'success' | 'error'; message: string }

function RouteComponent() {
  const { user: me } = useRouteContext({ from: '/admin' })

  const [users, setUsers] = useState<User[] | null>(null)
  const [loadError, setLoadError] = useState(false)

  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Tracks an in-progress (unsaved) role selection per user id, so the
  // Save button only appears once the dropdown differs from the saved value.
  const [pendingRoles, setPendingRoles] = useState<Record<string, string>>({})
  const [savingId, setSavingId] = useState<string | null>(null)

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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return (users ?? []).filter((u) => {
      const matchSearch =
        !q ||
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q))
      const matchRole = !filterRole || u.role === filterRole
      return matchSearch && matchRole
    })
  }, [users, search, filterRole])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const page = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  function clearFilters() {
    setSearch('')
    setFilterRole('')
    setCurrentPage(1)
  }

  function goPage(n: number) {
    if (n < 1 || n > totalPages) return
    setCurrentPage(n)
  }

  function handleRoleSelect(userId: string, newRole: string) {
    setPendingRoles((prev) => ({ ...prev, [userId]: newRole }))
  }

  async function saveRole(userId: string) {
    const newRole = pendingRoles[userId]
    if (!newRole) return
    setSavingId(userId)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || data.message || 'Failed to update role')

      setUsers((prev) => (prev ?? []).map((u) => (u.id === userId ? { ...u, role: newRole } : u)))
      setPendingRoles((prev) => {
        const next = { ...prev }
        delete next[userId]
        return next
      })
      showToast(`Role updated to "${newRole}" successfully`, 'success')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update role', 'error')
      console.error('[admin/users] role update error:', err)
    } finally {
      setSavingId(null)
    }
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

      <div className="search-filter-bar">
        <div className="search-field">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search by name or email..."
            autoComplete="off"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
          />
        </div>
        <select className="filter-select" value={filterRole} onChange={(e) => { setFilterRole(e.target.value); setCurrentPage(1) }}>
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="student">Student</option>
        </select>
        <button type="button" className="btn-clear" onClick={clearFilters}>Clear</button>
      </div>

      <div className="table-card">
        <div className="table-responsive">
          <table className="data-table" aria-label="Users list">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users === null && (
                <tr className="table-loading"><td colSpan={5}><span className="loading-dot" />&nbsp; Loading users...</td></tr>
              )}
              {users !== null && loadError && (
                <tr><td colSpan={5} style={{ color: 'var(--admin-red-600)', textAlign: 'center', padding: '32px' }}>Failed to load users. Is the server running?</td></tr>
              )}
              {users !== null && !loadError && page.length === 0 && (
                <tr><td colSpan={5} className="empty-state">{users.length === 0 ? 'No users registered yet.' : 'No users match your search.'}</td></tr>
              )}
              {page.map((u) => {
                const isMe = u.id === me?.id
                const pendingRole = pendingRoles[u.id]
                const hasPendingChange = pendingRole !== undefined && pendingRole !== u.role
                return (
                  <tr key={u.id}>
                    <td>
                      <div className="user-name-cell">
                        {u.name || '—'}
                        {isMe && <span className="you-badge">You</span>}
                      </div>
                      <div className="user-id-label">{u.id}</div>
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <select
                        className="role-select"
                        value={pendingRole ?? u.role}
                        disabled={isMe}
                        title={isMe ? 'You cannot change your own role' : undefined}
                        onChange={(e) => handleRoleSelect(u.id, e.target.value)}
                      >
                        <option value="student">Student</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className={`action-btn action-btn-save${hasPendingChange ? ' visible' : ''}`}
                          disabled={savingId === u.id}
                          onClick={() => saveRole(u.id)}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          {savingId === u.id ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <div className="pagination-wrap">
            <span className="pagination-info">
              Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            {totalPages > 1 && (
              <div className="pagination">
                <button type="button" className="pagination-btn" disabled={currentPage === 1} onClick={() => goPage(currentPage - 1)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button key={n} type="button" className={`pagination-page${n === currentPage ? ' active' : ''}`} onClick={() => goPage(n)}>{n}</button>
                ))}
                <button type="button" className="pagination-btn" disabled={currentPage === totalPages} onClick={() => goPage(currentPage + 1)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

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