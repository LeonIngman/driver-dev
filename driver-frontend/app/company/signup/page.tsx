import Link from 'next/link'

const GithubIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.168 6.839 9.489.5.09.682-.217.682-.483 0-.237-.009-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.165 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
  </svg>
)

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
)

const Logo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <div style={{ width: 28, height: 28, background: 'var(--blue)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: '#fff', fontWeight: 800, fontSize: 14, fontFamily: 'var(--font-display)' }}>D</span>
    </div>
    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: 'var(--text-1)' }}>Driver</span>
  </div>
)

export default function CompanySignup() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-0)', display: 'flex' }}>

      {/* Left panel — branding */}
      <div
        className="grid-pattern"
        style={{
          width: '42%',
          background: 'var(--bg-1)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          padding: '2.5rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Glow blob */}
        <div style={{ position: 'absolute', top: '-80px', left: '-80px', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, var(--blue-bg) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '-60px', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <Logo />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', marginTop: '3rem' }}>
          <div className="anim-fade-up" style={{ marginBottom: '0.75rem' }}>
            <span className="badge badge-orange">For Companies</span>
          </div>
          <h1 className="anim-fade-up d2" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '2.5rem', lineHeight: 1.15, color: 'var(--text-1)', marginBottom: '1rem' }}>
            Fix issues.<br />
            <span style={{ color: 'var(--blue)' }}>Ship faster.</span>
          </h1>
          <p className="anim-fade-up d3" style={{ color: 'var(--text-2)', fontSize: '0.95rem', lineHeight: 1.6, maxWidth: 340, marginBottom: '2rem' }}>
            Connect your repositories and let a global community of developers solve your backlog — reviewed and approved before a single PR is opened.
          </p>

          <div className="anim-fade-up d4" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              'Zero code merged without your approval',
              'Live preview of every proposed fix',
              'Claude-assisted development, your repo',
              'Pay only for fixes you accept',
            ].map((pt) => (
              <div key={pt} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
                <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'var(--green-bg)', border: '1px solid rgba(52,211,153,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1, flexShrink: 0 }}>
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M1.5 4L3.2 5.8L6.5 2.2" stroke="#34D399" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span style={{ fontSize: '0.825rem', color: 'var(--text-2)', lineHeight: 1.4 }}>{pt}</span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginTop: '2rem' }}>
          Trusted by teams at Vercel, Stripe, and Linear
        </p>
      </div>

      {/* Right panel — form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div className="anim-fade-up d2" style={{ width: '100%', maxWidth: 420 }}>

          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.5rem', color: 'var(--text-1)', marginBottom: '0.375rem' }}>
            Create company account
          </h2>
          <p style={{ color: 'var(--text-2)', fontSize: '0.875rem', marginBottom: '2rem' }}>
            Already have an account?{' '}
            <Link href="#" style={{ color: 'var(--blue)', textDecoration: 'none' }}>Sign in</Link>
          </p>

          {/* OAuth — GitHub */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1.5rem' }}>
            <button className="oauth-btn">
              <GithubIcon />
              <span>Continue with GitHub</span>
              <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--text-3)' }}>Recommended</span>
            </button>
          </div>

          <div className="divider" style={{ marginBottom: '1.5rem' }}>or continue with email</div>

          {/* Form */}
          <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-2)', marginBottom: '0.375rem' }}>
                Organization name
              </label>
              <input
                className="input"
                type="text"
                placeholder="Acme Corp"
                defaultValue=""
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-2)', marginBottom: '0.375rem' }}>
                Work email
              </label>
              <input
                className="input"
                type="email"
                placeholder="you@company.com"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-2)', marginBottom: '0.375rem' }}>
                Password
              </label>
              <input
                className="input"
                type="password"
                placeholder="Min 8 characters"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-2)', marginBottom: '0.375rem' }}>
                Confirm password
              </label>
              <input
                className="input"
                type="password"
                placeholder="Repeat password"
              />
            </div>

            {/* GitHub connect toggle */}
            <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.875rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 32, height: 32, background: 'var(--bg-3)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-2)' }}>
                <GithubIcon />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-1)' }}>Connect GitHub account</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>Required to link repositories later</div>
              </div>
              <div style={{ width: 36, height: 20, background: 'var(--bg-4)', border: '1px solid var(--border)', borderRadius: 10, position: 'relative', cursor: 'pointer' }}>
                <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'var(--text-3)', position: 'absolute', top: 2, left: 2, transition: 'left 0.15s ease' }} />
              </div>
            </div>

            <button type="submit" className="btn btn-blue" style={{ width: '100%', marginTop: '0.25rem', padding: '0.75rem' }}>
              Create company account
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2.5 7h9M7.5 3.5L11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </form>

          <p style={{ marginTop: '1.25rem', fontSize: '0.72rem', color: 'var(--text-3)', lineHeight: 1.5 }}>
            By creating an account you agree to our{' '}
            <Link href="#" style={{ color: 'var(--text-2)', textDecoration: 'underline' }}>Terms of Service</Link>
            {' '}and{' '}
            <Link href="#" style={{ color: 'var(--text-2)', textDecoration: 'underline' }}>Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
