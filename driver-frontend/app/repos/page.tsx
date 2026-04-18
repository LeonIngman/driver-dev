import Link from 'next/link'

const Logo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <div style={{ width: 26, height: 26, background: 'var(--blue)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: '#fff', fontWeight: 800, fontSize: 13, fontFamily: 'var(--font-display)' }}>D</span>
    </div>
    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--text-1)' }}>Driver</span>
  </div>
)

const navItems = [
  {
    label: 'Browse', active: true,
    icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" strokeWidth="1.3"/><circle cx="7.5" cy="7.5" r="2" stroke="currentColor" strokeWidth="1.3"/></svg>,
  },
  {
    label: 'My Claims', badge: 3,
    icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="2" y="2" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M5 7.5h5M7.5 5v5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  },
  {
    label: 'Earnings',
    icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1.5" y="4" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M5 4V3a1 1 0 011-1h3a1 1 0 011 1v1M5.5 8.5h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  },
  {
    label: 'Settings',
    icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="2" stroke="currentColor" strokeWidth="1.3"/><path d="M7.5 1.5v1M7.5 12.5v1M1.5 7.5h1M12.5 7.5h1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  },
]

type Repo = {
  org: string; orgInitial: string; orgColor: string
  name: string; description: string
  lang: string; langDot: string
  issues: number; totalValue: number; avgSalary: number
  devs: number; stars: number
  tags: string[]
}

const repos: Repo[] = [
  {
    org: 'Vercel', orgInitial: 'V', orgColor: '#FFFFFF',
    name: 'next.js', description: 'The React Framework for the Web. Bug fixes and performance improvements welcome.',
    lang: 'TypeScript', langDot: 'lang-ts',
    issues: 18, totalValue: 7420, avgSalary: 412, devs: 14, stars: 128400,
    tags: ['performance', 'bug', 'dx'],
  },
  {
    org: 'Anthropic', orgInitial: 'A', orgColor: '#CC785C',
    name: 'claude-tools', description: 'Utility library for building Claude-powered applications. SDK and tooling issues.',
    lang: 'TypeScript', langDot: 'lang-ts',
    issues: 12, totalValue: 4850, avgSalary: 404, devs: 9, stars: 3210,
    tags: ['ai', 'sdk', 'bug'],
  },
  {
    org: 'Linear', orgInitial: 'L', orgColor: '#5E6AD2',
    name: 'linear-app', description: 'Issue tracking for modern product teams. UI and workflow automation fixes.',
    lang: 'TypeScript', langDot: 'lang-ts',
    issues: 9, totalValue: 3600, avgSalary: 400, devs: 7, stars: 4100,
    tags: ['ui', 'enhancement', 'accessibility'],
  },
  {
    org: 'Stripe', orgInitial: 'S', orgColor: '#635BFF',
    name: 'stripe-node', description: 'Node.js library for the Stripe API. Reliability and type safety improvements.',
    lang: 'TypeScript', langDot: 'lang-ts',
    issues: 15, totalValue: 9750, avgSalary: 650, devs: 11, stars: 8900,
    tags: ['payments', 'reliability', 'types'],
  },
  {
    org: 'PlanetScale', orgInitial: 'P', orgColor: '#F97316',
    name: 'database-js', description: 'Serverless driver for PlanetScale MySQL. Edge runtime and connection handling.',
    lang: 'TypeScript', langDot: 'lang-ts',
    issues: 7, totalValue: 2240, avgSalary: 320, devs: 5, stars: 1240,
    tags: ['database', 'edge', 'bug'],
  },
  {
    org: 'Resend', orgInitial: 'R', orgColor: '#34D399',
    name: 'resend-node', description: 'Email API for developers. Webhook handling and template improvements.',
    lang: 'TypeScript', langDot: 'lang-ts',
    issues: 5, totalValue: 1500, avgSalary: 300, devs: 4, stars: 890,
    tags: ['email', 'webhooks'],
  },
  {
    org: 'Supabase', orgInitial: 'S', orgColor: '#3ECF8E',
    name: 'supabase-js', description: 'Open source Firebase alternative. Realtime subscriptions and RLS helpers.',
    lang: 'TypeScript', langDot: 'lang-ts',
    issues: 22, totalValue: 8800, avgSalary: 400, devs: 18, stars: 21400,
    tags: ['database', 'realtime', 'auth'],
  },
  {
    org: 'Turborepo', orgInitial: 'T', orgColor: '#EF4444',
    name: 'turborepo', description: 'High-performance build system for JavaScript/TypeScript monorepos.',
    lang: 'Go', langDot: 'lang-go',
    issues: 11, totalValue: 5500, avgSalary: 500, devs: 8, stars: 27800,
    tags: ['build', 'performance', 'dx'],
  },
]

const sortOptions = ['Most issues', 'Highest salary', 'Most active', 'Newest']
const filterTags = ['All', 'TypeScript', 'Go', 'Python', 'Rust', 'bug', 'performance', 'ui']

export default function ReposMarketplace() {
  const totalIssues = repos.reduce((a, r) => a + r.issues, 0)
  const totalValue = repos.reduce((a, r) => a + r.totalValue, 0)

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
                <span style={{ marginLeft: 'auto', fontSize: '0.68rem', fontWeight: 700, background: 'var(--orange-bg)', color: 'var(--orange)', padding: '0.1rem 0.4rem', borderRadius: 4, border: '1px solid var(--orange-border)' }}>
                  {item.badge}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Quick stats */}
        <div style={{ padding: '0 0.75rem' }}>
          <div className="sidebar-label">Your Stats</div>
          <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.75rem' }}>
            {[
              { label: 'Fixes merged', value: '7' },
              { label: 'Earned', value: '$2,150' },
              { label: 'Active claims', value: '3' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.3rem 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{s.label}</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-1)', fontFamily: 'var(--font-mono)' }}>{s.value}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.3rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>Active claims</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-1)', fontFamily: 'var(--font-mono)' }}>3</span>
            </div>
          </div>
        </div>

        <div className="sidebar-bottom">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, var(--blue), var(--blue-light))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#fff' }}>JK</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-1)' }}>jamie_k</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>Connected · claude-3-7</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="main-content">

        {/* Topbar */}
        <div className="topbar">
          <div style={{ flex: 1 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-1)' }}>Browse Repositories</span>
          </div>

          <div style={{ position: 'relative' }}>
            <svg style={{ position: 'absolute', left: '0.625rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} width="13" height="13" viewBox="0 0 13 13" fill="none">
              <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M8.5 8.5L11 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <input className="input" type="text" placeholder="Search repos or orgs…" style={{ width: 240, paddingLeft: '2rem', padding: '0.4rem 0.75rem 0.4rem 2rem', fontSize: '0.8rem' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '0.5rem' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, var(--blue), var(--blue-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#fff' }}>JK</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '1.75rem 2rem' }}>

          {/* Stats strip */}
          <div className="anim-fade-up" style={{ display: 'flex', gap: '1rem', marginBottom: '1.75rem' }}>
            {[
              { label: 'Repos available', value: repos.length, color: 'var(--blue)' },
              { label: 'Open issues', value: totalIssues, color: 'var(--text-1)' },
              { label: 'Total value', value: `$${totalValue.toLocaleString()}`, color: 'var(--green)' },
              { label: 'Active developers', value: 87, color: 'var(--orange)' },
            ].map(s => (
              <div key={s.label} style={{ flex: 1, background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.875rem 1rem' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '0.375rem' }}>{s.label}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.375rem', color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Filters row */}
          <div className="anim-fade-up d2" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
              {filterTags.map((tag, i) => (
                <button key={tag} className="btn" style={{ padding: '0.3rem 0.7rem', fontSize: '0.76rem', background: i === 0 ? 'var(--blue-bg)' : 'var(--bg-3)', color: i === 0 ? 'var(--blue)' : 'var(--text-3)', border: `1px solid ${i === 0 ? 'var(--blue-border)' : 'var(--border)'}`, borderRadius: 5 }}>
                  {tag}
                </button>
              ))}
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>Sort by</span>
              <select className="input" style={{ width: 'auto', padding: '0.35rem 0.625rem', fontSize: '0.8rem' }}>
                {sortOptions.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>

          {/* Repo grid */}
          <div
            className="anim-fade-up d3"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '0.875rem' }}
          >
            {repos.map(repo => (
              <Link
                key={`${repo.org}-${repo.name}`}
                href="/repos/detail"
                style={{ textDecoration: 'none' }}
              >
                <div
                  className="card card-hover"
                  style={{ padding: '1.25rem', height: '100%', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
                >
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.875rem' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: repo.orgColor + '18', border: `1px solid ${repo.orgColor}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.9rem', color: repo.orgColor }}>{repo.orgInitial}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginBottom: '0.1rem' }}>{repo.org}</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.975rem', color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {repo.name}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}>
                      <svg width="11" height="11" viewBox="0 0 11 11" fill="var(--text-3)"><path d="M5.5 1L7 3.8l3 .44-2.2 2.14.52 3.02L5.5 7.9 3.18 9.4l.52-3.02L1.5 4.24l3-.44L5.5 1z"/></svg>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>{(repo.stars / 1000).toFixed(1)}k</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-2)', lineHeight: 1.5, marginBottom: '1rem', flex: 1 }}>
                    {repo.description}
                  </p>

                  {/* Tags */}
                  <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', color: 'var(--text-3)' }}>
                      <span className={`lang-dot ${repo.langDot}`} />{repo.lang}
                    </span>
                    {repo.tags.map(tag => (
                      <span key={tag} className="badge badge-muted" style={{ fontSize: '0.6rem' }}>{tag}</span>
                    ))}
                  </div>

                  {/* Stats row */}
                  <div style={{ display: 'flex', gap: '0', borderTop: '1px solid var(--border)', paddingTop: '0.875rem' }}>
                    {[
                      { label: 'Issues', value: repo.issues, color: 'var(--blue)' },
                      { label: 'Avg salary', value: `$${repo.avgSalary}`, color: 'var(--green)' },
                      { label: 'Devs active', value: repo.devs, color: 'var(--orange)' },
                    ].map((s, i) => (
                      <div key={s.label} style={{ flex: 1, textAlign: i === 1 ? 'center' : i === 2 ? 'right' : 'left' }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: '0.67rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
