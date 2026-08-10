import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import '@/styles/admin-openhouses.css'

export const Route = createFileRoute('/admin/openhouses')({
  component: RouteComponent,
})

interface School {
  id: string
  name: string
}

interface OpenHouse {
  id: string
  title: string
  description: string | null
  descriptionEn: string | null
  date: string
  location: string | null
  isOnline: boolean
  registrationUrl: string | null
  isActive: boolean
  schoolId: string | null
  school?: { id: string; name: string; shortName: string | null } | null
  registrationCount?: number
}

type SortCol = 'title' | 'date' | 'status'
type SortDir = 'asc' | 'desc'

const PAGE_SIZE = 10

const EMPTY_FORM = {
  title: '',
  schoolId: '',
  date: '',
  location: '',
  isOnline: false,
  registrationUrl: '',
  isActive: true,
  description: '',
  descriptionEn: '',
}

interface ToastItem { id: number; type: 'success' | 'error'; message: string }

function SortIcon() {
  return (
    <svg className="sort-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M7 15l5 5 5-5" /><path d="M7 9l5-5 5 5" />
    </svg>
  )
}

function toLocalDatetimeInputValue(iso: string) {
  const d = new Date(iso)
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
}

function getStatusLabel(oh: OpenHouse): 'today' | 'upcoming' | 'past' {
  const d = new Date(oh.date)
  d.setHours(0, 0, 0, 0)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  if (d.getTime() === now.getTime()) return 'today'
  return d > now ? 'upcoming' : 'past'
}

function StatusBadge({ oh }: { oh: OpenHouse }) {
  const label = getStatusLabel(oh)
  const map: Record<string, [string, string]> = {
    upcoming: ['status-upcoming', 'Upcoming'],
    today: ['status-today', 'Today'],
    past: ['status-past', 'Past'],
  }
  const [cls, text] = map[label]
  return <span className={`status-badge ${cls}`}>{text}</span>
}

