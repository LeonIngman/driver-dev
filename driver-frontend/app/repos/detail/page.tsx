import Link from 'next/link'

const API = process.env.API_URL ?? 'http://localhost:3001'

const Logo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <div style={{ width: 26, height: 26, background: 'var(--blue)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: '#fff', fontWeight: 800, fontSize: 13, fontFamily: 'var(--font-display)' }}>D</span>
    </div>
    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--text-1)' }}>Driver</span>
  </div>
)

const navItems = [
  { label: 'Browse', icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" strokeWidth="1.3"/><circle cx="7.5" cy="7.5" r="2" stroke="currentColor" strokeWidth="1.3"/></svg>, active: true },
  { label: 'My Claims', badge: 3, icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="2" y="2" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M5 7.5h5M7.5 5v5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> },
  { label: 'Earnings', icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1.5" y="4" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M5 4V3a1 1 0 011-1h3a1 1 0 011 1v1M5.5 8.5h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> },
  { label: 'Settings', icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="2" stroke="currentColor" strokeWidth="1.3"/><path d="M7.5 1.5v1M7.5 12.5v1M1.5 7.5h1M12.5 7.5h1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> },
]

type RepoDetail = {
  org: string; orgInitial: string; orgColor: string
  name: string; fullName: string; description: string
  lang: string; langDot: string
  stars: number; tags: string[]
}

type Issue = {
  id: string; title: string
  status: 'open' | 'claimed' | 'in_review' | 'completed'
  labels: string[]; salary: number
  devs: number; devInitials: string[]; devColors: string[]
  comments: number; updated: string
}

async function fetchRepo(org: string, repo: string): Promise<RepoDetail | null> {
  try {
    const res = await fetch(`${API}/api/repos/${org}/${repo}`, { cache: 'no-store' })
    if (!res.ok) return null
    return await res.json()
  } catch { return null }
}

async function fetchIssues(org: string, repo: string): Promise<Issue[]> {
  try {
    const res = await fetch(`${API}/api/repos/${org}/${repo}/issues`, { cache: 'no-store' })
    if (!res.ok) return []
    return await res.json()
  } catch { return [] }
}

const statusCfg = {
  open:      { label: 'Open',      cls: 'badge-blue' },
  claimed:   { label: 'Claimed',   cls: 'badge-yellow' },
  in_review: { label: 'Review',    cls: 'badge-orange' },
  completed: { label: 'Done',      cls: 'badge-green' },
}

const labelCfg: Record<string, string> = {
  bug: 'badge-red', enhancement: 'badge-blue', feature: 'badge-blue',
  performance: 'badge-orange', types: 'badge-muted', docs: 'badge-muted',
  P1: 'badge-red', P2: 'badge-yellow',
}

export default async function RepoDetail({
  searchParams,
}: {
  searchParams: { org?: string; repo?: string }
}) {
  const org = searchParams.org ?? 'anthropic'
  const repo = searchParams.repo ?? 'claude-tools'

  const [repoData, issues] = await Promise.all([fetchRepo(org, repo), fetchIssues(org, repo)])

  const openIssues = issues.filter(i => i.status !== 'completed')
  const totalValue = openIssues.reduce((a, i) => a + i.salary, 0)
  const activeDev = new Set(issues.flatMap(i => i.devInitials)).size

  return (
    <div className="dashboard">

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Logo />
          <div style={{ marginTop: '0.5rem' }}>
            <span className="badge badge-blue" style={{ fontSize: '0.62rem' }}>Developer</span>
          </div>
        </div>
        <div className="sidebar-section">
          <div className="sidebar-label">Navigation</div>
          {navItems.map(item => (
            <div key={item.label} className={`sidebar-item ${item.active ? 'active' : ''}`}>
              {item.icon}
              <span>{item.label}</span>
              {item.badge && (
                <span style={{ marginLeft: 'auto', fontSize: '0.68rem', fontWeight: 700, background: 'var(--orange-bg)', color: 'var(--orange)', padding: '0.1rem 0.4rem', borderRadius: 4 }}>
                  {item.badge}
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="sidebar-bottom">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, var(--blue), var(--blue-light))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#fff' }}>JK</span>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-1)' }}>jamie_k</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>claude-3-7 connected</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="main-content">

        {/* Topbar */}
        <div className="topbar">
          <Link href="/repos" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.78rem', color: 'var(--text-3)', textDecoration: 'none', transition: 'color 0.1s' }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M8.5 3L5 6.5l3.5 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Browse
          </Link>
          <span style={{ color: 'var(--border-light)', fontSize: '0.8rem' }}>/</span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-2)' }}>{repoData?.org ?? org}</span>
          <span style={{ color: 'var(--border-light)', fontSize: '0.8rem' }}>/</span>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-1)' }}>{repoData?.name ?? repo}</span>
          <div style={{ marginLeft: 'auto', position: 'relative' }}>
            <svg style={{ position: 'absolute', left: '0.625rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} width="13" height="13" viewBox="0 0 13 13" fill="none">
              <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M8.5 8.5L11 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <input className="input" type="text" placeholder="Search issues…" style={{ width: 200, paddingLeft: '2rem', padding: '0.4rem 0.75rem 0.4rem 2rem', fontSize: '0.8rem' }} />
          </div>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, var(--blue), var(--blue-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '0.5rem' }}>
            <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#fff' }}>JK</span>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '1.75rem 2rem' }}>

          {/* Repo header */}
          {repoData && (
            <div className="anim-fade-up" style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ width: 48, height: 48, borderRadius: 10, background: repoData.orgColor + '18', border: `1px solid ${repoData.orgColor}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', color: repoData.orgColor }}>{repoData.orgInitial}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.375rem' }}>
                  <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.375rem', color: 'var(--text-1)' }}>
                    {repoData.fullName}
                  </h1>
                  <span className="badge badge-muted" style={{ fontSize: '0.62rem' }}>public</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: 'var(--text-3)' }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M6 1L7.5 4.3l3.5.5-2.5 2.5.6 3.5L6 9.3l-3.1 1.5.6-3.5L1 4.8l3.5-.5L6 1z"/></svg>
                    {repoData.stars.toLocaleString()}
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-2)', lineHeight: 1.5, maxWidth: 560, marginBottom: '0.75rem' }}>
                  {repoData.description}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--text-3)' }}>
                    <span className={`lang-dot ${repoData.langDot}`} />{repoData.lang}
                  </span>
                  {repoData.tags.map(tag => (
                    <span key={tag} className="badge badge-muted" style={{ fontSize: '0.62rem' }}>{tag}</span>
                  ))}
                </div>
              </div>
              <a
                href="#"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-2)', textDecoration: 'none', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 6, padding: '0.4rem 0.75rem' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.168 6.839 9.489.5.09.682-.217.682-.483 0-.237-.009-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.165 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
                View on GitHub
              </a>
            </div>
          )}

          {/* Stats strip */}
          <div className="anim-fade-up d2" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.875rem', marginBottom: '1.5rem' }}>
            {[
              { label: 'Open issues', value: openIssues.length, color: 'var(--blue)' },
              { label: 'Total value', value: `$${totalValue.toLocaleString()}`, color: 'var(--green)' },
              { label: 'Avg salary', value: openIssues.length ? `$${Math.round(totalValue / openIssues.length)}` : '$0', color: 'var(--text-1)' },
              { label: 'Active devs', value: activeDev, color: 'var(--orange)' },
            ].map(s => (
              <div key={s.label} className="stat-box">
                <div style={{ fontSize: '0.68rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '0.375rem' }}>{s.label}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: s.color }}>{s.value}</div>
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
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <select className="input" style={{ width: 'auto', padding: '0.3rem 0.625rem', fontSize: '0.78rem' }}>
                <option>Sort: Highest salary</option>
                <option>Sort: Most active</option>
                <option>Sort: Newest</option>
              </select>
            </div>
          </div>

          {/* Issues table */}
          <div className="anim-fade-up d4 card" style={{ overflow: 'hidden' }}>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Issue</th>
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
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                            <span className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>#{issue.id}</span>
                            <span style={{ fontWeight: 500, fontSize: '0.875rem', color: 'var(--text-1)' }}>{issue.title}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '0.3rem', paddingLeft: '2.5rem' }}>
                            {issue.labels.map(l => (
                              <span key={l} className={`badge ${labelCfg[l] ?? 'badge-muted'}`} style={{ fontSize: '0.58rem' }}>{l}</span>
                            ))}
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginLeft: '0.25rem' }}>
                              {issue.comments > 0 && `${issue.comments} comments · `}{issue.updated}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${statusCfg[issue.status].cls}`}>{statusCfg[issue.status].label}</span>
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
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>
                                {issue.devs} working
                              </span>
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
          </div>
        </div>
      </div>
    </div>
  )
}
