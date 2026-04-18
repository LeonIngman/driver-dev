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

const CheckMark = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
    <circle cx="7" cy="7" r="6.5" fill="var(--green-bg)" stroke="rgba(52,211,153,0.3)"/>
    <path d="M4 7l2.2 2.4L10 4.5" stroke="#34D399" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const ArrowRight = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
    <path d="M2.5 7h9M7.5 3.5L11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

/* ── Section: Navbar ─────────────────────────────── */
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
      <Logo />

      {/* Nav links */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginLeft: '3rem', flex: 1 }}>
        {[
          { label: 'How it works', href: '#how' },
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

      {/* Audience CTAs */}
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

/* ── Section: Hero ───────────────────────────────── */
function Hero() {
  return (
    <section
      className="grid-pattern"
      style={{
        position: 'relative',
        padding: '4rem 2.5rem 3.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Radial glow blobs */}
      <div style={{ position: 'absolute', top: '-120px', left: '50%', transform: 'translateX(-50%)', width: 700, height: 500, borderRadius: '50%', background: 'radial-gradient(ellipse, var(--blue-bg) 0%, transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 0, left: '15%', width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle, var(--orange-bg) 0%, transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 0, right: '12%', width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, var(--orange-bg) 0%, transparent 65%)', pointerEvents: 'none' }} />

      {/* Eyebrow */}
      <div className="anim-fade-up" style={{ marginBottom: '1rem' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.3rem 0.875rem', borderRadius: 999,
          background: 'var(--blue-bg)', border: '1px solid var(--blue-border)',
          fontSize: '0.78rem', fontWeight: 600, color: 'var(--blue)',
          fontFamily: 'var(--font-display)', letterSpacing: '0.04em',
        }}>
          <span className="live-dot" style={{ width: 6, height: 6 }} />
          Open beta — join the waitlist
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
          maxWidth: 700,
          marginBottom: '1.125rem',
          letterSpacing: '-0.025em',
        }}
      >
        Companies post issues.{' '}
        <span style={{
          background: 'linear-gradient(135deg, var(--blue) 0%, var(--blue-light) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          Developers fix them
        </span>{' '}
        with Claude.
      </h1>

      {/* Subheadline */}
      <p
        className="anim-fade-up d3"
        style={{
          fontSize: '1rem',
          color: 'var(--text-2)',
          lineHeight: 1.6,
          maxWidth: 480,
          marginBottom: '1.75rem',
        }}
      >
        Driver is the bounty marketplace where engineering teams unlock their backlog — and developers earn real money solving real problems, powered by AI.
      </p>

      {/* Dual CTA */}
      <div className="anim-fade-up d4" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '2.25rem' }}>
        <Link
          href="/company/signup"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            background: 'var(--orange)', color: '#fff',
            fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.9rem',
            borderRadius: 9, textDecoration: 'none',
            border: '1px solid transparent',
            boxShadow: '0 0 0 0 var(--orange)',
            transition: 'all 0.15s ease',
          }}
        >
          Post your first issue
          <ArrowRight size={16} />
        </Link>
        <Link
          href="/developer/signup"
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
          Browse open issues
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* Social proof strip */}
      <div
        className="anim-fade-up d5"
        style={{
          display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center',
          fontSize: '0.8rem', color: 'var(--text-3)',
        }}
      >
        <span>Trusted by teams at</span>
        {['Vercel', 'Stripe', 'Linear', 'Supabase', 'Resend'].map(co => (
          <span key={co} style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-2)', fontSize: '0.875rem' }}>{co}</span>
        ))}
      </div>
    </section>
  )
}

