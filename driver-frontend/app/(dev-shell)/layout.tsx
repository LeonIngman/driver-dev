import { Sidebar, type NavItem } from '@/app/components/Sidebar'
import { cookies } from 'next/headers'

const API = process.env.API_URL ?? 'http://localhost:3001'

const navItems: NavItem[] = [
  {
    label: 'Browse',
    href: '/developer/repos',
    icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" strokeWidth="1.3"/><circle cx="7.5" cy="7.5" r="2" stroke="currentColor" strokeWidth="1.3"/></svg>,
  },
  {
    label: 'Profile',
    href: '/developer/profile',
    icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.3"/><path d="M3 13c0-2.5 2-4.5 4.5-4.5S12 10.5 12 13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  },
  {
    label: 'My Issues',
    href: '/developer/issues',
    icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" strokeWidth="1.3"/><path d="M7.5 4.5v3.5l2 1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  },
  {
    label: 'Settings',
    href: '/developer/settings',
    icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="2" stroke="currentColor" strokeWidth="1.3"/><path d="M7.5 1.5v1M7.5 12.5v1M1.5 7.5h1M12.5 7.5h1M3.4 3.4l.7.7M10.9 10.9l.7.7M10.9 3.4l-.7.7M4.1 10.9l-.7.7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  },
]

type Profile = { username: string; initials: string; githubConnected: boolean; model: string }

async function fetchProfile(): Promise<Profile> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    if (!token) return { username: '—', initials: '?', githubConnected: false, model: '—' }
    const res = await fetch(`${API}/api/developer/profile`, {
      cache: 'no-store',
      headers: { Authorization: `Bearer ${token}` },
    })
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
