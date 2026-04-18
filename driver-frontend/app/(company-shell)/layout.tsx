import Link from 'next/link'
import { Sidebar, type NavItem } from '@/app/components/Sidebar'

const API = process.env.API_URL ?? 'http://localhost:3001'

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/company/dashboard',
    icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor"><rect x="1" y="1" width="5.5" height="5.5" rx="1.2"/><rect x="8.5" y="1" width="5.5" height="5.5" rx="1.2"/><rect x="1" y="8.5" width="5.5" height="5.5" rx="1.2"/><rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1.2"/></svg>,
  },
  {
    label: 'Repositories',
    href: '/company/repositories',
    icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1.5" y="2" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M5 2v11M1.5 5.5h12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  },
  {
    label: 'Issues',
    href: '/company/issues',
    icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" strokeWidth="1.3"/><path d="M7.5 4.5v3.5l2 1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  },
  {
    label: 'Payouts',
    href: '/company/payouts',
    icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1.5" y="4" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M4 4V3a1 1 0 011-1h5a1 1 0 011 1v1M5.5 8.5h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  },
  {
    label: 'Profile',
    href: '/company/profile',
    icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.3"/><path d="M3 13c0-2.5 2-4.5 4.5-4.5S12 10.5 12 13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  },
  {
    label: 'Settings',
    href: '/company/settings',
    icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="2" stroke="currentColor" strokeWidth="1.3"/><path d="M7.5 1.5v1M7.5 12.5v1M1.5 7.5h1M12.5 7.5h1M3.4 3.4l.7.7M10.9 10.9l.7.7M10.9 3.4l-.7.7M4.1 10.9l-.7.7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  },
]

type Repo = { name: string; full: string }
type Profile = { name: string; initials: string; plan: string }

async function fetchRepos(): Promise<Repo[]> {
  try {
    const res = await fetch(`${API}/api/company/repos`, { cache: 'no-store' })
    if (!res.ok) return []
    return await res.json()
  } catch { return [] }
}

async function fetchProfile(): Promise<Profile> {
  try {
    const res = await fetch(`${API}/api/company/profile`, { cache: 'no-store' })
    if (!res.ok) return { name: '—', initials: '?', plan: '—' }
    return await res.json()
  } catch { return { name: '—', initials: '?', plan: '—' } }
}

export default async function CompanyShellLayout({ children }: { children: React.ReactNode }) {
  const [repos, profile] = await Promise.all([fetchRepos(), fetchProfile()])

  const reposExtras = (
    <div style={{ padding: '0 0.75rem' }}>
      <div className="sidebar-label">Repositories</div>
      {repos.map(r => (
        <div key={r.name} className="sidebar-item" style={{ fontSize: '0.8rem' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--blue)', flexShrink: 0 }} />
          {r.name}
        </div>
      ))}
      <Link href="/company/connect-repo" style={{ textDecoration: 'none' }}>
        <div className="sidebar-item" style={{ color: 'var(--blue)', fontSize: '0.8rem' }}>
          <span>+</span> Connect repo
        </div>
      </Link>
    </div>
  )

  return (
    <div className="dashboard">
      <Sidebar
        role="company"
        navItems={navItems}
        user={{ initials: profile.initials, name: profile.name, subtitle: profile.plan }}
        extras={reposExtras}
      />
      {children}
    </div>
  )
}
