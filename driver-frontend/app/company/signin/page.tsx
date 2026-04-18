'use client'

import Link from 'next/link'

const API = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001').replace(/\/$/, '')

const Logo = () => (
  <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
    <div style={{ width: 28, height: 28, background: 'var(--blue)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: '#fff', fontWeight: 800, fontSize: 14, fontFamily: 'var(--font-display)' }}>D</span>
    </div>
    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: 'var(--text-1)' }}>Driver</span>
  </Link>
)

const GithubIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.168 6.839 9.489.5.09.682-.217.682-.483 0-.237-.009-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.165 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
  </svg>
)

type IssueStatus = 'approved' | 'in-review' | 'open'

type RecentIssue = {
  title: string
  dev: string
  initials: string
  amount: string
  ago: string
  status: IssueStatus
}

const recentIssues: RecentIssue[] = [
  {
    title: 'Fix null check in auth middleware',
    dev: 'mathiasv',
    initials: 'MV',
    amount: '$120',
    ago: '2h ago',
    status: 'approved',
  },
  {
    title: 'Update rate limiter config',
    dev: 'priyank',
    initials: 'PR',
    amount: '$85',
    ago: '5h ago',
    status: 'in-review',
  },
  {
    title: 'Resolve memory leak in websocket',
    dev: 'carlos_d',
    initials: 'CD',
    amount: '$200',
    ago: '1d ago',
    status: 'approved',
  },
]

const statusConfig: Record<IssueStatus, { label: string; className: string }> = {
  approved: { label: 'Approved', className: 'badge-green' },
  'in-review': { label: 'In Review', className: 'badge-yellow' },
  open: { label: 'Open', className: 'badge-muted' },
}

export default function CompanySignin() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-0)' }}>

      {/* Left panel — activity dashboard */}
      <div
        className="grid-pattern"
        style={{
          width: '56%',
          background: 'var(--bg-1)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          padding: '2.5rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative radial glows */}
        <div style={{ position: 'absolute', top: '-100px', right: '-80px', width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(4,120,87,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '8%', left: '-60px', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, var(--blue-bg) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Panel header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--text-1)' }}>
              Issue Activity
            </span>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'var(--bg-2)',
              border: '1px solid var(--border)',
              borderRadius: 5,
              padding: '0.25rem 0.625rem',
            }}>
              <div className="live-dot" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-2)' }}>Live</span>
            </div>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>Recent fixes from your repositories</p>
        </div>

        {/* Issue cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
          {recentIssues.map((issue, i) => (
            <div
              key={issue.title}
              className={`anim-fade-up d${i + 1}`}
              style={{
                background: 'var(--bg-0)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                padding: '1rem 1.125rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.875rem',
              }}
            >
              {/* Avatar */}
              <div style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--blue), var(--blue-light))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.7rem',
                fontWeight: 700,
                color: '#fff',
                flexShrink: 0,
                fontFamily: 'var(--font-display)',
              }}>
                {issue.initials}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--text-1)',
                  marginBottom: '0.25rem',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {issue.title}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
                    @{issue.dev}
                  </span>
                  <span style={{ width: 2, height: 2, borderRadius: '50%', background: 'var(--text-3)', display: 'inline-block' }} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{issue.ago}</span>
                </div>
              </div>

              {/* Right: amount + status */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.3rem', flexShrink: 0 }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: issue.status === 'approved' ? 'var(--green)' : 'var(--text-1)',
                }}>
                  {issue.amount}
                </span>
                <span className={`badge ${statusConfig[issue.status].className}`}>
                  {statusConfig[issue.status].label}
                </span>
              </div>
            </div>
          ))}

          {/* More issues indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.375rem',
            padding: '0.625rem',
            borderRadius: 8,
            border: '1px dashed var(--border)',
            opacity: 0.6,
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
            </svg>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
              8 more open issues
            </span>
          </div>
        </div>

        {/* Stats strip */}
        <div style={{
          marginTop: '1.5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.75rem',
        }}>
          {[
            { label: 'Paid this week', value: '$405', color: 'var(--green)' },
            { label: 'Open issues', value: '8', color: 'var(--text-1)' },
            { label: 'PRs merged', value: '14', color: 'var(--blue)' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{
              background: 'var(--bg-2)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '0.75rem 0.875rem',
            }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-3)', marginBottom: '0.25rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.03em' }}>
                {label}
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.125rem', color }}>
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — sign in */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '2rem 2.5rem' }}>
        <Logo />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 380, margin: '0 auto', width: '100%' }}>

          {/* Badge */}
          <div className="anim-fade-up" style={{ marginBottom: '1.25rem' }}>
            <span className="badge badge-orange">Company</span>
          </div>

          <h1 className="anim-fade-up d2" style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: '2rem',
            lineHeight: 1.15,
            color: 'var(--text-1)',
            marginBottom: '0.5rem',
          }}>
            Welcome back.
          </h1>

          <p className="anim-fade-up d3" style={{ color: 'var(--text-2)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            Review pending fixes, approve PRs, and keep your backlog moving — without touching a line of code.
          </p>

          {/* Activity hint */}
          <div className="anim-fade-up d3" style={{
            background: 'var(--bg-2)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '0.75rem 1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" style={{ flexShrink: 0 }}>
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-2)' }}>
              <span style={{ color: 'var(--text-1)', fontWeight: 600 }}>2 fixes</span>
              {' '}are awaiting your approval
            </span>
          </div>

          <div className="anim-fade-up d4">
            <button
              type="button"
              className="oauth-btn"
              onClick={() => { window.location.href = `${API}/auth/github?role=company` }}
            >
              <GithubIcon />
              <span>Continue with GitHub</span>
            </button>
          </div>

          <div className="anim-fade-up d5" style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <p style={{ color: 'var(--text-2)', fontSize: '0.875rem' }}>
              No account yet?{' '}
              <Link href="/company/signup" style={{ color: 'var(--blue)', textDecoration: 'none', fontWeight: 500 }}>Create one</Link>
            </p>
            <p style={{ color: 'var(--text-2)', fontSize: '0.875rem' }}>
              Signing in as a developer?{' '}
              <Link href="/developer/signin" style={{ color: 'var(--blue)', textDecoration: 'none', fontWeight: 500 }}>Developer sign in</Link>
            </p>
          </div>

          <p className="anim-fade-up d6" style={{ marginTop: '1.5rem', fontSize: '0.7rem', color: 'var(--text-3)', lineHeight: 1.5 }}>
            By signing in you agree to our{' '}
            <Link href="#" style={{ color: 'var(--text-2)', textDecoration: 'underline' }}>Terms of Service</Link>
            {' '}and{' '}
            <Link href="#" style={{ color: 'var(--text-2)', textDecoration: 'underline' }}>Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
