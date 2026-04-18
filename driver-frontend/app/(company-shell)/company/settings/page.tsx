'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const API = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001').replace(/\/$/, '')

export default function CompanySettings() {
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)

  async function handleSignOut() {
    setSigningOut(true)
    try {
      await fetch(`${API}/companies/signout`, {
        method: 'POST',
        credentials: 'include',
      })
    } finally {
      router.push('/company/signup')
    }
  }

  return (
    <div className="main-content">

      {/* Topbar */}
      <div className="topbar">
        <div style={{ flex: 1 }}>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.78rem', color: 'var(--text-3)' }}>
            <span>Company</span>
            <span>/</span>
            <span style={{ color: 'var(--text-1)' }}>Settings</span>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '1.75rem 2rem', flex: 1 }}>
        <div className="anim-fade-up" style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: 'var(--text-1)', marginBottom: '0.25rem' }}>
            Settings
          </h1>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-2)' }}>Manage your organisation account.</p>
        </div>

        {/* Sign out */}
        <div className="anim-fade-up d2 card" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-1)', marginBottom: '0.2rem' }}>Sign out</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>You will be redirected to the sign-in page.</div>
          </div>
          <button
            className="btn"
            style={{ padding: '0.4rem 1rem', fontSize: '0.82rem', color: 'var(--red, #e55)', border: '1px solid var(--red, #e55)', opacity: signingOut ? 0.5 : 1 }}
            onClick={handleSignOut}
            disabled={signingOut}
          >
            {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </div>
    </div>
  )
}
