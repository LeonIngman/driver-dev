import Link from 'next/link'
import { cookies } from 'next/headers'

const API = process.env.API_URL ?? 'http://localhost:3001'

type Issue = {
  id: string; title: string; repo: string
  status: 'open' | 'claimed' | 'in_review' | 'completed'
  labels: string[]; salary: number
  devs: number; devInitials: string[]; devColors: string[]
  comments: number; updated: string
}

type Stats = { openCount: number; claimedCount: number; totalValue: number; earnedTotal: number }
type Profile = { username: string; initials: string; githubConnected: boolean; model: string }

const statusConfig = {
  open:      { label: 'Open',      cls: 'badge-blue'   },
  claimed:   { label: 'Claimed',   cls: 'badge-yellow'  },
  in_review: { label: 'In Review', cls: 'badge-orange'  },
  completed: { label: 'Done',      cls: 'badge-green'   },
}

const labelConfig: Record<string, string> = {
  bug: 'badge-red', enhancement: 'badge-blue', feature: 'badge-blue',
  performance: 'badge-orange', types: 'badge-muted', docs: 'badge-muted',
  P1: 'badge-red', P2: 'badge-yellow',
}

function getAuthHeader(cookieStore: Awaited<ReturnType<typeof cookies>>): Record<string, string> {
  const token = cookieStore.get('token')?.value
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function fetchIssues(authHeader: Record<string, string>): Promise<{ issues: Issue[]; total: number }> {
  try {
    const res = await fetch(`${API}/api/developer/issues`, { cache: 'no-store', headers: authHeader })
    if (!res.ok) return { issues: [], total: 0 }
    return await res.json()
  } catch { return { issues: [], total: 0 } }
}

async function fetchStats(authHeader: Record<string, string>): Promise<Stats> {
  try {
    const res = await fetch(`${API}/api/developer/issues/stats`, { cache: 'no-store', headers: authHeader })
    if (!res.ok) return { openCount: 0, claimedCount: 0, totalValue: 0, earnedTotal: 0 }
    return await res.json()
  } catch { return { openCount: 0, claimedCount: 0, totalValue: 0, earnedTotal: 0 } }
}

async function fetchProfile(authHeader: Record<string, string>): Promise<Profile> {
  try {
    const res = await fetch(`${API}/api/developer/profile`, { cache: 'no-store', headers: authHeader })
    if (!res.ok) return { username: '—', initials: '?', githubConnected: false, model: '—' }
    return await res.json()
  } catch { return { username: '—', initials: '?', githubConnected: false, model: '—' } }
}

export default async function DeveloperIssues() {
  const cookieStore = await cookies()
  const authHeader = getAuthHeader(cookieStore)
  const [{ issues, total }, stats, profile] = await Promise.all([
    fetchIssues(authHeader),
    fetchStats(authHeader),
    fetchProfile(authHeader),
  ])

  return (
    <div className="main-content">

      {/* Topbar */}
      <div className="topbar">
        <div style={{ flex: 1 }}>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.78rem', color: 'var(--text-3)' }}>
            <span>Developer</span>
            <span>/</span>
            <span style={{ color: 'var(--text-1)' }}>My Issues</span>
          </nav>
        </div>

        <div style={{ position: 'relative' }}>
          <svg style={{ position: 'absolute', left: '0.625rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} width="13" height="13" viewBox="0 0 13 13" fill="none">
            <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M8.5 8.5L11 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          <input className="input" type="text" placeholder="Search issues…" style={{ width: 220, paddingLeft: '2rem', padding: '0.4rem 0.75rem 0.4rem 2rem', fontSize: '0.8rem' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '0.5rem' }}>
          <Link href="/developer/profile" style={{ textDecoration: 'none' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, var(--blue), var(--blue-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#fff' }}>{profile.initials}</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '1.75rem 2rem', flex: 1 }}>

        {/* Page header */}
        <div className="anim-fade-up" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: 'var(--text-1)', marginBottom: '0.25rem' }}>
              My Issues
            </h1>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-2)' }}>Track your claimed issues and fix progress across all repos.</p>
          </div>
          <Link href="/developer/repos" className="btn btn-blue" style={{ textDecoration: 'none' }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M6.5 1.5v10M1.5 6.5h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Browse issues
          </Link>
        </div>

        {/* Stats */}
        <div className="anim-fade-up d2" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.875rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Open',        value: stats.openCount,                         sub: 'Available to claim',    accent: 'var(--blue)'   },
            { label: 'Claimed',     value: stats.claimedCount,                      sub: 'You are working on',    accent: 'var(--orange)' },
            { label: 'Total Value', value: `$${stats.totalValue.toLocaleString()}`,  sub: 'In your active issues', accent: 'var(--green)'  },
            { label: 'Earned',      value: `$${stats.earnedTotal.toLocaleString()}`, sub: 'All time',              accent: 'var(--text-1)' },
          ].map(s => (
            <div key={s.label} className="stat-box">
              <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{s.label}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.625rem', color: s.accent, marginBottom: '0.2rem' }}>{s.value}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="anim-fade-up d3" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', alignItems: 'center' }}>
          {['All', 'Open', 'Claimed', 'In Review', 'Completed'].map((f, i) => (
            <button key={f} className="btn" style={{ padding: '0.3rem 0.7rem', fontSize: '0.78rem', background: i === 0 ? 'var(--blue-bg)' : 'var(--bg-3)', color: i === 0 ? 'var(--blue)' : 'var(--text-3)', border: `1px solid ${i === 0 ? 'var(--blue-border)' : 'var(--border)'}`, borderRadius: 5 }}>
              {f}
            </button>
          ))}
          <div style={{ marginLeft: 'auto', fontSize: '0.78rem', color: 'var(--text-3)' }}>
            {total} issues
          </div>
        </div>

        {/* Table */}
        <div className="anim-fade-up d4 card" style={{ overflow: 'hidden' }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Issue</th>
                  <th>Repository</th>
                  <th>Status</th>
                  <th>Salary</th>
                  <th>Working on it</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {issues.map(issue => (
                  <tr key={issue.id} style={{ opacity: issue.status === 'completed' ? 0.55 : 1 }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-3)', flexShrink: 0 }}>#{issue.id}</span>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: '0.85rem', color: 'var(--text-1)', lineHeight: 1.3 }}>{issue.title}</div>
                          <div style={{ marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                            {issue.labels.map(l => (
                              <span key={l} className={`badge ${labelConfig[l] ?? 'badge-muted'}`} style={{ fontSize: '0.58rem' }}>{l}</span>
                            ))}
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>
                              {issue.comments > 0 && `${issue.comments} comments · `}{issue.updated}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-2)', fontFamily: 'var(--font-mono)' }}>{issue.repo}</span>
                    </td>
                    <td>
                      <span className={`badge ${statusConfig[issue.status].cls}`}>{statusConfig[issue.status].label}</span>
                    </td>
                    <td>
                      <span className="font-mono" style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--green)' }}>
                        ${issue.salary}
                      </span>
                    </td>
                    <td>
                      {issue.devs > 0 ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                          <div className="avatar-stack">
                            {issue.devInitials.slice(0, 3).map((init, idx) => (
                              <div key={init} className="av" style={{ background: issue.devColors[idx] + '22' }}>
                                <span style={{ color: issue.devColors[idx], fontFamily: 'var(--font-display)', fontWeight: 700 }}>{init[0]}</span>
                              </div>
                            ))}
                            {issue.devs > 3 && (
                              <div className="av" style={{ background: 'var(--bg-4)' }}>
                                <span style={{ color: 'var(--text-3)', fontSize: '0.55rem' }}>+{issue.devs - 3}</span>
                              </div>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <span className="live-dot" style={{ width: 5, height: 5 }} />
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>{issue.devs} working</span>
                          </div>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>No one yet</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {issue.status !== 'completed' ? (
                        <Link
                          href="/editor"
                          className="btn btn-blue"
                          style={{ padding: '0.35rem 0.875rem', fontSize: '0.78rem', textDecoration: 'none' }}
                        >
                          {issue.status === 'open' ? 'Claim & Fix' : 'Open Fix'}
                        </Link>
                      ) : (
                        <span className="badge badge-green" style={{ fontSize: '0.62rem' }}>Merged</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>Showing {issues.length} of {total} issues</span>
            <div style={{ display: 'flex', gap: '0.375rem' }}>
              {['←', '1', '2', '3', '→'].map((p, i) => (
                <button key={p} className="btn" style={{ padding: '0.25rem 0.5rem', fontSize: '0.78rem', background: i === 1 ? 'var(--blue-bg)' : 'var(--bg-3)', color: i === 1 ? 'var(--blue)' : 'var(--text-2)', border: `1px solid ${i === 1 ? 'var(--blue-border)' : 'var(--border)'}`, borderRadius: 4, minWidth: 32 }}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
