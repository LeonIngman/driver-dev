import Link from 'next/link'

const Logo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <div style={{ width: 26, height: 26, background: 'var(--blue)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: '#fff', fontWeight: 800, fontSize: 13, fontFamily: 'var(--font-display)' }}>D</span>
    </div>
    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--text-1)' }}>Driver</span>
  </div>
)

type NavItem = { label: string; icon: React.ReactNode; active?: boolean; badge?: number }

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor"><rect x="1" y="1" width="5.5" height="5.5" rx="1.2"/><rect x="8.5" y="1" width="5.5" height="5.5" rx="1.2"/><rect x="1" y="8.5" width="5.5" height="5.5" rx="1.2"/><rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1.2"/></svg>,
  },
  {
    label: 'Repositories',
    icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1.5" y="2" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M5 2v11M1.5 5.5h12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  },
  {
    label: 'Issues',
    icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" strokeWidth="1.3"/><path d="M7.5 4.5v3.5l2 1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
    active: true,
    badge: 34,
  },
  {
    label: 'Payouts',
    icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1.5" y="4" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M4 4V3a1 1 0 011-1h5a1 1 0 011 1v1M5.5 8.5h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  },
  {
    label: 'Settings',
    icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="2" stroke="currentColor" strokeWidth="1.3"/><path d="M7.5 1.5v1M7.5 12.5v1M1.5 7.5h1M12.5 7.5h1M3.4 3.4l.7.7M10.9 10.9l.7.7M10.9 3.4l-.7.7M4.1 10.9l-.7.7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  },
]

const repos = ['All repositories', 'acme-corp/claude-tools', 'acme-corp/design-system', 'acme-corp/api-gateway']
const statuses = ['All statuses', 'Open', 'Claimed', 'In Review', 'Completed']

type Issue = {
  id: string; title: string; repo: string; status: 'open' | 'claimed' | 'in_review' | 'completed'
  label: string; salary: string; devs: number; devInitials: string[]; devColors: string[]; updated: string
}

const issues: Issue[] = [
  { id: '#384', title: 'Fix race condition in streaming response handler', repo: 'claude-tools', status: 'in_review', label: 'bug', salary: '450', devs: 2, devInitials: ['JK', 'LM'], devColors: ['#3B82F6', '#8B5CF6'], updated: '12m ago' },
  { id: '#381', title: 'Add retry logic for failed API calls with exponential backoff', repo: 'claude-tools', status: 'claimed', label: 'enhancement', salary: '280', devs: 1, devInitials: ['RS'], devColors: ['#F97316'], updated: '1h ago' },
  { id: '#375', title: 'Token counter component renders incorrectly on Safari', repo: 'design-system', status: 'open', label: 'bug', salary: '175', devs: 3, devInitials: ['AA', 'BT', 'CN'], devColors: ['#34D399', '#60A5FA', '#F87171'], updated: '2h ago' },
  { id: '#372', title: 'Implement dark mode tokens for all semantic colors', repo: 'design-system', status: 'open', label: 'feature', salary: '320', devs: 0, devInitials: [], devColors: [], updated: '4h ago' },
  { id: '#361', title: 'Rate limiting middleware not propagating headers correctly', repo: 'api-gateway', status: 'open', label: 'bug', salary: '500', devs: 1, devInitials: ['PW'], devColors: ['#A78BFA'], updated: '6h ago' },
  { id: '#359', title: 'Migrate auth module to use PKCE flow', repo: 'api-gateway', status: 'in_review', label: 'security', salary: '650', devs: 2, devInitials: ['EF', 'GH'], devColors: ['#FBBF24', '#34D399'], updated: '1d ago' },
  { id: '#344', title: 'Add accessibility labels to all icon-only buttons', repo: 'design-system', status: 'open', label: 'a11y', salary: '120', devs: 0, devInitials: [], devColors: [], updated: '2d ago' },
  { id: '#338', title: 'Fix memory leak in WebSocket connection pool', repo: 'api-gateway', status: 'completed', label: 'bug', salary: '400', devs: 1, devInitials: ['XY'], devColors: ['#60A5FA'], updated: '3d ago' },
]

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

export default function CompanyIssues() {
  const totalValue = issues.reduce((a, i) => a + parseFloat(i.salary), 0)
  const openCount = issues.filter(i => i.status === 'open').length
  const activeDevs = new Set(issues.flatMap(i => i.devInitials)).size

  return (
    <div className="dashboard">

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Logo />
          <div style={{ marginTop: '0.5rem' }}>
            <span className="badge badge-orange" style={{ fontSize: '0.62rem' }}>Company</span>
          </div>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-label">Navigation</div>
          {navItems.map(item => (
            <div key={item.label} className={`sidebar-item ${item.active ? 'active' : ''}`}>
              {item.icon}
              <span>{item.label}</span>
              {item.badge && (
                <span style={{ marginLeft: 'auto', fontSize: '0.68rem', fontWeight: 700, background: item.active ? 'var(--blue-dim)' : 'var(--bg-4)', color: item.active ? '#fff' : 'var(--text-2)', padding: '0.1rem 0.4rem', borderRadius: 4 }}>
                  {item.badge}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Repos list */}
        <div style={{ padding: '0 0.75rem' }}>
          <div className="sidebar-label">Repositories</div>
          {['claude-tools', 'design-system', 'api-gateway'].map(r => (
            <div key={r} className="sidebar-item" style={{ fontSize: '0.8rem' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--blue)', flexShrink: 0 }} />
              {r}
            </div>
          ))}
          <div className="sidebar-item" style={{ color: 'var(--blue)', fontSize: '0.8rem' }}>
            <span>+</span> Connect repo
          </div>
        </div>

        <div className="sidebar-bottom">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--orange-bg)', border: '1px solid var(--orange-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--orange)' }}>AC</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Acme Corp</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>Pro plan</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
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

          {/* Search */}
          <div style={{ position: 'relative' }}>
            <svg style={{ position: 'absolute', left: '0.625rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} width="13" height="13" viewBox="0 0 13 13" fill="none">
              <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M8.5 8.5L11 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <input className="input" type="text" placeholder="Search issues…" style={{ width: 220, paddingLeft: '2rem', padding: '0.4rem 0.75rem 0.4rem 2rem', fontSize: '0.8rem' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '0.5rem' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--orange-bg)', border: '1px solid var(--orange-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--orange)' }}>AC</span>
            </div>
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
              { label: 'Open Issues', value: openCount, sub: 'Awaiting a fix', accent: 'var(--blue)' },
              { label: 'In Progress', value: issues.filter(i => i.status === 'claimed' || i.status === 'in_review').length, sub: 'Being worked on', accent: 'var(--orange)' },
              { label: 'Active Devs', value: activeDevs, sub: 'Across all repos', accent: 'var(--green)' },
              { label: 'Total Value', value: `$${totalValue.toLocaleString()}`, sub: 'In open salaries', accent: 'var(--text-1)' },
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
              {repos.map(r => <option key={r}>{r}</option>)}
            </select>
            <select className="input" style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}>
              {statuses.map(s => <option key={s}>{s}</option>)}
            </select>
            <div style={{ marginLeft: 'auto', fontSize: '0.78rem', color: 'var(--text-3)' }}>
              {issues.length} issues
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

            {/* Table footer */}
            <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>Showing 8 of 34 issues</span>
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
    </div>
  )
}
