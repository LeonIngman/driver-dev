const API = process.env.API_URL ?? 'http://localhost:3001'

type CompanyProfile = {
  name: string
  slug: string
  initials: string
  plan: string
  repos: { name: string; full: string; issueCount: number }[]
  stats: {
    totalIssues: number
    openIssues: number
    activeDevs: number
    totalPaid: number
  }
}

async function fetchCompanyProfile(slug: string): Promise<CompanyProfile | null> {
  try {
    const res = await fetch(`${API}/api/company/profile/${slug}`, { cache: 'no-store' })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export default async function CompanyPublicProfile({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const profile = await fetchCompanyProfile(slug)

  if (!profile) {
    return (
      <div className="main-content">
        <div className="topbar">
          <div style={{ flex: 1 }}>
            <nav style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.78rem', color: 'var(--text-3)' }}>
              <span>Company</span>
              <span>/</span>
              <span style={{ color: 'var(--text-1)' }}>Profile</span>
            </nav>
          </div>
        </div>
        <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: 'var(--text-1)', marginBottom: '0.5rem' }}>
            Company not found
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-3)' }}>
            No company with identifier &ldquo;{slug}&rdquo; exists.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="main-content">

      {/* Topbar */}
      <div className="topbar">
        <div style={{ flex: 1 }}>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.78rem', color: 'var(--text-3)' }}>
            <span>Company</span>
            <span>/</span>
            <span style={{ color: 'var(--text-1)' }}>{profile.name}</span>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '1.75rem 2rem', flex: 1 }}>

        {/* Company Card */}
        <div className="anim-fade-up card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 120 }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--orange), var(--orange-light, #f5a623))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '0.75rem',
              }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)' }}>{profile.initials}</span>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-1)', textAlign: 'center' }}>
                {profile.name}
              </div>
              <div style={{ marginTop: '0.375rem' }}>
                <span className="badge badge-orange" style={{ fontSize: '0.62rem' }}>{profile.plan}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="anim-fade-up d2" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.875rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Total Issues', value: profile.stats.totalIssues,                          sub: 'All time',         accent: 'var(--blue)' },
            { label: 'Open Issues',  value: profile.stats.openIssues,                            sub: 'Awaiting a fix',   accent: 'var(--orange)' },
            { label: 'Active Devs',  value: profile.stats.activeDevs,                            sub: 'Contributing',     accent: 'var(--green)' },
            { label: 'Total Paid',   value: `$${profile.stats.totalPaid.toLocaleString()}`,       sub: 'To developers',    accent: 'var(--text-1)' },
          ].map(s => (
            <div key={s.label} className="stat-box">
              <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{s.label}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.625rem', color: s.accent, marginBottom: '0.2rem' }}>{s.value}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Repositories */}
        <div className="anim-fade-up d3" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-1)', marginBottom: '0.875rem' }}>
            Repositories
          </h2>
          <div className="card" style={{ overflow: 'hidden' }}>
            {profile.repos.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-3)', fontSize: '0.85rem' }}>
                No repositories connected yet.
              </div>
            ) : (
              profile.repos.map((repo, i) => (
                <div
                  key={repo.full}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.875rem',
                    padding: '0.875rem 1.25rem',
                    borderBottom: i < profile.repos.length - 1 ? '1px solid var(--border)' : 'none',
                  }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--blue)', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-1)' }}>
                      {repo.name}
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-3)', marginTop: '0.15rem' }}>
                      {repo.full}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-2)' }}>
                      {repo.issueCount}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>issues</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
