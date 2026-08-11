import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import '@/styles/admin-quiz.css'

export const Route = createFileRoute('/admin/quiz')({
  component: RouteComponent,
})

const CLUSTER_OPTIONS = [
  { value: '', label: 'No cluster link' },
  { value: 'TECH', label: 'Technology' },
  { value: 'MED', label: 'Medical / Healthcare' },
  { value: 'BUS', label: 'Business & Economics' },
  { value: 'SOC', label: 'Social Sciences' },
  { value: 'EDU', label: 'Education' },
  { value: 'SCI', label: 'Science & Nature' },
  { value: 'LAW', label: 'Law & Governance' },
]

interface AnswerOption {
  id: string
  text: string
  textEn: string | null
  weights: Record<string, number>
  questionId: string
}

interface QuizQuestion {
  id: string
  text: string
  textEn: string | null
  type: string
  orderIndex: number
  isActive: boolean
  createdAt: string
  options: AnswerOption[]
}

type SortCol = 'orderIndex' | 'text' | 'type'
type SortDir = 'asc' | 'desc'

interface AnswerFormRow { text: string; cluster: string }

const EMPTY_ANSWER: AnswerFormRow = { text: '', cluster: '' }
const EMPTY_FORM = { text: '', type: '', answers: [{ ...EMPTY_ANSWER }, { ...EMPTY_ANSWER }] }

interface ToastItem { id: number; type: 'success' | 'error'; message: string }

function SortIcon() {
  return (
    <svg className="sort-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M7 15l5 5 5-5" /><path d="M7 9l5-5 5 5" />
    </svg>
  )
}

// Weights is a Json map like { TECH: 3 } — this UI only ever writes one
// nonzero key at a time, so pull the first key back out for the dropdown.
function clusterFromWeights(weights: Record<string, number>): string {
  const keys = Object.keys(weights || {}).filter((k) => weights[k] > 0)
  return keys[0] ?? ''
}

