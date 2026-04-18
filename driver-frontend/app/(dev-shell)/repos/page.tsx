import Link from 'next/link'
import { cookies } from 'next/headers'

const API = process.env.API_URL ?? 'http://localhost:3001'

type Repo = {
  org: string; orgInitial: string; orgColor: string
  name: string; description: string
  lang: string; langDot: string
  issues: number; totalValue: number; avgSalary: number
  devs: number; stars: number
  tags: string[]
}

type Stats = {
  totalIssues: number
  totalValue: number
  activeDevs: number
}

async function fetchRepos(): Promise<Repo[]> {
  try {
    const res = await fetch(`${API}/api/repos`, { cache: 'no-store' })
    if (!res.ok) return []
    return await res.json()
  } catch { return [] }
}

async function fetchStats(): Promise<Stats> {
  try {
    const res = await fetch(`${API}/api/repos/stats`, { cache: 'no-store' })
    if (!res.ok) return { totalIssues: 0, totalValue: 0, activeDevs: 0 }
    return await res.json()
  } catch { return { totalIssues: 0, totalValue: 0, activeDevs: 0 } }
}

async function fetchInitials(): Promise<string> {
  try {
    const cookieStore = await cookies()
    const devId = cookieStore.get('developer_id')?.value
    const url = devId ? `${API}/api/developer/profile?id=${devId}` : `${API}/api/developer/profile`
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return '?'
    const data = await res.json()
    return data.initials ?? '?'
  } catch { return '?' }
}

const sortOptions = ['Most issues', 'Highest salary', 'Most active', 'Newest']
const filterTags = ['All', 'TypeScript', 'Go', 'Python', 'Rust', 'bug', 'performance', 'ui']

export default async function ReposMarketplace() {
  const [repos, stats, initials] = await Promise.all([fetchRepos(), fetchStats(), fetchInitials()])

  return (
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
            <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#fff' }}>{initials}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '1.75rem 2rem' }}>

        {/* Stats strip */}
        <div className="anim-fade-up" style={{ display: 'flex', gap: '1rem', marginBottom: '1.75rem' }}>
          {[
            { label: 'Repos available', value: repos.length, color: 'var(--blue)' },
            { label: 'Open issues', value: stats.totalIssues, color: 'var(--text-1)' },
            { label: 'Total value', value: `$${stats.totalValue.toLocaleString()}`, color: 'var(--green)' },
            { label: 'Active developers', value: stats.activeDevs, color: 'var(--orange)' },
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
              href={`/repos/${repo.org.toLowerCase()}/${repo.name}`}
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
  )
}
