import { cookies } from 'next/headers'
import Link from 'next/link'
import RepoFilters from './repo-filters'

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
    const token = cookieStore.get('token')?.value
    if (!token) return '?'
    const res = await fetch(`${API}/api/developer/profile`, {
      cache: 'no-store',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return '?'
    const data = await res.json()
    return data.initials ?? '?'
  } catch { return '?' }
}

export default async function ReposMarketplace() {
  const [repos, stats, initials] = await Promise.all([fetchRepos(), fetchStats(), fetchInitials()])

  return (
    <div className="main-content">

      {/* Topbar */}
      <div className="topbar">
        <div style={{ flex: 1 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-1)' }}>Browse Repositories</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '0.5rem' }}>
          <Link href="/developer/profile" style={{ textDecoration: 'none' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, var(--blue), var(--blue-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#fff' }}>{initials}</span>
            </div>
          </Link>
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

        <RepoFilters repos={repos} />
      </div>
    </div>
  )
}