function RouteComponent() {
  const [openHouses, setOpenHouses] = useState<OpenHouse[] | null>(null)
  const [schools, setSchools] = useState<School[]>([])
  const [loadError, setLoadError] = useState(false)

  const [search, setSearch] = useState('')
  const [filterSchool, setFilterSchool] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [sortCol, setSortCol] = useState<SortCol>('date')
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

  async function loadOpenHouses() {
    try {
      const res = await fetch('/api/openhouses?includeInactive=true')
      if (!res.ok) throw new Error('Failed to load')
      const data = await res.json()
      setOpenHouses(Array.isArray(data) ? data : [])
      setLoadError(false)
    } catch (err) {
      setLoadError(true)
      console.error('[admin/openhouses] load error:', err)
    }
  }

  async function loadSchools() {
    try {
      const res = await fetch('/api/admin/schools')
      if (!res.ok) throw new Error('Failed to load schools')
      const data = await res.json()
      setSchools(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('[admin/openhouses] schools load error:', err)
    }
  }

  useEffect(() => {
    loadOpenHouses()
    loadSchools()
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const thisMonth = now.getMonth()
    const thisYear = now.getFullYear()

    const list = (openHouses ?? []).filter((oh) => {
      const matchSearch =
        !q ||
        oh.title.toLowerCase().includes(q) ||
        (oh.location && oh.location.toLowerCase().includes(q)) ||
        (oh.school?.name && oh.school.name.toLowerCase().includes(q))

      const matchSchool = !filterSchool || oh.schoolId === filterSchool

      const matchType =
        !filterType ||
        (filterType === 'online' && oh.isOnline) ||
        (filterType === 'inperson' && !oh.isOnline)

      const matchStatus =
        !filterStatus ||
        (filterStatus === 'active' && oh.isActive) ||
        (filterStatus === 'inactive' && !oh.isActive)

      let matchDate = true
      if (filterDate) {
        const d = new Date(oh.date)
        d.setHours(0, 0, 0, 0)
        if (filterDate === 'upcoming') matchDate = d >= now
        if (filterDate === 'past') matchDate = d < now
        if (filterDate === 'this-month') matchDate = d.getMonth() === thisMonth && d.getFullYear() === thisYear
        if (filterDate === 'next-month') {
          const nm = (thisMonth + 1) % 12
          const ny = thisMonth === 11 ? thisYear + 1 : thisYear
          matchDate = d.getMonth() === nm && d.getFullYear() === ny
        }
      }

      return matchSearch && matchSchool && matchType && matchStatus && matchDate
    })

    list.sort((a, b) => {
      let va: string | number, vb: string | number
      if (sortCol === 'title') { va = a.title.toLowerCase(); vb = b.title.toLowerCase() }
      else if (sortCol === 'date') { va = new Date(a.date).getTime(); vb = new Date(b.date).getTime() }
      else { va = getStatusLabel(a); vb = getStatusLabel(b) }
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })

    return list
  }, [openHouses, search, filterSchool, filterDate, filterType, filterStatus, sortCol, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const page = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  function handleSort(col: SortCol) {
    if (sortCol === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortCol(col); setSortDir('asc') }
    setCurrentPage(1)
  }

  function clearFilters() {
    setSearch('')
    setFilterSchool('')
    setFilterDate('')
    setFilterType('')
    setFilterStatus('')
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

  function openEditModal(oh: OpenHouse) {
    setEditingId(oh.id)
    setForm({
      title: oh.title,
      schoolId: oh.schoolId ?? '',
      date: toLocalDatetimeInputValue(oh.date),
      location: oh.location ?? '',
      isOnline: oh.isOnline,
      registrationUrl: oh.registrationUrl ?? '',
      isActive: oh.isActive,
      description: oh.description ?? '',
      descriptionEn: oh.descriptionEn ?? '',
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
    if (!form.title.trim()) errors.title = 'Title is required'
    if (!form.schoolId) errors.schoolId = 'School is required'
    if (!form.date) errors.date = 'Date is required'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function submitForm() {
    if (!validateForm()) return
    setSaving(true)

    const body = {
      title: form.title.trim(),
      schoolId: form.schoolId,
      date: new Date(form.date).toISOString(),
      location: form.location.trim() || null,
      isOnline: form.isOnline,
      registrationUrl: form.registrationUrl.trim() || null,
      isActive: form.isActive,
      description: form.description.trim() || null,
      descriptionEn: form.descriptionEn.trim() || null,
    }

    try {
      const res = await fetch(editingId ? `/api/openhouses/${editingId}` : '/api/openhouses', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Save failed')

      if (editingId) {
        setOpenHouses((prev) => (prev ?? []).map((oh) => (oh.id === editingId ? { ...oh, ...data } : oh)))
        showToast('Open house updated successfully', 'success')
      } else {
        setOpenHouses((prev) => [data, ...(prev ?? [])])
        showToast('Open house added successfully', 'success')
      }
      closeFormModal()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save open house', 'error')
      console.error('[admin/openhouses] save error:', err)
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/openhouses/${deleteTarget.id}`, { method: 'DELETE' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Delete failed')
      setOpenHouses((prev) => (prev ?? []).filter((oh) => oh.id !== deleteTarget.id))
      showToast('Open house deleted successfully', 'success')
      setDeleteTarget(null)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete open house', 'error')
      console.error('[admin/openhouses] delete error:', err)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h2 className="page-heading">All Open Houses</h2>
          <p className="page-subheading">
            {openHouses === null ? 'Loading...' : `${openHouses.length} event${openHouses.length !== 1 ? 's' : ''} in the system`}
          </p>
        </div>
        <button type="button" className="btn-add" onClick={openAddModal}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Open House
        </button>
      </div>

      <div className="search-filter-bar">
        <div className="search-field">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search by title or location..."
            autoComplete="off"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
          />
        </div>
        <select className="filter-select" value={filterSchool} onChange={(e) => { setFilterSchool(e.target.value); setCurrentPage(1) }}>
          <option value="">All Schools</option>
          {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select className="filter-select" value={filterDate} onChange={(e) => { setFilterDate(e.target.value); setCurrentPage(1) }}>
          <option value="">All Dates</option>
          <option value="upcoming">Upcoming</option>
          <option value="past">Past</option>
          <option value="this-month">This Month</option>
          <option value="next-month">Next Month</option>
        </select>
        <select className="filter-select" value={filterType} onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1) }}>
          <option value="">Online & In-person</option>
          <option value="online">Online Only</option>
          <option value="inperson">In-person Only</option>
        </select>
        <select className="filter-select" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1) }}>
          <option value="">Active & Inactive</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>
        <button type="button" className="btn-clear" onClick={clearFilters}>Clear Filters</button>
      </div>

      <div className="table-card">
        <div className="table-responsive">
          <table className="data-table" aria-label="Open houses list">
            <thead>
              <tr>
                <th className={`sortable${sortCol === 'title' ? ` sort-${sortDir}` : ''}`} onClick={() => handleSort('title')}>Title / School<SortIcon /></th>
                <th className={`sortable${sortCol === 'date' ? ` sort-${sortDir}` : ''}`} onClick={() => handleSort('date')}>Date<SortIcon /></th>
                <th>Location</th>
                <th className={`sortable${sortCol === 'status' ? ` sort-${sortDir}` : ''}`} onClick={() => handleSort('status')}>Status<SortIcon /></th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {openHouses === null && (
                <tr className="table-loading"><td colSpan={5}><span className="loading-dot" />&nbsp; Loading open houses...</td></tr>
              )}
              {openHouses !== null && loadError && (
                <tr><td colSpan={5} style={{ color: 'var(--admin-red-600)', textAlign: 'center', padding: '32px' }}>Failed to load open houses. Is the server running?</td></tr>
              )}
              {openHouses !== null && !loadError && page.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      <p>{openHouses.length === 0 ? 'No open houses found in the database.' : 'No open houses match your filters.'}</p>
                    </div>
                  </td>
                </tr>
              )}
              {page.map((oh) => (
                <tr key={oh.id}>
                  <td>
                    <div className="oh-title-cell">
                      {oh.title}
                      {!oh.isActive && <span className="inactive-badge">Inactive</span>}
                    </div>
                    <div className="oh-school-name">{oh.school?.name || '—'}</div>
                  </td>
                  <td>
                    <div className="date-display">
                      <svg className="date-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      {new Date(oh.date).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </div>
                  </td>
                  <td>{oh.isOnline ? <span className="online-badge">Online</span> : (oh.location || '—')}</td>
                  <td><StatusBadge oh={oh} /></td>
                  <td>
                    <div className="table-actions">
                      <button type="button" className="action-btn action-btn-edit" onClick={() => openEditModal(oh)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        Edit
                      </button>
                      <button type="button" className="action-btn action-btn-delete" onClick={() => setDeleteTarget({ id: oh.id, name: oh.title })}>
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
              <h3 className="modal-title" id="delete-modal-title">Delete Open House</h3>
              <button type="button" className="modal-close" aria-label="Close modal" onClick={() => setDeleteTarget(null)}>✕</button>
            </div>
            <div className="modal-body">
              Are you sure you want to delete <strong>{deleteTarget.name}</strong>? Any student registrations and favorites tied to this event will be permanently removed along with it. This action cannot be undone.
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-cancel" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button type="button" className="btn-delete-confirm" disabled={deleting} onClick={confirmDelete}>
                {deleting ? 'Deleting...' : 'Delete Open House'}
              </button>
            </div>
          </div>
        </div>
      )}

      {formOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="form-modal-title" onClick={(e) => { if (e.target === e.currentTarget) closeFormModal() }}>
          <div className="modal modal-lg">
            <div className="modal-header">
              <h3 className="modal-title" id="form-modal-title">{editingId ? 'Edit Open House' : 'Add Open House'}</h3>
              <button type="button" className="modal-close" aria-label="Close modal" onClick={closeFormModal}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-section-title">Event Information</div>
              <div className="form-grid">
                <div className="form-group form-group-full">
                  <label className="form-label" htmlFor="field-title">Title <span className="required">*</span></label>
                  <input
                    className={`form-input${formErrors.title ? ' has-error' : ''}`}
                    id="field-title"
                    type="text"
                    placeholder="e.g. Open Day Faculty of Technology"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  />
                  <span className="form-error">{formErrors.title}</span>
                </div>
                <div className="form-group form-group-full">
                  <label className="form-label" htmlFor="field-school">School <span className="required">*</span></label>
                  <select
                    className={`form-input${formErrors.schoolId ? ' has-error' : ''}`}
                    id="field-school"
                    value={form.schoolId}
                    onChange={(e) => setForm((f) => ({ ...f, schoolId: e.target.value }))}
                  >
                    <option value="">Select school...</option>
                    {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <span className="form-error">{formErrors.schoolId}</span>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="field-date">Date &amp; Time <span className="required">*</span></label>
                  <input
                    className={`form-input${formErrors.date ? ' has-error' : ''}`}
                    id="field-date"
                    type="datetime-local"
                    value={form.date}
                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  />
                  <span className="form-error">{formErrors.date}</span>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="field-location">Location</label>
                  <input
                    className="form-input"
                    id="field-location"
                    type="text"
                    placeholder="e.g. Main Campus, Room 101"
                    value={form.location}
                    onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                  />
                </div>
                <div className="form-group form-group-full">
                  <label className="form-label" htmlFor="field-registration-url">Registration URL</label>
                  <input
                    className="form-input"
                    id="field-registration-url"
                    type="url"
                    placeholder="https://..."
                    value={form.registrationUrl}
                    onChange={(e) => setForm((f) => ({ ...f, registrationUrl: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label form-checkbox-label" htmlFor="field-online">
                    <input
                      type="checkbox"
                      id="field-online"
                      checked={form.isOnline}
                      onChange={(e) => setForm((f) => ({ ...f, isOnline: e.target.checked }))}
                    />
                    This is an online event
                  </label>
                </div>
                <div className="form-group">
                  <label className="form-label form-checkbox-label" htmlFor="field-active">
                    <input
                      type="checkbox"
                      id="field-active"
                      checked={form.isActive}
                      onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                    />
                    Active (visible to students)
                  </label>
                </div>
              </div>

              <div className="form-section-title" style={{ marginTop: 20 }}>Details</div>
              <div className="form-grid">
                <div className="form-group form-group-full">
                  <label className="form-label" htmlFor="field-description">Description (Dutch)</label>
                  <textarea
                    className="form-input"
                    id="field-description"
                    rows={4}
                    placeholder="Describe the open house event..."
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </div>
                <div className="form-group form-group-full">
                  <label className="form-label" htmlFor="field-description-en">Description (English)</label>
                  <textarea
                    className="form-input"
                    id="field-description-en"
                    rows={4}
                    placeholder="Describe the open house event in English..."
                    value={form.descriptionEn}
                    onChange={(e) => setForm((f) => ({ ...f, descriptionEn: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-cancel" onClick={closeFormModal}>Cancel</button>
              <button type="button" className="form-submit-btn" disabled={saving} onClick={submitForm}>
                {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Open House'}
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