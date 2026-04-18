'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const API = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001').replace(/\/$/, '')

export default function StartFixButton({
  org,
  repo,
  issueNumber,
}: {
  org: string
  repo: string
  issueNumber: number
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/sessions`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ org, repo, issueNumber }),
      })
      if (!res.ok) return
      const { sessionId } = await res.json()
      router.push(`/editor?sessionId=${sessionId}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      className="btn btn-blue"
      style={{ padding: '0.35rem 0.875rem', fontSize: '0.78rem' }}
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? '…' : 'Start Fix'}
    </button>
  )
}
