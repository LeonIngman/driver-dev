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

type LineProps = { n: number; hl?: boolean; children?: React.ReactNode }

function L({ n, hl, children }: LineProps) {
  return (
    <div style={{
      display: 'flex',
      minHeight: '1.65em',
      background: hl ? 'rgba(4, 120, 87, 0.07)' : 'transparent',
      borderLeft: hl ? '2px solid var(--green)' : '2px solid transparent',
    }}>
      <span style={{
        color: 'var(--text-3)',
        width: '2.25rem',
        minWidth: '2.25rem',
        textAlign: 'right',
        paddingRight: '0.75rem',
        userSelect: 'none',
        fontSize: '0.72rem',
        lineHeight: '1.65em',
        fontFamily: 'var(--font-mono)',
      }}>
        {n}
      </span>
      <span style={{ whiteSpace: 'pre', lineHeight: '1.65em', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
        {children ?? ''}
      </span>
    </div>
  )
}

const K = ({ v }: { v: string }) => <span className="syn-kw">{v}</span>
const F = ({ v }: { v: string }) => <span className="syn-fn">{v}</span>
const S = ({ v }: { v: string }) => <span className="syn-str">{v}</span>
const T = ({ v }: { v: string }) => <span className="syn-type">{v}</span>
const N = ({ v }: { v: string }) => <span className="syn-num">{v}</span>
const C = ({ v }: { v: string }) => <span className="syn-cmt">{v}</span>

export default function DeveloperSignin() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-0)' }}>

      {/* Left panel — code editor */}
      <div style={{
        width: '56%',
        background: 'var(--bg-1)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>

        {/* Editor chrome */}
        <div style={{
          height: 44,
          background: 'var(--bg-2)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 1rem',
          gap: '0.5rem',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {['#E05D44', '#F4A51D', '#57B347'].map((c, i) => (
              <div key={i} style={{ width: 11, height: 11, borderRadius: '50%', background: c, opacity: 0.7 }} />
            ))}
          </div>
          <span style={{ flex: 1, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-3)' }}>
            lib/auth.ts — Driver
          </span>
        </div>

        {/* Tab bar */}
        <div style={{
          height: 36,
          background: 'var(--bg-2)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'flex-end',
          flexShrink: 0,
        }}>
          <div style={{
            padding: '0 1.25rem',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg-1)',
            borderRight: '1px solid var(--border)',
            borderTop: '1px solid var(--blue)',
            gap: '0.5rem',
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.5 }}>
              <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9l-7-7z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              <path d="M13 2v7h7" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            </svg>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-1)' }}>auth.ts</span>
          </div>
          <div style={{
            padding: '0 1.25rem',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            opacity: 0.45,
          }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-2)' }}>middleware.ts</span>
          </div>
          <div style={{
            padding: '0 1.25rem',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            opacity: 0.45,
          }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-2)' }}>useEarnings.ts</span>
          </div>
        </div>

        {/* Code */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 0', paddingLeft: '0.5rem' }}>
          <L n={1}><C v="// lib/auth.ts" /></L>
          <L n={2} />
          <L n={3}><K v="import type" /> {'{ '}<T v="User" />{', '}<T v="Session" />{' } '}<K v="from" />{' '}<S v="'@/types'" /></L>
          <L n={4} />
          <L n={5}><K v="const" /> API = process.env.NEXT_PUBLIC_API_URL</L>
          <L n={6} />
          <L n={7}><K v="export async function" /> <F v="getUser" />(</L>
          <L n={8}>{'  '}token<span className="syn-punc">:</span> <T v="string" /></L>
          <L n={9}>)<span className="syn-punc">:</span> <T v="Promise" />{'<'}<T v="User" />{' | null> {'}</L>
          <L n={10} hl>{'  '}<K v="const" /> res = <K v="await" /> <F v="fetch" />(API + <S v="'/auth/me'" />, {'{'}</L>
          <L n={11} hl>{'    '}headers<span className="syn-punc">:</span> {'{ '}Authorization<span className="syn-punc">:</span> <S v="'Bearer '" /> + token {'},'}</L>
          <L n={12} hl>{'    '}cache<span className="syn-punc">:</span> <S v="'no-store'" /><span className="syn-punc">,</span></L>
          <L n={13} hl>{'  '}{'})'}</L>
          <L n={14} />
          <L n={15}>{'  '}<K v="if" /> (!res.ok) <K v="return" /> <N v="null" /></L>
          <L n={16}>{'  '}<K v="return" /> res.<F v="json" />() <K v="as" /> <T v="Promise" />{'<'}<T v="User" />{'>'}</L>
          <L n={17}>{'}'}</L>
          <L n={18} />
          <L n={19}><K v="export function" /> <F v="parseToken" />(raw<span className="syn-punc">:</span> <T v="string" />) {'{'}</L>
          <L n={20}>{'  '}<K v="return" /> raw.<F v="startsWith" />(<S v="'Bearer '" />)</L>
          <L n={21}>{'    ? '}raw.<F v="slice" />(<N v="7" />) <span className="syn-punc">:</span> raw</L>
          <L n={22}>{'}'}</L>
          <L n={23} />
          <L n={24}><K v="export async function" /> <F v="getSession" />(</L>
          <L n={25}>{'  '}token<span className="syn-punc">:</span> <T v="string" /></L>
          <L n={26}>)<span className="syn-punc">:</span> <T v="Promise" />{'<'}<T v="Session" />{' | null> {'}</L>
          <L n={27}>{'  '}<K v="const" /> user = <K v="await" /> <F v="getUser" />(token)</L>
          <L n={28}>{'  '}<K v="if" /> (!user) <K v="return" /> <N v="null" /></L>
          <L n={29}>{'  '}<K v="return" /> {'{'} user<span className="syn-punc">,</span> token {'}'}</L>
          <L n={30}>{'}'}</L>
        </div>

        {/* Status bar */}
        <div style={{
          height: 24,
          background: 'var(--bg-3)',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 1rem',
          gap: '1.5rem',
          flexShrink: 0,
        }}>
          {[
            { dot: 'var(--green)', label: '0 errors' },
            { dot: 'var(--yellow)', label: '1 warning' },
          ].map(({ dot, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: dot }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-3)' }}>{label}</span>
            </div>
          ))}
          <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-3)' }}>TypeScript · UTF-8</span>
        </div>
      </div>

      {/* Right panel — sign in */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '2rem 2.5rem' }}>
        <Logo />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 380, margin: '0 auto', width: '100%' }}>

          {/* Badge */}
          <div className="anim-fade-up" style={{ marginBottom: '1.25rem' }}>
            <span className="badge badge-blue">Developer</span>
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
            Pick up where you left off — your open issues and pending earnings are waiting.
          </p>

          {/* Pending earnings hint */}
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
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', flexShrink: 0 }} className="live-dot" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-2)' }}>
              Developers earned{' '}
              <span style={{ color: 'var(--green)', fontWeight: 600 }}>$12,480</span>
              {' '}on Driver this week
            </span>
          </div>

          <div className="anim-fade-up d4">
            <button
              type="button"
              className="oauth-btn"
              onClick={() => { window.location.href = `${API}/auth/github?role=developer` }}
            >
              <GithubIcon />
              <span>Continue with GitHub</span>
            </button>
          </div>

          <div className="anim-fade-up d5" style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <p style={{ color: 'var(--text-2)', fontSize: '0.875rem' }}>
              No account yet?{' '}
              <Link href="/developer/signup" style={{ color: 'var(--blue)', textDecoration: 'none', fontWeight: 500 }}>Create one</Link>
            </p>
            <p style={{ color: 'var(--text-2)', fontSize: '0.875rem' }}>
              Signing in as a company?{' '}
              <Link href="/company/signin" style={{ color: 'var(--blue)', textDecoration: 'none', fontWeight: 500 }}>Company sign in</Link>
            </p>
          </div>

          <p className="anim-fade-up d6" style={{ marginTop: '1.5rem', fontSize: '0.7rem', color: 'var(--text-3)', lineHeight: 1.5 }}>
            By signing in you agree to our{' '}
            <Link href="#" style={{ color: 'var(--text-2)', textDecoration: 'underline' }}>Terms</Link>
            {' '}and{' '}
            <Link href="#" style={{ color: 'var(--text-2)', textDecoration: 'underline' }}>Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
