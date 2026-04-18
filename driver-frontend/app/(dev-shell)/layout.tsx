import { Sidebar, type NavItem } from '@/app/components/Sidebar'

const API = process.env.API_URL ?? 'http://localhost:3001'

const navItems: NavItem[] = [
  {
    label: 'Browse',
    href: '/repos',
    icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" strokeWidth="1.3"/><circle cx="7.5" cy="7.5" r="2" stroke="currentColor" strokeWidth="1.3"/></svg>,
  },
  {
    label: 'My Issues',
    href: '/developer/issues',
    icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" strokeWidth="1.3"/><path d="M7.5 4.5v3.5l2 1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  },
  {
    label: 'Earnings',
    href: '/developer/earnings',
    icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1.5" y="4" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M5 4V3a1 1 0 011-1h3a1 1 0 011 1v1M5.5 8.5h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  },
  {
    label: 'Settings',
    href: '/developer/settings',
    icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="2" stroke="currentColor" strokeWidth="1.3"/><path d="M7.5 1.5v1M7.5 12.5v1M1.5 7.5h1M12.5 7.5h1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  },
]

type Profile = { username: string; initials: string; githubConnected: boolean; model: string }

async function fetchProfile(): Promise<Profile> {
  try {
    const res = await fetch(`${API}/api/developer/profile`, { cache: 'no-store' })
    if (!res.ok) return { username: '—', initials: '?', githubConnected: false, model: '—' }
    return await res.json()
  } catch { return { username: '—', initials: '?', githubConnected: false, model: '—' } }
}

export default async function DevShellLayout({ children }: { children: React.ReactNode }) {
  const profile = await fetchProfile()

  return (
    <div className="dashboard">
      <Sidebar
        role="developer"
        navItems={navItems}
        user={{
          initials: profile.initials,
          name: profile.username,
          subtitle: profile.githubConnected ? `${profile.model} connected` : 'Not connected',
        }}
      />
      {children}
    </div>
  )
}
