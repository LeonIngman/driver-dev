import Link from 'next/link'

const Logo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <div style={{ width: 28, height: 28, background: 'var(--blue)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: '#fff', fontWeight: 800, fontSize: 14, fontFamily: 'var(--font-display)' }}>D</span>
    </div>
    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: 'var(--text-1)' }}>Driver</span>
  </div>
)

const GithubIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.168 6.839 9.489.5.09.682-.217.682-.483 0-.237-.009-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.165 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
  </svg>
)

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M2 6l2.8 3L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const steps = [
  { n: 1, label: 'Create Account', done: true },
  { n: 2, label: 'Connect Repo', done: false, active: true },
  { n: 3, label: 'Configure Issues', done: false },
]

const mockRepos = [
  { name: 'claude-tools', full: 'acme-corp/claude-tools', lang: 'TypeScript', langDot: 'lang-ts', private: false, stars: 241, updated: '2h ago', issues: 12 },
  { name: 'design-system', full: 'acme-corp/design-system', lang: 'TypeScript', langDot: 'lang-ts', private: false, stars: 88, updated: '1d ago', issues: 5 },
  { name: 'api-gateway', full: 'acme-corp/api-gateway', lang: 'Go', langDot: 'lang-go', private: true, stars: 33, updated: '3d ago', issues: 8 },
  { name: 'mobile-app', full: 'acme-corp/mobile-app', lang: 'TypeScript', langDot: 'lang-ts', private: true, stars: 17, updated: '5d ago', issues: 21 },
  { name: 'data-pipeline', full: 'acme-corp/data-pipeline', lang: 'Python', langDot: 'lang-py', private: false, stars: 55, updated: '1w ago', issues: 3 },
  { name: 'infra', full: 'acme-corp/infra', lang: 'Go', langDot: 'lang-go', private: true, stars: 4, updated: '2w ago', issues: 0 },
]

export default function ConnectRepo() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-0)', display: 'flex', flexDirection: 'column' }}>

      {/* Top nav */}
      <header style={{ height: 56, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 2rem', background: 'var(--bg-1)' }}>
        <Logo />
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--blue-bg)', border: '1px solid var(--blue-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--blue)' }}>AC</span>
          </div>
          <span style={{ fontSize: '0.825rem', color: 'var(--text-2)' }}>Acme Corp</span>
        </div>
      </header>

      {/* Body */}
      <div style={{ flex: 1, maxWidth: 760, margin: '0 auto', width: '100%', padding: '3rem 1.5rem' }}>

        {/* Steps */}
        <div className="anim-fade-up" style={{ display: 'flex', alignItems: 'center', gap: '0', marginBottom: '3rem' }}>
          {steps.map((s, i) => (
            <div key={s.n} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : undefined }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem' }}>
                <div className={`step-dot ${s.done ? 'done' : s.active ? 'active' : 'idle'}`}>
                  {s.done ? <CheckIcon /> : s.n}
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: s.active ? 600 : 400, color: s.done ? 'var(--green)' : s.active ? 'var(--blue)' : 'var(--text-3)', whiteSpace: 'nowrap' }}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div style={{ flex: 1, height: 1, background: s.done ? 'var(--green)' : 'var(--border)', margin: '0 0.75rem', marginBottom: '1.25rem', opacity: 0.5 }} />
              )}
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="anim-fade-up d2" style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.875rem', color: 'var(--text-1)', marginBottom: '0.5rem' }}>
            Connect a repository
          </h1>
          <p style={{ color: 'var(--text-2)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Select a repository from your GitHub account to connect to Driver. Developers will be able to browse and fix its open issues.
          </p>
        </div>

        {/* GitHub connected */}
        <div className="anim-fade-up d3" style={{ background: 'var(--green-bg)', border: '1px solid rgba(52,211,153,0.25)', borderRadius: 8, padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ color: 'var(--green)' }}>
            <GithubIcon size={18} />
          </div>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--green)' }}>GitHub connected</span>
            <span style={{ fontSize: '0.825rem', color: 'var(--text-2)', marginLeft: '0.5rem' }}>acme-corp · 6 repositories found</span>
          </div>
          <button className="btn btn-ghost" style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem' }}>Change account</button>
        </div>

        {/* Search */}
        <div className="anim-fade-up d4" style={{ position: 'relative', marginBottom: '1rem' }}>
          <svg style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          <input className="input" type="text" placeholder="Search repositories…" style={{ paddingLeft: '2.25rem' }} />
        </div>

        {/* Filters */}
        <div className="anim-fade-up d4" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
          {['All', 'Public', 'Private'].map((f, i) => (
            <button key={f} className="btn" style={{ padding: '0.3rem 0.75rem', fontSize: '0.78rem', background: i === 0 ? 'var(--blue-bg)' : 'var(--bg-3)', color: i === 0 ? 'var(--blue)' : 'var(--text-2)', border: `1px solid ${i === 0 ? 'var(--blue-border)' : 'var(--border)'}` }}>
              {f}
            </button>
          ))}
        </div>

        {/* Repo list */}
        <div className="anim-fade-up d5" style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
          {mockRepos.map((repo, i) => (
            <div
              key={repo.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '1rem 1.25rem',
                borderBottom: i < mockRepos.length - 1 ? '1px solid var(--border)' : 'none',
                transition: 'background 0.1s ease',
                gap: '1rem',
              }}
            >
              {/* Icon */}
              <div style={{ color: 'var(--text-3)', flexShrink: 0 }}>
                <GithubIcon size={18} />
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-1)' }}>{repo.name}</span>
                  <span className={`badge ${repo.private ? 'badge-muted' : 'badge-green'}`} style={{ fontSize: '0.6rem' }}>
                    {repo.private ? 'private' : 'public'}
                  </span>
                  <span className="badge badge-muted" style={{ fontSize: '0.6rem' }}>{repo.issues} issues</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--text-3)' }}>
                    <span className={`lang-dot ${repo.langDot}`} />
                    {repo.lang}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>Updated {repo.updated}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.75rem', color: 'var(--text-3)' }}>
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="currentColor"><path d="M5.5 1L7 3.8l3 .44-2.2 2.14.52 3.02L5.5 7.9 3.18 9.4l.52-3.02L1.5 4.24l3-.44L5.5 1z"/></svg>
                    {repo.stars}
                  </span>
                </div>
              </div>

              {/* Action */}
              <button className="btn btn-blue" style={{ padding: '0.4rem 0.875rem', fontSize: '0.8rem', flexShrink: 0 }}>
                Connect
              </button>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="anim-fade-up d6" style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/company/signup" style={{ fontSize: '0.825rem', color: 'var(--text-3)', textDecoration: 'none' }}>
            ← Back
          </Link>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>
            You can connect more repositories later from your dashboard
          </p>
        </div>
      </div>
    </div>
  )
}
