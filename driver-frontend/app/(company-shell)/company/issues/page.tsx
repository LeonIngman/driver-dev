import Link from 'next/link'
import { cookies } from 'next/headers'

const API = process.env.API_URL ?? 'http://localhost:3001'

type Issue = {
  id: string; title: string; repo: string; status: 'open' | 'claimed' | 'in_review' | 'completed'
  label: string; salary: string; devs: number; devInitials: string[]; devColors: string[]; updated: string
}

type Stats = { openCount: number; inProgressCount: number; activeDevs: number; totalValue: number; total: number }
type Repo  = { name: string; full: string }
type Profile = { name: string; initials: string; plan: string; slug: string }

const statuses = ['All statuses', 'Open', 'Claimed', 'In Review', 'Completed']

const statusConfig = {
  open:      { label: 'Open',      cls: 'badge-blue'   },
  claimed:   { label: 'Claimed',   cls: 'badge-yellow'  },
  in_review: { label: 'In Review', cls: 'badge-orange'  },
  completed: { label: 'Completed', cls: 'badge-green'   },
}

const labelConfig: Record<string, string> = {
  bug: 'badge-red', enhancement: 'badge-blue', feature: 'badge-blue',
  security: 'badge-orange', a11y: 'badge-muted',
}

async function fetchIssues(auth: Record<string, string>): Promise<{ issues: Issue[]; total: number }> {
  try {
    const res = await fetch(`${API}/api/company/issues`, { cache: 'no-store', headers: auth })
    if (!res.ok) return { issues: [], total: 0 }
    return await res.json()
  } catch { return { issues: [], total: 0 } }
}

async function fetchStats(auth: Record<string, string>): Promise<Stats> {
  try {
    const res = await fetch(`${API}/api/company/issues/stats`, { cache: 'no-store', headers: auth })
    if (!res.ok) return { openCount: 0, inProgressCount: 0, activeDevs: 0, totalValue: 0, total: 0 }
    return await res.json()
  } catch { return { openCount: 0, inProgressCount: 0, activeDevs: 0, totalValue: 0, total: 0 } }
}

async function fetchRepos(auth: Record<string, string>): Promise<Repo[]> {
  try {
    const res = await fetch(`${API}/api/company/repos`, { cache: 'no-store', headers: auth })
    if (!res.ok) return []
    return await res.json()
  } catch { return [] }
}

async function fetchProfile(auth: Record<string, string>): Promise<Profile> {
  try {
    const res = await fetch(`${API}/api/company/profile`, { cache: 'no-store', headers: auth })
    if (!res.ok) return { name: '—', initials: '?', plan: '—', slug: '' }
    return await res.json()
  } catch { return { name: '—', initials: '?', plan: '—', slug: '' } }
}

export default async function CompanyIssues() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  const auth: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {}
  const [{ issues, total }, stats, repos, profile] = await Promise.all([
    fetchIssues(auth),
    fetchStats(auth),
    fetchRepos(auth),
    fetchProfile(auth),
  ])

  const repoFilterOptions = ['All repositories', ...repos.map(r => r.full)]

  return (
    <div className="main-content">

      {/* Topbar */}
      <div className="topbar">
        <div style={{ flex: 1 }}>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.78rem', color: 'var(--text-3)' }}>
            <span>Dashboard</span>
            <span>/</span>
            <span style={{ color: 'var(--text-1)' }}>Issues</span>
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
          <Link href={profile.slug ? `/company/profile/${profile.slug}` : '#'} style={{ textDecoration: 'none' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--orange-bg)', border: '1px solid var(--orange-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--orange)' }}>{profile.initials}</span>
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
              Issue Management
            </h1>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-2)' }}>Set developer salaries and track fix progress across all connected repos.</p>
          </div>
          <button className="btn btn-blue">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M6.5 1.5v10M1.5 6.5h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Add issue
          </button>
        </div>

        {/* Stats */}
        <div className="anim-fade-up d2" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.875rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Open Issues', value: stats.openCount,       sub: 'Awaiting a fix',   accent: 'var(--blue)'   },
            { label: 'In Progress', value: stats.inProgressCount, sub: 'Being worked on',  accent: 'var(--orange)' },
            { label: 'Active Devs', value: stats.activeDevs,      sub: 'Across all repos', accent: 'var(--green)'  },
            { label: 'Total Value', value: `$${stats.totalValue.toLocaleString()}`, sub: 'In open salaries', accent: 'var(--text-1)' },
          ].map(s => (
            <div key={s.label} className="stat-box">
              <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{s.label}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.625rem', color: s.accent, marginBottom: '0.2rem' }}>{s.value}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="anim-fade-up d3" style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', alignItems: 'center' }}>
          <select className="input" style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}>
            {repoFilterOptions.map(r => <option key={r}>{r}</option>)}
          </select>
          <select className="input" style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}>
            {statuses.map(s => <option key={s}>{s}</option>)}
          </select>
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
                  <th style={{ width: 40, paddingLeft: '1.25rem' }}>
                    <input type="checkbox" style={{ accentColor: 'var(--blue)', cursor: 'pointer' }} />
                  </th>
                  <th>Issue</th>
                  <th>Repository</th>
                  <th>Status</th>
                  <th>Developers</th>
                  <th>Salary</th>
                  <th style={{ width: 50 }}></th>
                </tr>
              </thead>
              <tbody>
                {issues.map(issue => (
                  <tr key={issue.id} style={{ opacity: issue.status === 'completed' ? 0.6 : 1 }}>
                    <td style={{ paddingLeft: '1.25rem' }}>
                      <input type="checkbox" style={{ accentColor: 'var(--blue)', cursor: 'pointer' }} />
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-3)', flexShrink: 0 }}>{issue.id}</span>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: '0.85rem', color: 'var(--text-1)', lineHeight: 1.3 }}>{issue.title}</div>
                          <div style={{ marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                            <span className={`badge ${labelConfig[issue.label] ?? 'badge-muted'}`} style={{ fontSize: '0.6rem' }}>{issue.label}</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>{issue.updated}</span>
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
                      {issue.devs > 0 ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div className="avatar-stack">
                            {issue.devInitials.map((init, idx) => (
                              <div key={init} className="av" style={{ background: issue.devColors[idx] + '22', borderColor: 'var(--bg-2)' }}>
                                <span style={{ color: issue.devColors[idx], fontFamily: 'var(--font-display)', fontWeight: 700 }}>{init[0]}</span>
                              </div>
                            ))}
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{issue.devs}</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>—</span>
                      )}
                    </td>
                    <td>
                      <div className="salary-wrap">
                        <input
                          className="salary-input"
                          type="text"
                          defaultValue={issue.salary}
                          readOnly={issue.status === 'completed'}
                        />
                      </div>
                    </td>
                    <td>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: '0.25rem', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <circle cx="3" cy="7" r="1.2" fill="currentColor"/>
                          <circle cx="7" cy="7" r="1.2" fill="currentColor"/>
                          <circle cx="11" cy="7" r="1.2" fill="currentColor"/>
                        </svg>
                      </button>
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
