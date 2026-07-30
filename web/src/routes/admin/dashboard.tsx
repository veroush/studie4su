import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend, ResponsiveContainer,
} from 'recharts'

export const Route = createFileRoute('/admin/dashboard')({
  component: RouteComponent,
})

const CLUSTER_COLORS: Record<string, string> = {
  TECH: '#3b82f6', MED: '#ec4899', BUS: '#f59e0b',
  SOC: '#8b5cf6', EDU: '#22c55e', SCI: '#06b6d4', LAW: '#ef4444',
}

interface ClusterDatum {
  topCluster: string
  count: number
}

interface QuizResult {
  topCluster: string | null
  recommendedProgram?: { name?: string; school?: { name?: string } } | null
  createdAt: string
}

interface AdminUser {
  email: string | null
  createdAt: string
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function ClusterBadge({ cluster }: { cluster: string | null }) {
  const c = cluster || 'TECH'
  return <span className={`cluster-badge badge-${c}`}>{cluster || '?'}</span>
}

function RouteComponent() {
  const [schoolsCount, setSchoolsCount] = useState<number | null>(null)
  const [programsCount, setProgramsCount] = useState<number | null>(null)
  const [quizCount, setQuizCount] = useState<number | string | null>(null)
  const [usersCount, setUsersCount] = useState<number | string | null>(null)
  const [results, setResults] = useState<QuizResult[] | null>(null)
  const [clusters, setClusters] = useState<ClusterDatum[] | null>(null)
  const [users, setUsers] = useState<AdminUser[] | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  async function loadStats() {
    try {
      const [schoolsRes, programsRes, countRes] = await Promise.all([
        fetch('/api/admin/schools'),
        fetch('/api/admin/programs'),
        fetch('/api/admin/results/count'),
      ])
      const schools = await schoolsRes.json()
      const programs = await programsRes.json()
      const count = await countRes.json()
      setSchoolsCount(Array.isArray(schools) ? schools.length : 0)
      setProgramsCount(Array.isArray(programs) ? programs.length : 0)
      setQuizCount(count.totalStudents ?? 0)
    } catch {
      setQuizCount('N/A')
    }
  }

  async function loadResults() {
    try {
      const res = await fetch('/api/admin/results')
      const data = await res.json()
      setResults(Array.isArray(data) ? [...data].reverse().slice(0, 10) : [])
    } catch {
      setResults([])
    }
  }

  async function loadClusters() {
    try {
      const res = await fetch('/api/admin/results/by-cluster')
      const data = await res.json()
      setClusters(Array.isArray(data) ? data : [])
    } catch {
      setClusters([])
    }
  }

  async function loadUsers() {
    try {
      const res = await fetch('/api/admin/users')
      if (res.status === 404) {
        setUsers([])
        setUsersCount('—')
        return
      }
      const data = await res.json()
      setUsersCount(Array.isArray(data) ? data.length : 0)
      setUsers(Array.isArray(data) ? [...data].reverse().slice(0, 8) : [])
    } catch {
      setUsers([])
      setUsersCount('—')
    }
  }

  async function loadAll() {
    await Promise.all([loadStats(), loadResults(), loadClusters(), loadUsers()])
  }

  useEffect(() => {
    loadAll()
    const interval = setInterval(loadAll, 60_000)
    return () => clearInterval(interval)
  }, [])

  async function handleRefresh() {
    setRefreshing(true)
    await Promise.all([loadResults(), loadClusters()])
    setRefreshing(false)
  }

  const chartData = (clusters ?? []).map((c) => ({
    name: c.topCluster,
    value: Number(c.count),
    color: CLUSTER_COLORS[c.topCluster] || '#9ca3af',
  }))
  const maxCount = chartData.length ? Math.max(...chartData.map((c) => c.value)) : 0

  return (
    <>
      <section className="section" aria-label="Key statistics">
        <div className="stats-grid">
          <div className="stat-card" role="region" aria-label="Total schools">
            <div className="stat-card-top">
              <span className="stat-label">Total Schools</span>
              <div className="stat-icon green" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
              </div>
            </div>
            <div className="stat-value">{schoolsCount ?? '—'}</div>
            <div className="stat-sub">Registered in the system</div>
          </div>

          <div className="stat-card" role="region" aria-label="Total programs">
            <div className="stat-card-top">
              <span className="stat-label">Study Programs</span>
              <div className="stat-icon blue" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>
              </div>
            </div>
            <div className="stat-value">{programsCount ?? '—'}</div>
            <div className="stat-sub">Across all schools</div>
          </div>

          <div className="stat-card" role="region" aria-label="Total quiz results">
            <div className="stat-card-top">
              <span className="stat-label">Quiz Completions</span>
              <div className="stat-icon amber" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
              </div>
            </div>
            <div className="stat-value">{quizCount ?? '—'}</div>
            <div className="stat-sub">Students matched to programs</div>
          </div>

          <div className="stat-card" role="region" aria-label="Registered users">
            <div className="stat-card-top">
              <span className="stat-label">Registered Users</span>
              <div className="stat-icon purple" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
              </div>
            </div>
            <div className="stat-value">{usersCount ?? '—'}</div>
            <div className="stat-sub">Accounts created</div>
          </div>
        </div>
      </section>

      <section className="section" aria-label="Charts">
        <div className="charts-grid">
          <div className="chart-card">
            <div className="chart-header">
              <h2 className="chart-title">Quiz Results by Study Cluster</h2>
              <span className="chart-badge">Live data</span>
            </div>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v: number) => [`${v} result${v !== 1 ? 's' : ''}`, '']} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <h2 className="chart-title">Most Popular Clusters</h2>
              <span className="chart-badge">Live data</span>
            </div>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="80%" paddingAngle={2}>
                    {chartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Legend layout="vertical" align="right" verticalAlign="middle" iconSize={10} wrapperStyle={{ fontSize: 12, color: '#374151' }} />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      <section className="section" aria-label="Recent data">
        <div className="bottom-grid">
          <div className="activity-card">
            <div className="activity-header">
              <h2 className="activity-title">Recent Quiz Results</h2>
              <button
                type="button"
                className={`btn-refresh${refreshing ? ' spinning' : ''}`}
                aria-label="Refresh quiz results"
                onClick={handleRefresh}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
                Refresh
              </button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="results-table" aria-label="Recent quiz results">
                <thead>
                  <tr>
                    <th scope="col">Cluster</th>
                    <th scope="col">Recommended Program</th>
                    <th scope="col">School</th>
                    <th scope="col">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {results === null && (
                    <tr className="table-loading"><td colSpan={4}><span className="loading-dot" />&nbsp; Loading results...</td></tr>
                  )}
                  {results !== null && results.length === 0 && (
                    <tr><td colSpan={4} className="table-empty">No quiz results yet.</td></tr>
                  )}
                  {results?.map((r, i) => (
                    <tr key={i}>
                      <td><ClusterBadge cluster={r.topCluster} /></td>
                      <td>{r.recommendedProgram?.name ?? '—'}</td>
                      <td>{r.recommendedProgram?.school?.name ?? '—'}</td>
                      <td>{formatDate(r.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="cluster-card">
              <div className="activity-header"><h2 className="activity-title">Cluster Breakdown</h2></div>
              <div className="cluster-list">
                {clusters === null && (
                  <div style={{ color: 'var(--admin-gray-400)', fontSize: 'var(--admin-text-sm)' }}>
                    <span className="loading-dot" />&nbsp; Loading...
                  </div>
                )}
                {clusters !== null && clusters.length === 0 && (
                  <div style={{ color: 'var(--admin-gray-400)', fontSize: 'var(--admin-text-sm)' }}>No data yet.</div>
                )}
                {clusters?.map((c) => {
                  const pct = maxCount > 0 ? (Number(c.count) / maxCount) * 100 : 0
                  const color = CLUSTER_COLORS[c.topCluster] || '#9ca3af'
                  return (
                    <div className="cluster-row" key={c.topCluster}>
                      <span className="cluster-name">{c.topCluster}</span>
                      <div className="cluster-bar-wrap">
                        <div className="cluster-bar" style={{ width: `${pct}%`, background: color }} />
                      </div>
                      <span className="cluster-count">{c.count}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="users-card">
              <div className="activity-header"><h2 className="activity-title">Recent Users</h2></div>
              <div style={{ overflowX: 'auto' }}>
                <table className="results-table" aria-label="Recently registered users">
                  <thead><tr><th scope="col">Email</th><th scope="col">Joined</th></tr></thead>
                  <tbody>
                    {users === null && (
                      <tr className="table-loading"><td colSpan={2}><span className="loading-dot" />&nbsp; Loading users...</td></tr>
                    )}
                    {users !== null && users.length === 0 && (
                      <tr><td colSpan={2} className="table-empty">No users yet.</td></tr>
                    )}
                    {users?.map((u, i) => (
                      <tr key={i}>
                        <td>{u.email ?? '—'}</td>
                        <td>{formatDate(u.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}