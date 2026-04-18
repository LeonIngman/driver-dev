'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL

const AnthropicIcon = () => (
  <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
    <rect width="32" height="32" rx="8" fill="#CC785C"/>
    <path d="M19.2 8h-3.2L10 24h3.2l1.4-3.6h5.6l1.4 3.6H24L19.2 8zm-3.6 9.8 1.9-4.9 1.9 4.9h-3.8z" fill="white"/>
  </svg>
)

function OnboardingForm() {
  const router = useRouter()
  const params = useSearchParams()
  const developerId = params.get('id')

  const [apiKey, setApiKey] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!developerId) return
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API}/developers/${developerId}/api-key`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anthropicApiKey: apiKey }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.message ?? 'Something went wrong.')
        return
      }
      router.push('/developer/repos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-0)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '2.5rem' }}>
          <div style={{ width: 28, height: 28, background: 'var(--blue)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: 14, fontFamily: 'var(--font-display)' }}>D</span>
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: 'var(--text-1)' }}>Driver</span>
        </div>

        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.5rem', color: 'var(--text-1)', marginBottom: '0.375rem' }}>
          One last step
        </h2>
        <p style={{ color: 'var(--text-2)', fontSize: '0.875rem', marginBottom: '2rem' }}>
          Driver uses your own Anthropic API key to run Claude — you only pay for what you use.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 10, padding: '1rem 1.125rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.875rem' }}>
              <AnthropicIcon />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-1)', marginBottom: '0.25rem' }}>Your Anthropic API key</div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-2)', lineHeight: 1.5 }}>
                  Your key is stored securely and never shared with companies or other developers.
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
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              required
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', letterSpacing: '0.03em' }}
            />
            <p style={{ marginTop: '0.375rem', fontSize: '0.7rem', color: 'var(--text-3)' }}>
              Find your key at <span style={{ color: 'var(--blue)' }}>console.anthropic.com</span>
            </p>
          </div>

          {error && (
            <p style={{ fontSize: '0.8rem', color: '#f87171', margin: 0 }}>{error}</p>
          )}

          <button type="submit" className="btn btn-blue" disabled={loading} style={{ width: '100%', padding: '0.75rem' }}>
            {loading ? 'Saving…' : 'Start fixing issues'}
            {!loading && (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2.5 7h9M7.5 3.5L11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function DeveloperOnboarding() {
  return (
    <Suspense>
      <OnboardingForm />
    </Suspense>
  )
}