function RouteComponent() {
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null)
  const [loadError, setLoadError] = useState(false)

  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [sortCol, setSortCol] = useState<SortCol>('orderIndex')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const PAGE_SIZE = 10

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; text: string } | null>(null)
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

  async function loadQuestions() {
    try {
      const res = await fetch('/api/admin/quiz-questions')
      if (!res.ok) throw new Error('Failed to load')
      const data = await res.json()
      setQuestions(Array.isArray(data) ? data : [])
      setLoadError(false)
    } catch (err) {
      setLoadError(true)
      console.error('[admin/quiz] load error:', err)
    }
  }

  useEffect(() => {
    loadQuestions()
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const list = (questions ?? []).filter((question) => {
      const matchSearch = !q || question.text.toLowerCase().includes(q)
      const matchType = !filterType || question.type === filterType
      return matchSearch && matchType
    })

    list.sort((a, b) => {
      let va: string | number, vb: string | number
      if (sortCol === 'text') { va = a.text.toLowerCase(); vb = b.text.toLowerCase() }
      else if (sortCol === 'type') { va = a.type; vb = b.type }
      else { va = a.orderIndex; vb = b.orderIndex }
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })

    return list
  }, [questions, search, filterType, sortCol, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const page = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  function handleSort(col: SortCol) {
    if (sortCol === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortCol(col); setSortDir('asc') }
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

  function openEditModal(question: QuizQuestion) {
    setEditingId(question.id)
    setForm({
      text: question.text,
      type: question.type,
      answers: question.options.length
        ? question.options.map((o) => ({ text: o.text, cluster: clusterFromWeights(o.weights) }))
        : [{ ...EMPTY_ANSWER }, { ...EMPTY_ANSWER }],
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

  function addAnswerRow() {
    setForm((f) => ({ ...f, answers: [...f.answers, { ...EMPTY_ANSWER }] }))
  }

  function removeAnswerRow(index: number) {
    if (form.answers.length <= 2) {
      showToast('A question must have at least 2 answer options', 'error')
      return
    }
    setForm((f) => ({ ...f, answers: f.answers.filter((_, i) => i !== index) }))
  }

  function updateAnswerRow(index: number, patch: Partial<AnswerFormRow>) {
    setForm((f) => ({
      ...f,
      answers: f.answers.map((a, i) => (i === index ? { ...a, ...patch } : a)),
    }))
  }

  function validateForm() {
    const errors: Record<string, string> = {}
    if (form.text.trim().length < 5) errors.text = 'Question text must be at least 5 characters'
    if (!form.type) errors.type = 'Please select a question type'
    const filled = form.answers.filter((a) => a.text.trim()).length
    if (filled < 2) errors.answers = 'Please provide at least 2 filled answer options'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function submitForm() {
    if (!validateForm()) return
    setSaving(true)

    const body = {
      text: form.text.trim(),
      type: form.type,
      answers: form.answers
        .filter((a) => a.text.trim())
        .map((a) => ({ text: a.text.trim(), cluster: a.cluster || undefined })),
    }

    try {
      const res = await fetch(
        editingId ? `/api/admin/quiz-questions/${editingId}` : '/api/admin/quiz-questions',
        {
          method: editingId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        },
      )
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Save failed')

      if (editingId) {
        setQuestions((prev) => (prev ?? []).map((q) => (q.id === editingId ? data : q)))
        showToast('Question updated successfully', 'success')
      } else {
        setQuestions((prev) => [...(prev ?? []), data])
        showToast('Question added successfully', 'success')
      }
      closeFormModal()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save question', 'error')
      console.error('[admin/quiz] save error:', err)
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/quiz-questions/${deleteTarget.id}`, { method: 'DELETE' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Delete failed')
      setQuestions((prev) => (prev ?? []).filter((q) => q.id !== deleteTarget.id))
      showToast('Question deleted successfully', 'success')
      setDeleteTarget(null)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete question', 'error')
      console.error('[admin/quiz] delete error:', err)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h2 className="page-heading">Quiz Questions</h2>
          <p className="page-subheading">
            {questions === null ? 'Loading...' : `${questions.length} question${questions.length !== 1 ? 's' : ''} in the quiz`}
          </p>
        </div>
        <button type="button" className="btn-add" onClick={openAddModal}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Question
        </button>
      </div>

      <div className="search-filter-bar">
        <div className="search-field">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search question text..."
            autoComplete="off"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
          />
        </div>
        <select className="filter-select" value={filterType} onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1) }}>
          <option value="">All Types</option>
          <option value="single">Single Choice</option>
          <option value="multiple">Multiple Choice</option>
        </select>
      </div>

      <div className="table-card">
        <div className="table-responsive">
          <table className="data-table" aria-label="Quiz questions list">
            <thead>
              <tr>
                <th className={`sortable${sortCol === 'orderIndex' ? ` sort-${sortDir}` : ''}`} onClick={() => handleSort('orderIndex')}>Order<SortIcon /></th>
                <th className={`sortable${sortCol === 'text' ? ` sort-${sortDir}` : ''}`} onClick={() => handleSort('text')}>Question<SortIcon /></th>
                <th className={`sortable${sortCol === 'type' ? ` sort-${sortDir}` : ''}`} onClick={() => handleSort('type')}>Type<SortIcon /></th>
                <th>Answers</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions === null && (
                <tr className="table-loading"><td colSpan={5}><span className="loading-dot" />&nbsp; Loading questions...</td></tr>
              )}
              {questions !== null && loadError && (
                <tr><td colSpan={5} style={{ color: 'var(--admin-red-600)', textAlign: 'center', padding: '32px' }}>Failed to load questions. Is the server running?</td></tr>
              )}
              {questions !== null && !loadError && page.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                      <p>{questions.length === 0 ? 'No quiz questions yet.' : 'No questions match your filters.'}</p>
                    </div>
                  </td>
                </tr>
              )}
              {page.map((q) => (
                <tr key={q.id}>
                  <td>{q.orderIndex}</td>
                  <td>{q.text}</td>
                  <td>{q.type === 'multiple' ? 'Multiple Choice' : 'Single Choice'}</td>
                  <td>{q.options.length} answer{q.options.length !== 1 ? 's' : ''}</td>
                  <td>
                    <div className="table-actions">
                      <button type="button" className="action-btn action-btn-edit" onClick={() => openEditModal(q)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        Edit
                      </button>
                      <button type="button" className="action-btn action-btn-delete" onClick={() => setDeleteTarget({ id: q.id, text: q.text })}>
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
              <h3 className="modal-title" id="delete-modal-title">Delete Question</h3>
              <button type="button" className="modal-close" aria-label="Close modal" onClick={() => setDeleteTarget(null)}>✕</button>
            </div>
            <div className="modal-body">
              Are you sure you want to delete <strong>"{deleteTarget.text.length > 60 ? deleteTarget.text.slice(0, 60) + '…' : deleteTarget.text}"</strong>?
              There's no blocking check on this — the question and its answers are removed immediately and this cannot be undone.
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-cancel" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button type="button" className="btn-delete-confirm" disabled={deleting} onClick={confirmDelete}>
                {deleting ? 'Deleting...' : 'Delete Question'}
              </button>
            </div>
          </div>
        </div>
      )}

      {formOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="form-modal-title" onClick={(e) => { if (e.target === e.currentTarget) closeFormModal() }}>
          <div className="modal modal-lg">
            <div className="modal-header">
              <h3 className="modal-title" id="form-modal-title">{editingId ? 'Edit Question' : 'Add Question'}</h3>
              <button type="button" className="modal-close" aria-label="Close modal" onClick={closeFormModal}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group form-group-full">
                  <label className="form-label" htmlFor="field-text">Question Text <span className="required">*</span></label>
                  <textarea
                    className={`form-input${formErrors.text ? ' has-error' : ''}`}
                    id="field-text"
                    rows={3}
                    placeholder="Enter your question..."
                    value={form.text}
                    onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
                  />
                  <span className="form-error">{formErrors.text}</span>
                </div>

                <div className="form-group form-group-full">
                  <label className="form-label" htmlFor="field-type">Question Type <span className="required">*</span></label>
                  <select
                    className={`form-input${formErrors.type ? ' has-error' : ''}`}
                    id="field-type"
                    value={form.type}
                    onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                  >
                    <option value="">Select type...</option>
                    <option value="single">Single Choice</option>
                    <option value="multiple">Multiple Choice</option>
                  </select>
                  <span className="form-error">{formErrors.type}</span>
                </div>

                <div className="form-group form-group-full">
                  <label className="form-label">Answer Options <span className="required">*</span></label>
                  <div className="answer-editor-list">
                    {form.answers.map((answer, i) => (
                      <div className="answer-editor-row" key={i}>
                        <input
                          type="text"
                          className="form-input"
                          placeholder={`Answer option ${i + 1}`}
                          value={answer.text}
                          onChange={(e) => updateAnswerRow(i, { text: e.target.value })}
                        />
                        <select
                          className="form-input"
                          value={answer.cluster}
                          onChange={(e) => updateAnswerRow(i, { cluster: e.target.value })}
                        >
                          {CLUSTER_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                        <button type="button" className="answer-editor-remove" onClick={() => removeAnswerRow(i)}>
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                  <button type="button" className="btn-cancel answer-editor-add" onClick={addAnswerRow}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" aria-hidden="true">
                      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add Answer Option
                  </button>
                  <span className="form-error">{formErrors.answers}</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-cancel" onClick={closeFormModal}>Cancel</button>
              <button type="button" className="form-submit-btn" disabled={saving} onClick={submitForm}>
                {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Question'}
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