import Link from 'next/link'

/* ── Shared primitives ───────────────────────────── */
const Logo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <div style={{ width: 32, height: 32, background: 'var(--blue)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: '#fff', fontWeight: 800, fontSize: 16, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>D</span>
    </div>
    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: 'var(--text-1)', letterSpacing: '-0.01em' }}>Driver</span>
  </div>
)

const ArrowRight = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
    <path d="M2.5 7h9M7.5 3.5L11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const ArrowLeft = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
    <path d="M11.5 7h-9M6.5 3.5L3 7l3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

/* ── Navbar ──────────────────────────────────────── */
function Navbar() {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'rgba(245,239,230,0.88)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      padding: '0.75rem 2.5rem',
    }}>
      <Link href="/" style={{ textDecoration: 'none' }}>
        <Logo />
      </Link>

      <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginLeft: '3rem', flex: 1 }}>
        {[
          { label: 'How it works', href: '#how' },
          { label: 'Pricing', href: '#pricing' },
          { label: 'Docs', href: '#docs' },
        ].map(link => (
          <a
            key={link.label}
            href={link.href}
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.875rem', color: 'var(--text-2)', textDecoration: 'none', borderRadius: 6, transition: 'color 0.12s ease' }}
          >
            {link.label}
          </a>
        ))}
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Link
          href="/company/signup"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.45rem 1rem', fontSize: '0.825rem', fontWeight: 600,
            color: 'var(--orange)', background: 'var(--orange-bg)',
            border: '1px solid var(--orange-border)', borderRadius: 7,
            textDecoration: 'none', transition: 'all 0.12s ease',
            fontFamily: 'var(--font-body)',
          }}
        >
          For Companies
        </Link>
        <Link
          href="/developer/signup"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.45rem 1rem', fontSize: '0.825rem', fontWeight: 600,
            color: '#fff', background: 'var(--blue)',
            border: '1px solid transparent', borderRadius: 7,
            textDecoration: 'none', transition: 'all 0.12s ease',
            fontFamily: 'var(--font-body)',
          }}
        >
          For Developers
        </Link>
      </div>
    </header>
  )
}

/* ── Footer ──────────────────────────────────────── */
function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      background: 'var(--bg-1)',
      padding: '2.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '1rem',
    }}>
      <Logo />
      <div style={{ display: 'flex', gap: '2rem' }}>
        {['Privacy', 'Terms', 'Docs', 'GitHub'].map(link => (
          <a
            key={link}
            href="#"
            style={{ fontSize: '0.825rem', color: 'var(--text-3)', textDecoration: 'none', transition: 'color 0.1s' }}
          >
            {link}
          </a>
        ))}
      </div>
      <p style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>© 2025 Driver Technologies, Inc.</p>
    </footer>
  )
}

/* ── Page ────────────────────────────────────────── */
export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-0)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <section
          className="grid-pattern"
          style={{
            position: 'relative',
            width: '100%',
            padding: '6rem 2.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            overflow: 'hidden',
          }}
        >
          {/* Radial glow blobs */}
          <div style={{ position: 'absolute', top: '-80px', left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, borderRadius: '50%', background: 'radial-gradient(ellipse, var(--blue-bg) 0%, transparent 65%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: 0, left: '20%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, var(--orange-bg) 0%, transparent 65%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: 0, right: '18%', width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, var(--orange-bg) 0%, transparent 65%)', pointerEvents: 'none' }} />

          {/* Mono eyebrow */}
          <div className="anim-fade-up" style={{ marginBottom: '1.25rem' }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              color: 'var(--text-3)',
              letterSpacing: '0.06em',
            }}>
              404
            </span>
          </div>

          {/* Headline */}
          <h1
            className="anim-fade-up d2"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 'clamp(2.25rem, 4.5vw, 3.5rem)',
              lineHeight: 1.08,
              color: 'var(--text-1)',
              maxWidth: 600,
              marginBottom: '1.125rem',
              letterSpacing: '-0.025em',
            }}
          >
            This page doesn&apos;t exist.
          </h1>

          {/* Subheadline */}
          <p
            className="anim-fade-up d3"
            style={{
              fontSize: '1rem',
              color: 'var(--text-2)',
              lineHeight: 1.6,
              maxWidth: 440,
              marginBottom: '2rem',
            }}
          >
            The route you followed doesn&apos;t map to anything in Driver. Check the URL or head back somewhere useful.
          </p>

          {/* Terminal card */}
          <div
            className="anim-fade-up d4"
            style={{
              background: 'var(--bg-1)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              padding: '0.625rem 1.125rem',
              marginBottom: '2rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-3)' }}>
              GET /this-route
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-3)' }}>→</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#B91C1C', fontWeight: 500 }}>
              404 Not Found
            </span>
          </div>

          {/* CTAs */}
          <div className="anim-fade-up d5" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link
              href="/"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: 'var(--blue)', color: '#fff',
                fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.9rem',
                borderRadius: 9, textDecoration: 'none',
                border: '1px solid transparent',
                transition: 'all 0.15s ease',
              }}
            >
              <ArrowLeft size={16} />
              Go home
            </Link>
            <Link
              href="/developer/repos"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: 'transparent', color: 'var(--text-1)',
                fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.9rem',
                borderRadius: 9, textDecoration: 'none',
                border: '1px solid var(--border-light)',
                transition: 'all 0.15s ease',
              }}
            >
              Browse repos
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