/* ── Section: Stats bar ──────────────────────────── */
function StatsBar() {
  const stats = [
    { value: '$2.4M', label: 'Paid to developers', color: 'var(--green)' },
    { value: '3,800+', label: 'Issues resolved', color: 'var(--blue)' },
    { value: '420', label: 'Active developers', color: 'var(--orange)' },
    { value: '98%', label: 'Approval rate', color: 'var(--text-1)' },
  ]
  return (
    <div style={{
      background: 'var(--bg-1)',
      borderTop: '1px solid var(--border)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      justifyContent: 'center',
    }}>
      <div style={{ display: 'flex', maxWidth: 900, width: '100%' }}>
        {stats.map((s, i) => (
          <div
            key={s.label}
            style={{
              flex: 1,
              padding: '1.75rem 2rem',
              textAlign: 'center',
              borderRight: i < stats.length - 1 ? '1px solid var(--border)' : 'none',
            }}
          >
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '2rem', color: s.color, marginBottom: '0.25rem', letterSpacing: '-0.02em' }}>{s.value}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Section: How it works ───────────────────────── */
function HowItWorks() {
  return (
    <section id="how" style={{ padding: '6rem 2.5rem', maxWidth: 1100, margin: '0 auto', width: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <div className="anim-fade-up" style={{ display: 'inline-block', marginBottom: '1rem' }}>
          <span className="badge badge-muted" style={{ fontSize: '0.7rem', letterSpacing: '0.08em' }}>HOW IT WORKS</span>
        </div>
        <h2
          className="anim-fade-up d2"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(1.875rem, 3.5vw, 2.75rem)', color: 'var(--text-1)', letterSpacing: '-0.02em', maxWidth: 600, margin: '0 auto 1rem' }}
        >
          Two sides. One marketplace.
        </h2>
        <p className="anim-fade-up d3" style={{ fontSize: '1rem', color: 'var(--text-2)', lineHeight: 1.6, maxWidth: 440, margin: '0 auto' }}>
          Driver connects the companies who have issues with the developers who can fix them — with Claude as the engine.
        </p>
      </div>

      {/* Two-column split */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

        {/* Company side */}
        <div
          className="anim-fade-up d3"
          style={{
            background: 'var(--bg-2)',
            border: '1px solid var(--orange-border)',
            borderRadius: 16,
            padding: '2.25rem',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', top: 0, right: 0, width: 200, height: 200, background: 'radial-gradient(circle at top right, rgba(249,115,22,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ marginBottom: '1.5rem' }}>
            <span className="badge badge-orange" style={{ fontSize: '0.68rem' }}>For Companies</span>
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: 'var(--text-1)', marginBottom: '0.75rem', letterSpacing: '-0.015em' }}>
            Clear your backlog.<br />Pay only for results.
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-2)', lineHeight: 1.65, marginBottom: '1.75rem' }}>
            Connect a repository, assign a salary to your open GitHub issues, and let the Driver community tackle them. Every proposed fix is reviewed and approved before a single line of code is merged.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '2rem' }}>
            {[
              'Connect your GitHub repo in minutes',
              'Set a bounty salary per issue',
              'Review every proposed fix before merge',
              'Pay only when a fix is accepted',
            ].map(pt => (
              <div key={pt} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <CheckMark />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-2)' }}>{pt}</span>
              </div>
            ))}
          </div>
          <Link
            href="/company/signup"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.7rem 1.25rem',
              background: 'var(--orange)', color: '#fff',
              fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.875rem',
              borderRadius: 8, textDecoration: 'none',
            }}
          >
            Get started as a company
            <ArrowRight />
          </Link>
        </div>

        {/* Developer side */}
        <div
          className="anim-fade-up d4"
          style={{
            background: 'var(--bg-2)',
            border: '1px solid var(--blue-border)',
            borderRadius: 16,
            padding: '2.25rem',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', top: 0, right: 0, width: 200, height: 200, background: 'radial-gradient(circle at top right, var(--blue-bg) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ marginBottom: '1.5rem' }}>
            <span className="badge badge-blue" style={{ fontSize: '0.68rem' }}>For Developers</span>
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: 'var(--text-1)', marginBottom: '0.75rem', letterSpacing: '-0.015em' }}>
            Browse issues.<br />Fix with Claude. Earn.
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-2)', lineHeight: 1.65, marginBottom: '1.75rem' }}>
            Browse a curated marketplace of real engineering issues from top companies. Use your Anthropic API key to fix them inside Driver&apos;s embedded editor — and get paid when the company approves.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '2rem' }}>
            {[
              'Browse hundreds of paid issues by language',
              'Fix with Claude — you use your own tokens',
              'Submit a live preview, not just a PR',
              'Get paid within 48 hours of approval',
            ].map(pt => (
              <div key={pt} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <CheckMark />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-2)' }}>{pt}</span>
              </div>
            ))}
          </div>
          <Link
            href="/developer/signup"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.7rem 1.25rem',
              background: 'var(--blue)', color: '#fff',
              fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.875rem',
              borderRadius: 8, textDecoration: 'none',
            }}
          >
            Start earning as a developer
            <ArrowRight />
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ── Section: Flow steps ─────────────────────────── */
function FlowSteps() {
  const steps = [
    { n: '01', title: 'Company connects a repo', body: 'Link your GitHub organization in one click. Driver reads your open issues and lets you assign a salary to each one.', accent: 'var(--orange)' },
    { n: '02', title: 'Developers claim issues', body: 'Any registered developer can browse the marketplace, choose an issue that matches their skill set, and claim it.', accent: 'var(--blue)' },
    { n: '03', title: 'Claude assists the fix', body: 'Inside Driver\'s editor, Claude reads the codebase, understands the issue, and helps write the fix — using the developer\'s API key.', accent: '#6639BA' },
    { n: '04', title: 'Company reviews & pays', body: 'The company sees a live diff and preview. One click to approve merges the PR and releases the payment to the developer.', accent: 'var(--green)' },
  ]

  return (
    <section style={{ padding: '0 2.5rem 6rem', maxWidth: 1100, margin: '0 auto', width: '100%' }}>
      <div
        style={{
          background: 'var(--bg-1)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: '3rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '0',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Connector line */}
        <div style={{ position: 'absolute', top: '3.875rem', left: '12.5%', right: '12.5%', height: 1, background: 'var(--border)', zIndex: 0 }} />

        {steps.map((step, i) => (
          <div
            key={step.n}
            className={`anim-fade-up d${i + 2}`}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              padding: '0 1.5rem',
              borderRight: i < steps.length - 1 ? '1px solid var(--border)' : 'none',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {/* Step number bubble */}
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'var(--bg-2)',
                border: `1px solid ${step.accent}44`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
                boxShadow: `0 0 20px ${step.accent}22`,
              }}
            >
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.875rem', color: step.accent }}>{step.n}</span>
            </div>
            <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.925rem', color: 'var(--text-1)', marginBottom: '0.625rem', lineHeight: 1.3 }}>{step.title}</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-3)', lineHeight: 1.6 }}>{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ── Section: Featured repos preview ─────────────── */
function FeaturedRepos() {
  const previews = [
    { org: 'Vercel', initial: 'V', color: '#FFFFFF', repo: 'next.js', issues: 18, value: '$7,420', lang: 'TypeScript', langCls: 'lang-ts' },
    { org: 'Stripe', initial: 'S', color: '#635BFF', repo: 'stripe-node', issues: 15, value: '$9,750', lang: 'TypeScript', langCls: 'lang-ts' },
    { org: 'Supabase', initial: 'S', color: '#3ECF8E', repo: 'supabase-js', issues: 22, value: '$8,800', lang: 'TypeScript', langCls: 'lang-ts' },
    { org: 'Anthropic', initial: 'A', color: '#CC785C', repo: 'claude-tools', issues: 12, value: '$4,850', lang: 'TypeScript', langCls: 'lang-ts' },
  ]

  return (
    <section style={{ padding: '0 2.5rem 6rem', maxWidth: 1100, margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <div className="anim-fade-up" style={{ marginBottom: '0.75rem' }}>
            <span className="badge badge-muted" style={{ fontSize: '0.7rem', letterSpacing: '0.08em' }}>MARKETPLACE PREVIEW</span>
          </div>
          <h2
            className="anim-fade-up d2"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', color: 'var(--text-1)', letterSpacing: '-0.02em' }}
          >
            Issues live right now
          </h2>
        </div>
        <Link
          href="/repos"
          className="anim-fade-up d3"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            fontSize: '0.825rem', fontWeight: 600, color: 'var(--blue)',
            textDecoration: 'none', border: '1px solid var(--blue-border)',
            background: 'var(--blue-bg)', borderRadius: 7, padding: '0.5rem 1rem',
          }}
        >
          Browse all repos
          <ArrowRight size={13} />
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.875rem' }}>
        {previews.map((r, i) => (
          <Link
            key={r.repo}
            href="/repos"
            className={`card card-hover anim-fade-up d${i + 2}`}
            style={{ display: 'block', padding: '1.25rem', textDecoration: 'none' }}
          >
            {/* Org header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
              <div style={{ width: 32, height: 32, borderRadius: 7, background: r.color + '18', border: `1px solid ${r.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.8rem', color: r.color }}>{r.initial}</span>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>{r.org}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-1)' }}>{r.repo}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.75rem' }}>
              <span className={`lang-dot ${r.langCls}`} />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>{r.lang}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.125rem', color: 'var(--blue)' }}>{r.issues}</div>
                <div style={{ fontSize: '0.67rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>open issues</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.125rem', color: 'var(--green)' }}>{r.value}</div>
                <div style={{ fontSize: '0.67rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>total value</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

/* ── Section: Bottom CTA ─────────────────────────── */
function BottomCTA() {
  return (
    <section style={{ padding: '0 2.5rem 7rem', maxWidth: 1100, margin: '0 auto', width: '100%' }}>
      <div
        style={{
          background: 'var(--bg-1)',
          border: '1px solid var(--border)',
          borderRadius: 20,
          padding: '4rem',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '3rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* bg decoration */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)', backgroundSize: '48px 48px', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '-80px', left: '50%', transform: 'translateX(-50%)', width: 600, height: 300, borderRadius: '50%', background: 'radial-gradient(ellipse, var(--blue-bg) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Company CTA */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.25rem', padding: '0.3rem 0.75rem', borderRadius: 6, background: 'var(--orange-bg)', border: '1px solid var(--orange-border)' }}>
            <span className="badge badge-orange" style={{ fontSize: '0.62rem', background: 'none', border: 'none', padding: 0 }}>FOR COMPANIES</span>
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.875rem', color: 'var(--text-1)', marginBottom: '0.875rem', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
            Ship the backlog.<br />Not the headcount.
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-2)', lineHeight: 1.65, marginBottom: '2rem', maxWidth: 360 }}>
            Stop letting good issues rot in your tracker. Connect your repo and turn your backlog into a paid opportunity for the best developers in the world.
          </p>
          <Link
            href="/company/signup"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.8rem 1.5rem',
              background: 'var(--orange)', color: '#fff',
              fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.9rem',
              borderRadius: 9, textDecoration: 'none',
            }}
          >
            Start for free
            <ArrowRight />
          </Link>
          <p style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-3)' }}>No upfront cost — pay only when fixes ship.</p>
        </div>

        {/* Developer CTA */}
        <div style={{ position: 'relative', zIndex: 1, borderLeft: '1px solid var(--border)', paddingLeft: '3rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.25rem', padding: '0.3rem 0.75rem', borderRadius: 6, background: 'var(--blue-bg)', border: '1px solid var(--blue-border)' }}>
            <span className="badge badge-blue" style={{ fontSize: '0.62rem', background: 'none', border: 'none', padding: 0 }}>FOR DEVELOPERS</span>
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.875rem', color: 'var(--text-1)', marginBottom: '0.875rem', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
            Turn Claude sessions<br />into paychecks.
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-2)', lineHeight: 1.65, marginBottom: '2rem', maxWidth: 360 }}>
            You already use Claude to code. Now get paid for it. Browse issues across top open-source repos, fix them in our embedded editor, and collect your salary.
          </p>
          <Link
            href="/developer/signup"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.8rem 1.5rem',
              background: 'var(--blue)', color: '#fff',
              fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.9rem',
              borderRadius: 9, textDecoration: 'none',
            }}
          >
            Create free account
            <ArrowRight />
          </Link>
          <p style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-3)' }}>Avg. $380 per accepted fix · Paid within 48h.</p>
        </div>
      </div>
    </section>
  )
}

/* ── Section: Footer ─────────────────────────────── */
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
export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-0)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Hero />
        <StatsBar />
        <HowItWorks />
        <FlowSteps />
        <FeaturedRepos />
        <BottomCTA />
      </main>
      <Footer />
    </div>
  )
}
