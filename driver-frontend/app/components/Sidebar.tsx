'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export type NavItem = {
  label: string
  href: string
  icon: React.ReactNode
  badge?: number
}

type Props = {
  role: 'developer' | 'company'
  navItems: NavItem[]
  user: { initials: string; name: string; subtitle: string }
  extras?: React.ReactNode
}

function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 26, height: 26, background: 'var(--blue)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: '#fff', fontWeight: 800, fontSize: 13, fontFamily: 'var(--font-display)' }}>D</span>
      </div>
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--text-1)' }}>Driver</span>
    </div>
  )
}

export function Sidebar({ role, navItems, user, extras }: Props) {
  const pathname = usePathname()

  const isDeveloper = role === 'developer'
  const badgeClass = isDeveloper ? 'badge-blue' : 'badge-orange'
  const roleLabel = isDeveloper ? 'Developer' : 'Company'
  const avatarStyle: React.CSSProperties = isDeveloper
    ? { background: 'linear-gradient(135deg, var(--blue), var(--blue-light))' }
    : { background: 'var(--orange-bg)', border: '1px solid var(--orange-border)' }
  const avatarTextColor = isDeveloper ? '#fff' : 'var(--orange)'

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Logo />
        <div style={{ marginTop: '0.5rem' }}>
          <span className={`badge ${badgeClass}`} style={{ fontSize: '0.62rem' }}>{roleLabel}</span>
        </div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-label">Navigation</div>
        {navItems.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link key={item.label} href={item.href} style={{ textDecoration: 'none' }}>
              <div className={`sidebar-item ${isActive ? 'active' : ''}`}>
                {item.icon}
                <span>{item.label}</span>
                {item.badge != null && item.badge > 0 && (
                  <span style={{ marginLeft: 'auto', fontSize: '0.68rem', fontWeight: 700, background: 'var(--blue-dim)', color: '#fff', padding: '0.1rem 0.4rem', borderRadius: 4 }}>
                    {item.badge}
                  </span>
                )}
              </div>
            </Link>
          )
        })}
      </div>

      {extras}

      <div className="sidebar-bottom">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', ...avatarStyle }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: avatarTextColor }}>{user.initials}</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>{user.subtitle}</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
