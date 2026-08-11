import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import '@/styles/admin-statistics.css'

export const Route = createFileRoute('/admin/statistics')({
  component: RouteComponent,
})

interface QuizSubmissions {
  total: number
  thisMonth: number
  uniqueClusters: number
}

interface RankedItem {
  id: string
  name?: string
  title?: string
  count: number
}

interface ActivityPoint {
  date: string
  visits: number
  favorites: number
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}

function RankedList({ items, labelKey }: { items: RankedItem[] | null; labelKey: 'name' | 'title' }) {
  if (items === null) {
    return <div style={{ color: 'var(--admin-gray-400)', fontSize: 'var(--admin-text-sm)' }}>
      <span className="loading-dot" />&nbsp; Loading...
    </div>
  }
  if (items.length === 0) {
    return <div className="table-empty">No data yet.</div>
  }
  return (
    <div className="ranked-list">
      {items.map((item, i) => (
        <div className="ranked-item" key={item.id}>
          <div className="ranked-item-left">
            <div className="rank-badge">{i + 1}</div>
            <span className="ranked-item-name">{item[labelKey] ?? 'Unknown'}</span>
          </div>
          <span className="ranked-item-count">{item.count}</span>
        </div>
      ))}
    </div>
  )
}

function RouteComponent() {
  const [quizSubmissions, setQuizSubmissions] = useState<QuizSubmissions | null>(null)
  const [favoritedSchools, setFavoritedSchools] = useState<RankedItem[] | null>(null)
  const [favoritedPrograms, setFavoritedPrograms] = useState<RankedItem[] | null>(null)
  const [openHouseRegs, setOpenHouseRegs] = useState<RankedItem[] | null>(null)
  const [comparedPrograms, setComparedPrograms] = useState<RankedItem[] | null>(null)
  const [activity, setActivity] = useState<ActivityPoint[] | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  async function loadAll() {
    try {
      const [subRes, favSchoolsRes, favProgramsRes, ohRes, cmpRes, actRes] = await Promise.all([
        fetch('/api/admin/statistics/quiz-submissions'),
        fetch('/api/admin/statistics/favorited-schools'),
        fetch('/api/admin/statistics/favorited-programs'),
        fetch('/api/admin/statistics/openhouse-registrations'),
        fetch('/api/admin/statistics/compared-programs'),
        fetch('/api/admin/statistics/activity'),
      ])
      setQuizSubmissions(subRes.ok ? await subRes.json() : { total: 0, thisMonth: 0, uniqueClusters: 0 })
      setFavoritedSchools(favSchoolsRes.ok ? await favSchoolsRes.json() : [])
      setFavoritedPrograms(favProgramsRes.ok ? await favProgramsRes.json() : [])
      setOpenHouseRegs(ohRes.ok ? await ohRes.json() : [])
      setComparedPrograms(cmpRes.ok ? await cmpRes.json() : [])
      setActivity(actRes.ok ? await actRes.json() : [])
    } catch (err) {
      console.error('Statistics load error:', err)
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  async function handleRefresh() {
    setRefreshing(true)
    await loadAll()
    setRefreshing(false)
  }

  return (
    <>
      <section className="section" aria-label="Quiz submission metrics">
        <div className="stats-grid stats-grid-3">
          <div className="stat-card">
            <div className="stat-card-top">
              <span className="stat-label">Total Submissions</span>
            </div>
            <div className="stat-value">{quizSubmissions?.total ?? '—'}</div>
            <div className="stat-sub">All-time quiz completions</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-top">
              <span className="stat-label">This Month</span>
            </div>
            <div className="stat-value">{quizSubmissions?.thisMonth ?? '—'}</div>
            <div className="stat-sub">Submitted this calendar month</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-top">
              <span className="stat-label">Unique Clusters Reached</span>
            </div>
            <div className="stat-value">{quizSubmissions?.uniqueClusters ?? '—'}</div>
            <div className="stat-sub">Distinct top clusters recommended</div>
          </div>
        </div>
      </section>

      <section className="section" aria-label="Favorites rankings">
        <div className="charts-grid">
          <div className="chart-card">
            <div className="chart-header">
              <h2 className="chart-title">Most Favorited Schools</h2>
              <span className="chart-badge">Live data</span>
            </div>
            <RankedList items={favoritedSchools} labelKey="name" />
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <h2 className="chart-title">Most Favorited Programs</h2>
              <span className="chart-badge">Live data</span>
            </div>
            <RankedList items={favoritedPrograms} labelKey="name" />
          </div>
        </div>
      </section>

      <section className="section" aria-label="Open houses and comparisons">
        <div className="charts-grid">
          <div className="chart-card">
            <div className="chart-header">
              <h2 className="chart-title">Open House Registrations</h2>
              <span className="chart-badge">Live data</span>
            </div>
            <RankedList items={openHouseRegs} labelKey="title" />
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <h2 className="chart-title">Most Compared Programs</h2>
              <span className="chart-badge">Live data</span>
            </div>
            <RankedList items={comparedPrograms} labelKey="name" />
          </div>
        </div>
      </section>

      <section className="section" aria-label="Platform activity over time">
        <div className="chart-card">
          <div className="activity-header">
            <h2 className="activity-title">Platform Activity Over Time</h2>
            <button
              type="button"
              className={`btn-refresh${refreshing ? ' spinning' : ''}`}
              aria-label="Refresh statistics"
              onClick={handleRefresh}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              Refresh
            </button>
          </div>
          <div className="chart-wrap chart-wrap-lg">
            {activity === null ? (
              <div style={{ color: 'var(--admin-gray-400)', fontSize: 'var(--admin-text-sm)' }}>
                <span className="loading-dot" />&nbsp; Loading...
              </div>
            ) : activity.length === 0 ? (
              <div className="table-empty">No activity data yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={activity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <Tooltip labelFormatter={(label) => formatDate(String(label))} />
                  <Legend />
                  <Line type="monotone" dataKey="visits" name="Visits" stroke="#16a34a" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="favorites" name="Favorites" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </section>
    </>
  )
}