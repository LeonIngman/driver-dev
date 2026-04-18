import { cookies } from 'next/headers'

const API = process.env.API_URL ?? 'http://localhost:3001'

type ActivityItem = {
  type: 'completed' | 'claimed' | 'submitted'
  issueTitle: string
  repo: string
  date: string
  salary: number
}

type ProfileData = {
  username: string
  firstName: string
  lastName: string
  initials: string
  email: string
  githubConnected: boolean
  githubUsername: string | null
  model: string
  apiKeyMasked: string | null
  memberSince: string
  stats: {
    issuesCompleted: number
    totalEarned: number
    reposContributed: number
    activeStreak: number
  }
  recentActivity: ActivityItem[]
}

async function fetchProfile(): Promise<ProfileData> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    if (!token) throw new Error()
    const res = await fetch(`${API}/api/developer/profile`, {
      cache: 'no-store',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw new Error()
    return await res.json()
  } catch {
    return {
      username: '—', firstName: '—', lastName: '', initials: '?',
      email: '—', githubConnected: false, githubUsername: null,
      model: '—', apiKeyMasked: null, memberSince: '—',
      stats: { issuesCompleted: 0, totalEarned: 0, reposContributed: 0, activeStreak: 0 },
      recentActivity: [],
    }
  }
}

const activityConfig: Record<string, { label: string; color: string }> = {
  completed: { label: 'Completed', color: 'var(--green)' },
  claimed:   { label: 'Claimed',   color: 'var(--blue)' },
  submitted: { label: 'Submitted', color: 'var(--orange)' },
}

export default async function DeveloperProfile() {
  const profile = await fetchProfile()

  return (
    <div className="main-content">

      {/* Topbar */}
      <div className="topbar">
        <div style={{ flex: 1 }}>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.78rem', color: 'var(--text-3)' }}>
            <span>Developer</span>
            <span>/</span>
            <span style={{ color: 'var(--text-1)' }}>Profile</span>
          </nav>
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

        {/* Profile Card */}
        <div className="anim-fade-up card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>

            {/* Left — avatar & identity */}
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
                {profile.firstName} {profile.lastName}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-3)', marginTop: '0.125rem' }}>
                @{profile.username}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginTop: '0.5rem' }}>
                Member since {new Date(profile.memberSince).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </div>
            </div>

            {/* Right — account details */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.875rem', paddingTop: '0.25rem' }}>

              {/* Email */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={{ color: 'var(--text-3)', flexShrink: 0 }}>
                  <rect x="1.5" y="3" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M1.5 4.5l6 4 6-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-2)' }}>{profile.email}</span>
              </div>

              {/* GitHub */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="var(--text-3)" style={{ flexShrink: 0 }}>
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.168 6.839 9.489.5.09.682-.217.682-.483 0-.237-.009-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.165 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                </svg>
                {profile.githubConnected ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-2)' }}>{profile.githubUsername}</span>
                    <span className="badge badge-green" style={{ fontSize: '0.58rem' }}>Connected</span>
                  </div>
                ) : (
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-3)' }}>Not connected</span>
                )}
              </div>

              {/* Model */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={{ color: 'var(--text-3)', flexShrink: 0 }}>
                  <rect x="2" y="2" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M5 5.5h5M5 7.5h3.5M5 9.5h4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
                </svg>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-2)' }}>Preferred model: </span>
                <span className="badge badge-blue" style={{ fontSize: '0.62rem' }}>{profile.model}</span>
              </div>

              {/* API Key */}
              {profile.apiKeyMasked && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={{ color: 'var(--text-3)', flexShrink: 0 }}>
                    <circle cx="5.5" cy="7.5" r="3" stroke="currentColor" strokeWidth="1.2"/>
                    <path d="M8 7.5h5.5M11.5 6v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-3)', letterSpacing: '0.03em' }}>{profile.apiKeyMasked}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="anim-fade-up d2" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.875rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Completed',       value: profile.stats.issuesCompleted,                              sub: 'Issues fixed',       accent: 'var(--green)' },
            { label: 'Earned',           value: `$${profile.stats.totalEarned.toLocaleString()}`,           sub: 'All time',           accent: 'var(--blue)' },
            { label: 'Repos',            value: profile.stats.reposContributed,                             sub: 'Contributed to',     accent: 'var(--orange)' },
            { label: 'Active Streak',    value: `${profile.stats.activeStreak}d`,                           sub: 'Current streak',     accent: 'var(--text-1)' },
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
                    {/* Type dot */}
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />

                    {/* Info */}
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

                    {/* Right — date & salary */}
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
