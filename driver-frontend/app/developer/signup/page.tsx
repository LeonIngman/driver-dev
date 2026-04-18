'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

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

type TopEarner = {
  username: string
  initials: string
  fixesCount: number
  earned: string
}

export default function DeveloperSignup() {
  const [topEarner, setTopEarner] = useState<TopEarner | null>(null)

  useEffect(() => {
    fetch(`${API}/developers/leaderboard/week`)
      .then(r => r.ok ? r.json() : null)
      .then(data => data && setTopEarner(data))
      .catch(() => {})
  }, [])

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
              'Browse open issues from top companies',
              'Fix with Claude — you control your tokens',
              'Company sees a live preview before accepting',
              'Get paid when your PR is approved',
            ].map(text => (
              <div key={text} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
                <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'var(--blue-bg)', border: '1px solid rgba(96,165,250,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1, flexShrink: 0 }}>
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M1.5 4L3.2 5.8L6.5 2.2" stroke="var(--blue)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span style={{ fontSize: '0.825rem', color: 'var(--text-2)', lineHeight: 1.4 }}>{text}</span>
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
            <p style={{ color: 'var(--text-2)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
              Already have an account?{' '}
              <Link href="/developer/signin" style={{ color: 'var(--blue)', textDecoration: 'none' }}>Sign in</Link>
            </p>
          </div>

          <button type="button" className="oauth-btn" onClick={() => { window.location.href = `${API}/auth/github?role=developer` }}>
            <GithubIcon />
            <span>Continue with GitHub</span>
          </button>

          <p style={{ marginTop: '1.25rem', color: 'var(--text-2)', fontSize: '0.875rem' }}>
            Signing up as a company?{' '}
            <Link href="/company/signup" style={{ color: 'var(--blue)', textDecoration: 'none' }}>Company sign up</Link>
          </p>

          <p style={{ marginTop: '0.375rem', fontSize: '0.72rem', color: 'var(--text-3)', lineHeight: 1.5 }}>
            By signing up you agree to our{' '}
            <Link href="#" style={{ color: 'var(--text-2)', textDecoration: 'underline' }}>Terms</Link>
            {' '}and{' '}
            <Link href="#" style={{ color: 'var(--text-2)', textDecoration: 'underline' }}>Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
