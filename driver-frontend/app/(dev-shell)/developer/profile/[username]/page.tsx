const API = process.env.API_URL ?? 'http://localhost:3001'

type ActivityItem = {
  type: 'completed' | 'claimed' | 'submitted'
  issueTitle: string
  repo: string
  date: string
  salary: number
}

type PublicProfile = {
  username: string
  initials: string
  memberSince: string
  stats: {
    issuesCompleted: number
    totalEarned: number
    reposContributed: number
  }
  recentActivity: ActivityItem[]
}

async function fetchPublicProfile(username: string): Promise<PublicProfile | null> {
  try {
    const res = await fetch(`${API}/api/developer/profile/${username}`, { cache: 'no-store' })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

const activityConfig: Record<string, { label: string; color: string }> = {
  completed: { label: 'Completed', color: 'var(--green)' },
  claimed:   { label: 'Claimed',   color: 'var(--blue)' },
  submitted: { label: 'Submitted', color: 'var(--orange)' },
}

export default async function DeveloperPublicProfile({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const profile = await fetchPublicProfile(username)

  if (!profile) {
    return (
      <div className="main-content">
        <div className="topbar">
          <div style={{ flex: 1 }}>
            <nav style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.78rem', color: 'var(--text-3)' }}>
              <span>Developer</span>
              <span>/</span>
              <span style={{ color: 'var(--text-1)' }}>Profile</span>
            </nav>
          </div>
        </div>
        <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: 'var(--text-1)', marginBottom: '0.5rem' }}>
            Developer not found
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-3)' }}>
            No developer with username &ldquo;{username}&rdquo; exists.
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
            <span>Developer</span>
            <span>/</span>
            <span style={{ color: 'var(--text-1)' }}>@{profile.username}</span>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '1.75rem 2rem', flex: 1 }}>

        {/* Profile Card */}
        <div className="anim-fade-up card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 120 }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--blue), var(--blue-light))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '0.75rem',
              }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)' }}>{profile.initials}</span>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-1)', textAlign: 'center' }}>
                @{profile.username}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginTop: '0.5rem' }}>
                Member since {new Date(profile.memberSince).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="anim-fade-up d2" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.875rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Completed',  value: profile.stats.issuesCompleted,                              sub: 'Issues fixed',   accent: 'var(--green)' },
            { label: 'Earned',     value: `$${profile.stats.totalEarned.toLocaleString()}`,            sub: 'All time',       accent: 'var(--blue)' },
            { label: 'Repos',      value: profile.stats.reposContributed,                              sub: 'Contributed to', accent: 'var(--orange)' },
          ].map(s => (
            <div key={s.label} className="stat-box">
              <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{s.label}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.625rem', color: s.accent, marginBottom: '0.2rem' }}>{s.value}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="anim-fade-up d3" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-1)', marginBottom: '0.875rem' }}>
            Recent Activity
          </h2>
          <div className="card" style={{ overflow: 'hidden' }}>
            {profile.recentActivity.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-3)', fontSize: '0.85rem' }}>
                No activity yet.
              </div>
            ) : (
              profile.recentActivity.map((item, i) => {
                const cfg = activityConfig[item.type] ?? activityConfig.completed
                return (
                  <div
                    key={i}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.875rem',
                      padding: '0.875rem 1.25rem',
                      borderBottom: i < profile.recentActivity.length - 1 ? '1px solid var(--border)' : 'none',
                    }}
                  >
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.issueTitle}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                        <span className={`badge ${item.type === 'completed' ? 'badge-green' : item.type === 'submitted' ? 'badge-orange' : 'badge-blue'}`} style={{ fontSize: '0.55rem' }}>
                          {cfg.label}
                        </span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-3)' }}>
                          {item.repo}
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      {item.type === 'completed' && (
                        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--green)' }}>
                          ${item.salary}
                        </div>
                      )}
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>{item.date}</div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
