import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import '@/styles/admin-programs.css'

export const Route = createFileRoute('/admin/programs')({
  component: RouteComponent,
})

interface School {
  id: string
  name: string
}

interface Program {
  id: string
  name: string
  description: string | null
  cluster: string
  duration: string | null
  levelRequired: string | null
  tuitionCost: string | null
  careers: string | null
  schoolId: string
  school?: { id: string; name: string } | null
}

type SortCol = 'name' | 'school' | 'cluster' | 'levelRequired'
type SortDir = 'asc' | 'desc'

const PAGE_SIZE = 10
const LEVELS = ['MAVO', 'HAVO', 'VWO', 'MBO', 'HBO']

const EMPTY_FORM = {
  name: '',
  schoolId: '',
  cluster: '',
  levelRequired: '',
  duration: '',
  tuitionCost: '',
  description: '',
  careers: '',
}

interface ToastItem { id: number; type: 'success' | 'error'; message: string }

function SortIcon() {
  return (
    <svg className="sort-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M7 15l5 5 5-5" /><path d="M7 9l5-5 5 5" />
    </svg>
  )
}

function RouteComponent() {
  const [programs, setPrograms] = useState<Program[] | null>(null)
  const [schools, setSchools] = useState<School[]>([])
  const [loadError, setLoadError] = useState(false)

  const [search, setSearch] = useState('')
  const [filterSchool, setFilterSchool] = useState('')
  const [filterLevel, setFilterLevel] = useState('')
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

  async function loadPrograms() {
    try {
      const res = await fetch('/api/admin/programs')
      if (!res.ok) throw new Error('Failed to load')
      const data = await res.json()
      setPrograms(Array.isArray(data) ? data : [])
      setLoadError(false)
    } catch (err) {
      setLoadError(true)
      console.error('[admin/programs] load error:', err)
    }
  }

  async function loadSchools() {
    try {
      const res = await fetch('/api/admin/schools')
      if (!res.ok) throw new Error('Failed to load schools')
      const data = await res.json()
      setSchools(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('[admin/programs] schools load error:', err)
    }
  }

  useEffect(() => {
    loadPrograms()
    loadSchools()
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const list = (programs ?? []).filter((p) => {
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.cluster && p.cluster.toLowerCase().includes(q)) ||
        (p.school?.name && p.school.name.toLowerCase().includes(q))
      const matchSchool = !filterSchool || p.schoolId === filterSchool
      const matchLevel = !filterLevel || p.levelRequired === filterLevel
      return matchSearch && matchSchool && matchLevel
    })

    list.sort((a, b) => {
      let va: string, vb: string
      if (sortCol === 'name') { va = a.name.toLowerCase(); vb = b.name.toLowerCase() }
      else if (sortCol === 'school') { va = (a.school?.name || '').toLowerCase(); vb = (b.school?.name || '').toLowerCase() }
      else if (sortCol === 'cluster') { va = (a.cluster || '').toLowerCase(); vb = (b.cluster || '').toLowerCase() }
      else { va = (a.levelRequired || '').toLowerCase(); vb = (b.levelRequired || '').toLowerCase() }
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })

    return list
  }, [programs, search, filterSchool, filterLevel, sortCol, sortDir])

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
    setFilterLevel('')
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

  function openEditModal(p: Program) {
    setEditingId(p.id)
    setForm({
      name: p.name,
      schoolId: p.schoolId,
      cluster: p.cluster ?? '',
      levelRequired: p.levelRequired ?? '',
      duration: p.duration ?? '',
      tuitionCost: p.tuitionCost ?? '',
      description: p.description ?? '',
      careers: p.careers ?? '',
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
    if (!form.schoolId) errors.schoolId = 'School is required'
    if (!form.cluster.trim()) errors.cluster = 'Cluster is required'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function submitForm() {
    if (!validateForm()) return
    setSaving(true)

    const body = {
      name: form.name.trim(),
      schoolId: form.schoolId,
      cluster: form.cluster.trim(),
      levelRequired: form.levelRequired || null,
      duration: form.duration.trim() || null,
      tuitionCost: form.tuitionCost.trim() || null,
      description: form.description.trim() || null,
      careers: form.careers.trim() || null,
    }

    try {
      const res = await fetch(editingId ? `/api/admin/programs/${editingId}` : '/api/admin/programs', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Save failed')

      if (editingId) {
        setPrograms((prev) => (prev ?? []).map((p) => (p.id === editingId ? { ...p, ...data } : p)))
        showToast('Program updated successfully', 'success')
      } else {
        setPrograms((prev) => [data, ...(prev ?? [])])
        showToast('Program added successfully', 'success')
      }
      closeFormModal()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save program', 'error')
      console.error('[admin/programs] save error:', err)
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/programs/${deleteTarget.id}`, { method: 'DELETE' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Delete failed')
      setPrograms((prev) => (prev ?? []).filter((p) => p.id !== deleteTarget.id))
      showToast('Program deleted successfully', 'success')
      setDeleteTarget(null)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete program', 'error')
      console.error('[admin/programs] delete error:', err)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h2 className="page-heading">All Programs</h2>
          <p className="page-subheading">
            {programs === null ? 'Loading...' : `${programs.length} program${programs.length !== 1 ? 's' : ''} in the system`}
          </p>
        </div>
        <button type="button" className="btn-add" onClick={openAddModal}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add New Program
        </button>
      </div>

      <div className="search-filter-bar">
        <div className="search-field">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search programs..."
            autoComplete="off"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
          />
        </div>
        <select className="filter-select" value={filterSchool} onChange={(e) => { setFilterSchool(e.target.value); setCurrentPage(1) }}>
          <option value="">All Schools</option>
          {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select className="filter-select" value={filterLevel} onChange={(e) => { setFilterLevel(e.target.value); setCurrentPage(1) }}>
          <option value="">All Levels</option>
          {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        <button type="button" className="btn-clear" onClick={clearFilters}>Clear Filters</button>
      </div>

      <div className="table-card">
        <div className="table-responsive">
          <table className="data-table" aria-label="Programs list">
            <thead>
              <tr>
                <th className={`sortable${sortCol === 'name' ? ` sort-${sortDir}` : ''}`} onClick={() => handleSort('name')}>Program Name<SortIcon /></th>
                <th className={`sortable${sortCol === 'school' ? ` sort-${sortDir}` : ''}`} onClick={() => handleSort('school')}>School<SortIcon /></th>
                <th className={`sortable${sortCol === 'cluster' ? ` sort-${sortDir}` : ''}`} onClick={() => handleSort('cluster')}>Cluster<SortIcon /></th>
                <th className={`sortable${sortCol === 'levelRequired' ? ` sort-${sortDir}` : ''}`} onClick={() => handleSort('levelRequired')}>Level<SortIcon /></th>
                <th>Duration</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {programs === null && (
                <tr className="table-loading"><td colSpan={6}><span className="loading-dot" />&nbsp; Loading programs...</td></tr>
              )}
              {programs !== null && loadError && (
                <tr><td colSpan={6} style={{ color: 'var(--admin-red-600)', textAlign: 'center', padding: '32px' }}>Failed to load programs. Is the server running?</td></tr>
              )}
              {programs !== null && !loadError && page.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
                      </svg>
                      <p>{programs.length === 0 ? 'No programs found in the database.' : 'No programs match your filters.'}</p>
                    </div>
                  </td>
                </tr>
              )}
              {page.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="program-name-cell">{p.name}</div>
                    <div className="program-id">{p.id}</div>
                  </td>
                  <td>{p.school?.name || '—'}</td>
                  <td>{p.cluster || '—'}</td>
                  <td>
                    {p.levelRequired
                      ? <span className={`level-badge level-${p.levelRequired}`}>{p.levelRequired}</span>
                      : '—'}
                  </td>
                  <td>{p.duration || '—'}</td>
                  <td>
                    <div className="table-actions">
                      <button type="button" className="action-btn action-btn-edit" onClick={() => openEditModal(p)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        Edit
                      </button>
                      <button type="button" className="action-btn action-btn-delete" onClick={() => setDeleteTarget({ id: p.id, name: p.name })}>
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
              <h3 className="modal-title" id="delete-modal-title">Delete Program</h3>
              <button type="button" className="modal-close" aria-label="Close modal" onClick={() => setDeleteTarget(null)}>✕</button>
            </div>
            <div className="modal-body">
              Are you sure you want to delete <strong>{deleteTarget.name}</strong>? This action cannot be undone.
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-cancel" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button type="button" className="btn-delete-confirm" disabled={deleting} onClick={confirmDelete}>
                {deleting ? 'Deleting...' : 'Delete Program'}
              </button>
            </div>
          </div>
        </div>
      )}

      {formOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="form-modal-title" onClick={(e) => { if (e.target === e.currentTarget) closeFormModal() }}>
          <div className="modal modal-lg">
            <div className="modal-header">
              <h3 className="modal-title" id="form-modal-title">{editingId ? 'Edit Program' : 'Add New Program'}</h3>
              <button type="button" className="modal-close" aria-label="Close modal" onClick={closeFormModal}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="field-name">Program Name <span className="required">*</span></label>
                  <input
                    className={`form-input${formErrors.name ? ' has-error' : ''}`}
                    id="field-name"
                    type="text"
                    placeholder="e.g. Bachelor Informatica"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  />
                  <span className="form-error">{formErrors.name}</span>
                </div>
                <div className="form-group">
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
                  <label className="form-label" htmlFor="field-cluster">Cluster <span className="required">*</span></label>
                  <input
                    className={`form-input${formErrors.cluster ? ' has-error' : ''}`}
                    id="field-cluster"
                    type="text"
                    placeholder="e.g. Technologie, Gezondheid"
                    value={form.cluster}
                    onChange={(e) => setForm((f) => ({ ...f, cluster: e.target.value }))}
                  />
                  <span className="form-error">{formErrors.cluster}</span>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="field-level">Level Required</label>
                  <select
                    className="form-input"
                    id="field-level"
                    value={form.levelRequired}
                    onChange={(e) => setForm((f) => ({ ...f, levelRequired: e.target.value }))}
                  >
                    <option value="">Not specified</option>
                    {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="field-duration">Duration</label>
                  <input
                    className="form-input"
                    id="field-duration"
                    type="text"
                    placeholder="e.g. 4 years"
                    value={form.duration}
                    onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="field-tuition">Tuition Cost</label>
                  <input
                    className="form-input"
                    id="field-tuition"
                    type="text"
                    placeholder="e.g. SRD 2.500 per year"
                    value={form.tuitionCost}
                    onChange={(e) => setForm((f) => ({ ...f, tuitionCost: e.target.value }))}
                  />
                </div>
                <div className="form-group form-group-full">
                  <label className="form-label" htmlFor="field-description">Description</label>
                  <textarea
                    className="form-input"
                    id="field-description"
                    rows={3}
                    placeholder="Describe the program..."
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </div>
                <div className="form-group form-group-full">
                  <label className="form-label" htmlFor="field-careers">Career Opportunities</label>
                  <textarea
                    className="form-input"
                    id="field-careers"
                    rows={2}
                    placeholder="e.g. Software Engineer, Data Analyst..."
                    value={form.careers}
                    onChange={(e) => setForm((f) => ({ ...f, careers: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-cancel" onClick={closeFormModal}>Cancel</button>
              <button type="button" className="form-submit-btn" disabled={saving} onClick={submitForm}>
                {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Program'}
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