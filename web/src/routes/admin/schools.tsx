import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import '@/styles/admin-schools.css'

export const Route = createFileRoute('/admin/schools')({
  component: RouteComponent,
})

interface School {
  id: string
  name: string
  shortName: string | null
  type: string
  website: string | null
  location: string | null
  createdAt: string
  _count?: { programs: number }
}

type SortCol = 'name' | 'type' | 'programs'
type SortDir = 'asc' | 'desc'

const PAGE_SIZE = 10

const EMPTY_FORM = { name: '', shortName: '', type: '', location: '', website: '' }

interface ToastItem { id: number; type: 'success' | 'error'; message: string }

function SortIcon() {
  return (
    <svg className="sort-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M7 15l5 5 5-5" /><path d="M7 9l5-5 5 5" />
    </svg>
  )
}

function RouteComponent() {
  const [schools, setSchools] = useState<School[] | null>(null)
  const [loadError, setLoadError] = useState(false)

  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterLocation, setFilterLocation] = useState('')
  const [sortCol, setSortCol] = useState<SortCol>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [currentPage, setCurrentPage] = useState(1)

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const [toasts, setToasts] = useState<ToastItem[]>([])

  function showToast(message: string, type: 'success' | 'error' = 'success') {
    const id = Date.now()
    setToasts((t) => [...t, { id, type, message }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000)
  }

  async function loadSchools() {
    try {
      const res = await fetch('/api/admin/schools')
      if (!res.ok) throw new Error('Failed to load')
      const data = await res.json()
      setSchools(Array.isArray(data) ? data : [])
      setLoadError(false)
    } catch (err) {
      setLoadError(true)
      console.error('[admin/schools] load error:', err)
    }
  }

  useEffect(() => {
    loadSchools()
  }, [])

  const locations = useMemo(() => {
    const set = new Set<string>()
    ;(schools ?? []).forEach((s) => s.location && set.add(s.location))
    return Array.from(set).sort()
  }, [schools])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const list = (schools ?? []).filter((s) => {
      const matchSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        (s.shortName && s.shortName.toLowerCase().includes(q)) ||
        s.id.toLowerCase().includes(q)
      const matchType = !filterType || s.type === filterType
      const matchLoc = !filterLocation || s.location === filterLocation
      return matchSearch && matchType && matchLoc
    })

    list.sort((a, b) => {
      let va: string | number, vb: string | number
      if (sortCol === 'name') { va = a.name.toLowerCase(); vb = b.name.toLowerCase() }
      else if (sortCol === 'type') { va = a.type.toLowerCase(); vb = b.type.toLowerCase() }
      else { va = a._count?.programs ?? 0; vb = b._count?.programs ?? 0 }
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })

    return list
  }, [schools, search, filterType, filterLocation, sortCol, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const page = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  function handleSort(col: SortCol) {
    if (sortCol === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortCol(col); setSortDir('asc') }
    setCurrentPage(1)
  }

  function clearFilters() {
    setSearch('')
    setFilterType('')
    setFilterLocation('')
    setCurrentPage(1)
  }

  function goPage(n: number) {
    if (n < 1 || n > totalPages) return
    setCurrentPage(n)
  }

  function openAddModal() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormErrors({})
    setFormOpen(true)
  }

  function openEditModal(s: School) {
    setEditingId(s.id)
    setForm({
      name: s.name,
      shortName: s.shortName ?? '',
      type: s.type,
      location: s.location ?? '',
      website: s.website ?? '',
    })
    setFormErrors({})
    setFormOpen(true)
  }

  function closeFormModal() {
    setFormOpen(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormErrors({})
  }

  function validateForm() {
    const errors: Record<string, string> = {}
    if (!form.name.trim()) errors.name = 'Name is required'
    if (!form.type) errors.type = 'Type is required'
    if (!form.location.trim()) errors.location = 'Location is required'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function submitForm() {
    if (!validateForm()) return
    setSaving(true)

    const body = {
      name: form.name.trim(),
      shortName: form.shortName.trim() || null,
      type: form.type,
      location: form.location.trim(),
      website: form.website.trim() || null,
    }

    try {
      const res = await fetch(editingId ? `/api/admin/schools/${editingId}` : '/api/admin/schools', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Save failed')

      if (editingId) {
        setSchools((prev) => (prev ?? []).map((s) => (s.id === editingId ? { ...s, ...data } : s)))
        showToast('School updated successfully', 'success')
      } else {
        setSchools((prev) => [{ ...data, _count: { programs: 0 } }, ...(prev ?? [])])
        showToast('School added successfully', 'success')
      }
      closeFormModal()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save school', 'error')
      console.error('[admin/schools] save error:', err)
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/schools/${deleteTarget.id}`, { method: 'DELETE' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Delete failed')
      setSchools((prev) => (prev ?? []).filter((s) => s.id !== deleteTarget.id))
      showToast('School deleted successfully', 'success')
      setDeleteTarget(null)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete school', 'error')
      console.error('[admin/schools] delete error:', err)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h2 className="page-heading">All Schools</h2>
          <p className="page-subheading">
            {schools === null ? 'Loading...' : `${schools.length} school${schools.length !== 1 ? 's' : ''} in the system`}
          </p>
        </div>
        <button type="button" className="btn-add" onClick={openAddModal}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add New School
        </button>
      </div>

      <div className="search-filter-bar">
        <div className="search-field">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search schools..."
            autoComplete="off"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
          />
        </div>
        <select className="filter-select" value={filterType} onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1) }}>
          <option value="">All Types</option>
          <option value="University">University</option>
          <option value="HBO">HBO</option>
          <option value="MBO">MBO</option>
        </select>
        <select className="filter-select" value={filterLocation} onChange={(e) => { setFilterLocation(e.target.value); setCurrentPage(1) }}>
          <option value="">All Locations</option>
          {locations.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
        </select>
        <button type="button" className="btn-clear" onClick={clearFilters}>Clear Filters</button>
      </div>

      <div className="table-card">
        <div className="table-responsive">
          <table className="data-table" aria-label="Schools list">
            <thead>
              <tr>
                <th className={`sortable${sortCol === 'name' ? ` sort-${sortDir}` : ''}`} onClick={() => handleSort('name')}>School Name<SortIcon /></th>
                <th className={`sortable${sortCol === 'type' ? ` sort-${sortDir}` : ''}`} onClick={() => handleSort('type')}>Type<SortIcon /></th>
                <th>Location</th>
                <th className={`sortable${sortCol === 'programs' ? ` sort-${sortDir}` : ''}`} onClick={() => handleSort('programs')}>Programs<SortIcon /></th>
                <th>Website</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {schools === null && (
                <tr className="table-loading"><td colSpan={6}><span className="loading-dot" />&nbsp; Loading schools...</td></tr>
              )}
              {schools !== null && loadError && (
                <tr><td colSpan={6} style={{ color: 'var(--admin-red-600)', textAlign: 'center', padding: '32px' }}>Failed to load schools. Is the server running?</td></tr>
              )}
              {schools !== null && !loadError && page.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                      <p>{schools.length === 0 ? 'No schools found in the database.' : 'No schools match your filters.'}</p>
                    </div>
                  </td>
                </tr>
              )}
              {page.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div className="school-name-cell">{s.name}</div>
                    <div className="school-id">{s.id}</div>
                  </td>
                  <td><span className={`type-badge type-${s.type}`}>{s.type}</span></td>
                  <td>{s.location || '—'}</td>
                  <td><span className="program-count">📚 {s._count?.programs ?? 0}</span></td>
                  <td>
                    {s.website ? (
                      <a className="website-link" href={s.website} target="_blank" rel="noopener noreferrer">
                        {s.website.replace(/^https?:\/\//, '')}
                      </a>
                    ) : (
                      <span className="no-website">—</span>
                    )}
                  </td>
                  <td>
                    <div className="table-actions">
                      <button type="button" className="action-btn action-btn-edit" onClick={() => openEditModal(s)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        Edit
                      </button>
                      <button type="button" className="action-btn action-btn-delete" onClick={() => setDeleteTarget({ id: s.id, name: s.name })}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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

      {deleteTarget && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title" onClick={(e) => { if (e.target === e.currentTarget) setDeleteTarget(null) }}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title" id="delete-modal-title">Delete School</h3>
              <button type="button" className="modal-close" aria-label="Close modal" onClick={() => setDeleteTarget(null)}>✕</button>
            </div>
            <div className="modal-body">
              Are you sure you want to delete <strong>{deleteTarget.name}</strong>? This will also delete all linked programs and open houses. This action cannot be undone.
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-cancel" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button type="button" className="btn-delete-confirm" disabled={deleting} onClick={confirmDelete}>
                {deleting ? 'Deleting...' : 'Delete School'}
              </button>
            </div>
          </div>
        </div>
      )}

      {formOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="form-modal-title" onClick={(e) => { if (e.target === e.currentTarget) closeFormModal() }}>
          <div className="modal modal-lg">
            <div className="modal-header">
              <h3 className="modal-title" id="form-modal-title">{editingId ? 'Edit School' : 'Add New School'}</h3>
              <button type="button" className="modal-close" aria-label="Close modal" onClick={closeFormModal}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="field-name">School Name <span className="required">*</span></label>
                  <input
                    className={`form-input${formErrors.name ? ' has-error' : ''}`}
                    id="field-name"
                    type="text"
                    placeholder="Full name of the school"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  />
                  <span className="form-error">{formErrors.name}</span>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="field-shortname">Short Name</label>
                  <input
                    className="form-input"
                    id="field-shortname"
                    type="text"
                    placeholder="e.g. AdeKUS"
                    value={form.shortName}
                    onChange={(e) => setForm((f) => ({ ...f, shortName: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="field-type">Type <span className="required">*</span></label>
                  <select
                    className={`form-input${formErrors.type ? ' has-error' : ''}`}
                    id="field-type"
                    value={form.type}
                    onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                  >
                    <option value="">Select type...</option>
                    <option value="University">University</option>
                    <option value="HBO">HBO</option>
                    <option value="MBO">MBO</option>
                  </select>
                  <span className="form-error">{formErrors.type}</span>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="field-location">Location <span className="required">*</span></label>
                  <input
                    className={`form-input${formErrors.location ? ' has-error' : ''}`}
                    id="field-location"
                    type="text"
                    placeholder="e.g. Paramaribo"
                    value={form.location}
                    onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                  />
                  <span className="form-error">{formErrors.location}</span>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="field-website">Website</label>
                  <input
                    className="form-input"
                    id="field-website"
                    type="url"
                    placeholder="https://example.sr"
                    value={form.website}
                    onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-cancel" onClick={closeFormModal}>Cancel</button>
              <button type="button" className="form-submit-btn" disabled={saving} onClick={submitForm}>
                {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add School'}
              </button>
            </div>
          </div>
        </div>
      )}

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