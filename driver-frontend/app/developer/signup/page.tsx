'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const API = process.env.NEXT_PUBLIC_API_URL

const Logo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <div style={{ width: 28, height: 28, background: 'var(--blue)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: '#fff', fontWeight: 800, fontSize: 14, fontFamily: 'var(--font-display)' }}>D</span>
    </div>
    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: 'var(--text-1)' }}>Driver</span>
  </div>
)

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
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
)

const AnthropicIcon = () => (
  <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
    <rect width="32" height="32" rx="8" fill="#CC785C"/>
    <path d="M19.2 8h-3.2L10 24h3.2l1.4-3.6h5.6l1.4 3.6H24L19.2 8zm-3.6 9.8 1.9-4.9 1.9 4.9h-3.8z" fill="white"/>
  </svg>
)

type TopEarner = {
  username: string
  initials: string
  fixesCount: number
  earned: string
}

export default function DeveloperSignup() {
  const router = useRouter()
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', anthropicApiKey: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [topEarner, setTopEarner] = useState<TopEarner | null>(null)

  useEffect(() => {
    fetch(`${API}/developers/leaderboard/week`)
      .then(r => r.ok ? r.json() : null)
      .then(data => data && setTopEarner(data))
      .catch(() => {})
  }, [])

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API}/developers/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
          anthropicApiKey: form.anthropicApiKey,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.message ?? 'Signup failed.')
        return
      }

      router.push('/repos')
    } finally {
      setLoading(false)
    }
  }

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
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, var(--blue-bg) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '5%', left: '-60px', width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(204,120,92,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <Logo />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', marginTop: '3rem' }}>
          <div className="anim-fade-up" style={{ marginBottom: '0.75rem' }}>
            <span className="badge badge-blue">For Developers</span>
          </div>
          <h1 className="anim-fade-up d2" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '2.5rem', lineHeight: 1.15, color: 'var(--text-1)', marginBottom: '1rem' }}>
            Browse issues.<br />
            <span style={{ color: 'var(--blue)' }}>Earn money.</span>
          </h1>
          <p className="anim-fade-up d3" style={{ color: 'var(--text-2)', fontSize: '0.95rem', lineHeight: 1.6, maxWidth: 340, marginBottom: '2rem' }}>
            Use your own Claude account to fix real issues in real repos — and get paid when companies approve your solution.
          </p>

          <div className="anim-fade-up d4" style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {[
              { icon: '🔍', text: 'Browse open issues from top companies' },
              { icon: '🤖', text: 'Fix with Claude — you control your tokens' },
              { icon: '👁️', text: 'Company sees a live preview before accepting' },
              { icon: '💰', text: 'Get paid when your PR is approved' },
            ].map(item => (
              <div key={item.text} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <span style={{ fontSize: '1rem', flexShrink: 0 }}>{item.icon}</span>
                <span style={{ fontSize: '0.825rem', color: 'var(--text-2)', lineHeight: 1.4 }}>{item.text}</span>
              </div>
            ))}
          </div>

          {topEarner && (
            <div className="anim-fade-up d5" style={{ marginTop: '2rem', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '1rem 1.125rem' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginBottom: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Top earner this week</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, var(--blue), var(--blue-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>{topEarner.initials}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-1)' }}>{topEarner.username}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{topEarner.fixesCount} fixes merged · <span style={{ color: 'var(--green)' }}>{topEarner.earned} earned</span></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: 440 }}>

          <div className="anim-fade-up">
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.5rem', color: 'var(--text-1)', marginBottom: '0.375rem' }}>
              Create your account
            </h2>
            <p style={{ color: 'var(--text-2)', fontSize: '0.875rem', marginBottom: '2rem' }}>
              Already have an account?{' '}
              <Link href="#" style={{ color: 'var(--blue)', textDecoration: 'none' }}>Sign in</Link>
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1.25rem' }}>
            <button type="button" className="oauth-btn" onClick={() => { window.location.href = `${API}/auth/github?role=developer` }}>
              <GithubIcon />
              <span>Continue with GitHub</span>
            </button>
            <button type="button" className="oauth-btn" onClick={() => { window.location.href = `${API}/auth/google?role=developer` }}>
              <GoogleIcon />
              <span>Continue with Google</span>
            </button>
          </div>

          <div className="divider" style={{ marginBottom: '1.25rem' }}>or use email</div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div style={{ display: 'flex', gap: '0.625rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-2)', marginBottom: '0.3rem' }}>First name</label>
                <input className="input" type="text" placeholder="Jamie" value={form.firstName} onChange={e => set('firstName', e.target.value)} required />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-2)', marginBottom: '0.3rem' }}>Last name</label>
                <input className="input" type="text" placeholder="Klein" value={form.lastName} onChange={e => set('lastName', e.target.value)} required />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-2)', marginBottom: '0.3rem' }}>Email</label>
              <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} required />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-2)', marginBottom: '0.3rem' }}>Password</label>
              <input className="input" type="password" placeholder="Min 8 characters" value={form.password} onChange={e => set('password', e.target.value)} required minLength={8} />
            </div>

            <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 10, padding: '1rem 1.125rem', marginTop: '0.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.875rem' }}>
                <AnthropicIcon />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-1)', marginBottom: '0.25rem' }}>Your Anthropic API key</div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-2)', lineHeight: 1.5 }}>
                    Driver runs Claude under your own API key — you only pay for what you use. Your key is never shared.
                  </p>
                </div>
              </div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-3)', marginBottom: '0.375rem' }}>
                Anthropic API key
              </label>
              <input
                className="input"
                type="password"
                placeholder="sk-ant-api03-…"
                value={form.anthropicApiKey}
                onChange={e => set('anthropicApiKey', e.target.value)}
                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', letterSpacing: '0.03em' }}
              />
              <p style={{ marginTop: '0.375rem', fontSize: '0.7rem', color: 'var(--text-3)' }}>
                Find your key at <span style={{ color: 'var(--blue)' }}>console.anthropic.com</span>
              </p>
            </div>

            {error && (
              <p style={{ fontSize: '0.8rem', color: '#f87171', margin: 0 }}>{error}</p>
            )}

            <button type="submit" className="btn btn-blue" disabled={loading} style={{ width: '100%', padding: '0.75rem', marginTop: '0.25rem' }}>
              {loading ? 'Creating account…' : 'Create developer account'}
              {!loading && (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2.5 7h9M7.5 3.5L11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>

            <p style={{ fontSize: '0.72rem', color: 'var(--text-3)', lineHeight: 1.5, textAlign: 'center' }}>
              By signing up you agree to our{' '}
              <Link href="#" style={{ color: 'var(--text-2)', textDecoration: 'underline' }}>Terms</Link>
              {' '}and{' '}
              <Link href="#" style={{ color: 'var(--text-2)', textDecoration: 'underline' }}>Privacy Policy</Link>.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
