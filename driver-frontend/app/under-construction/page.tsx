export default function UnderConstruction() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-0)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '3rem' }}>
        <div
          style={{
            width: 36,
            height: 36,
            background: 'var(--blue)',
            borderRadius: 9,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              color: '#fff',
              fontWeight: 800,
              fontSize: 18,
              fontFamily: 'var(--font-display)',
              letterSpacing: '-0.02em',
            }}
          >
            D
          </span>
        </div>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 22,
            color: 'var(--text-1)',
            letterSpacing: '-0.01em',
          }}
        >
          Driver
        </span>
      </div>

      {/* Icon */}
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 20,
          background: 'var(--bg-2)',
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '2rem',
        }}
      >
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path
            d="M16 4L28 28H4L16 4Z"
            stroke="var(--blue)"
            strokeWidth="1.8"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M16 13v6M16 22v1.5"
            stroke="var(--blue)"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Heading */}
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: 'clamp(2rem, 5vw, 3rem)',
          color: 'var(--text-1)',
          letterSpacing: '-0.025em',
          lineHeight: 1.1,
          marginBottom: '1rem',
          maxWidth: 560,
        }}
      >
        We&apos;re building something great.
      </h1>

      {/* Subheadline */}
      <p
        style={{
          fontSize: '1rem',
          color: 'var(--text-2)',
          lineHeight: 1.65,
          maxWidth: 420,
          marginBottom: '2.5rem',
        }}
      >
        Driver is currently undergoing maintenance. We&apos;ll be back shortly — check back in a bit.
      </p>

      {/* Status badge */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.4rem 1rem',
          borderRadius: 999,
          background: 'var(--yellow-bg)',
          border: '1px solid rgba(180, 83, 9, 0.2)',
          fontSize: '0.8rem',
          fontWeight: 600,
          color: 'var(--yellow)',
          fontFamily: 'var(--font-display)',
          letterSpacing: '0.04em',
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'var(--yellow)',
            display: 'inline-block',
            animation: 'pulse 2s ease-in-out infinite',
          }}
        />
        UNDER MAINTENANCE
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  )
}
