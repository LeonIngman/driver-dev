'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

const Logo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <div style={{ width: 28, height: 28, background: 'var(--blue)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: '#fff', fontWeight: 800, fontSize: 14, fontFamily: 'var(--font-display)' }}>D</span>
    </div>
    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: 'var(--text-1)' }}>Driver</span>
  </div>
)

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M2 6l2.8 3L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const Spinner = () => (
  <div style={{ width: 16, height: 16, border: '2px solid var(--border)', borderTopColor: 'var(--blue)', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
)

type GitHubIssue = {
  number: number
  title: string
  repo: string
  labels: string[]
  created_at: string
  html_url: string
}

type SelectedIssue = {
  number: number
  repo: string
  salary: string
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  return `${weeks}w ago`
}

const labelConfig: Record<string, string> = {
  bug: 'badge-red',
  enhancement: 'badge-blue',
  feature: 'badge-blue',
  documentation: 'badge-muted',
  'good first issue': 'badge-green',
  'help wanted': 'badge-orange',
}

export default function ConfigureIssues() {
  const searchParams = useSearchParams()
  const installationId = searchParams.get('installation_id')

  const [issues, setIssues] = useState<GitHubIssue[]>([])
  const [selected, setSelected] = useState<Map<string, SelectedIssue>>(new Map())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [accountLogin, setAccountLogin] = useState<string | null>(null)

  const issueKey = (repo: string, number: number) => `${repo}#${number}`

  useEffect(() => {
    if (!installationId) return

    Promise.all([
      fetch(`${API}/api/issues?installation_id=${installationId}`).then((r) => r.json()),
      fetch(`${API}/api/installations`).then((r) => r.json()),
    ])
      .then(([issueData, installData]) => {
        setIssues(issueData.issues ?? [])
        const inst = (installData.installations ?? []).find(
          (i: { installation_id: number }) => i.installation_id === Number(installationId),
        )
        if (inst) setAccountLogin(inst.account_login)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [installationId])

  const toggleIssue = (issue: GitHubIssue) => {
    const key = issueKey(issue.repo, issue.number)
    setSelected((prev) => {
      const next = new Map(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.set(key, { number: issue.number, repo: issue.repo, salary: '100' })
      }
      return next
    })
  }

  const toggleAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Map())
    } else {
      const next = new Map<string, SelectedIssue>()
      for (const issue of filtered) {
        const key = issueKey(issue.repo, issue.number)
        next.set(key, selected.get(key) ?? { number: issue.number, repo: issue.repo, salary: '100' })
      }
      setSelected(next)
    }
  }

  const setSalary = (repo: string, number: number, salary: string) => {
    const key = issueKey(repo, number)
    setSelected((prev) => {
      const next = new Map(prev)
      const entry = next.get(key)
      if (entry) next.set(key, { ...entry, salary })
      return next
    })
  }

  const handleFinish = async () => {
    if (!installationId || selected.size === 0) return
    setSaving(true)

    const configuredIssues = Array.from(selected.values()).map((s) => {
      const issue = issues.find((i) => i.repo === s.repo && i.number === s.number)!
      return {
        repo_full_name: s.repo,
        issue_number: s.number,
        title: issue.title,
        salary: parseInt(s.salary) || 0,
        labels: issue.labels,
      }
    })

    try {
      await fetch(`${API}/api/issues/configure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ installation_id: Number(installationId), issues: configuredIssues }),
      })
      window.location.href = '/company/issues'
    } catch (err) {
      console.error('Failed to save issues', err)
    } finally {
      setSaving(false)
    }
  }

  const filtered = issues.filter((i) => {
    if (search && !i.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  // Group issues by repo
  const repos = [...new Set(filtered.map((i) => i.repo))]

  const steps = [
    { n: 1, label: 'Create Account', done: true },
    { n: 2, label: 'Connect Repo', done: true },
    { n: 3, label: 'Configure Issues', done: false, active: true },
  ]

  const totalSalary = Array.from(selected.values()).reduce((sum, s) => sum + (parseInt(s.salary) || 0), 0)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-0)', display: 'flex', flexDirection: 'column' }}>

      {/* Top nav */}
      <header style={{ height: 56, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 2rem', background: 'var(--bg-1)' }}>
        <Logo />
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--blue-bg)', border: '1px solid var(--blue-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--blue)' }}>
              {accountLogin ? accountLogin.slice(0, 2).toUpperCase() : 'AC'}
            </span>
          </div>
          <span style={{ fontSize: '0.825rem', color: 'var(--text-2)' }}>{accountLogin ?? 'Your Org'}</span>
        </div>
      </header>

      {/* Body */}
      <div style={{ flex: 1, maxWidth: 760, margin: '0 auto', width: '100%', padding: '3rem 1.5rem' }}>

        {/* Steps */}
        <div className="anim-fade-up" style={{ display: 'flex', alignItems: 'center', gap: '0', marginBottom: '3rem' }}>
          {steps.map((s, i) => (
            <div key={s.n} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : undefined }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem' }}>
                <div className={`step-dot ${s.done ? 'done' : s.active ? 'active' : 'idle'}`}>
                  {s.done ? <CheckIcon /> : s.n}
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: s.active ? 600 : 400, color: s.done ? 'var(--green)' : s.active ? 'var(--blue)' : 'var(--text-3)', whiteSpace: 'nowrap' }}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div style={{ flex: 1, height: 1, background: s.done ? 'var(--green)' : 'var(--border)', margin: '0 0.75rem', marginBottom: '1.25rem', opacity: 0.5 }} />
              )}
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="anim-fade-up d2" style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.875rem', color: 'var(--text-1)', marginBottom: '0.5rem' }}>
            Configure issues
          </h1>
          <p style={{ color: 'var(--text-2)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Select the issues you want developers to work on and set a salary for each one. You can always add more later.
          </p>
        </div>

        {/* Summary bar */}
        {selected.size > 0 && (
          <div className="anim-fade-up" style={{ background: 'var(--blue-bg)', border: '1px solid var(--blue-border)', borderRadius: 8, padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--blue)' }}>
              {selected.size} issue{selected.size !== 1 ? 's' : ''} selected
            </span>
            <span style={{ fontSize: '0.825rem', color: 'var(--text-2)' }}>
              Total: <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-1)' }}>${totalSalary.toLocaleString()}</span>
            </span>
          </div>
        )}

        {/* Search */}
        <div className="anim-fade-up d3" style={{ position: 'relative', marginBottom: '1.25rem' }}>
          <svg style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          <input
            className="input"
            type="text"
            placeholder="Search issues..."
            style={{ paddingLeft: '2.25rem' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Issue list */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <Spinner />
          </div>
        ) : issues.length === 0 ? (
          <div className="anim-fade-up d4" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '3rem', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 10, textAlign: 'center' }}>
            <p style={{ color: 'var(--text-2)', fontSize: '0.9rem' }}>
              No open issues found in your connected repositories.
            </p>
            <p style={{ color: 'var(--text-3)', fontSize: '0.8rem' }}>
              Create some issues on GitHub and they'll appear here.
            </p>
          </div>
        ) : (
          <div className="anim-fade-up d4">
            {repos.map((repo) => {
              const repoIssues = filtered.filter((i) => i.repo === repo)
              const repoName = repo.split('/')[1] ?? repo
              return (
                <div key={repo} style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                      <rect x="1.5" y="2" width="12" height="11" rx="1.5" stroke="var(--text-3)" strokeWidth="1.3"/>
                      <path d="M5 2v11M1.5 5.5h12" stroke="var(--text-3)" strokeWidth="1.3" strokeLinecap="round"/>
                    </svg>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-1)', fontFamily: 'var(--font-mono)' }}>{repo}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{repoIssues.length} issue{repoIssues.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                    {/* Select all header */}
                    <div style={{ display: 'flex', alignItems: 'center', padding: '0.6rem 1.25rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-3)' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--text-3)', fontWeight: 600 }}>
                        <input
                          type="checkbox"
                          checked={repoIssues.every((i) => selected.has(issueKey(i.repo, i.number)))}
                          onChange={toggleAll}
                          style={{ accentColor: 'var(--blue)', cursor: 'pointer' }}
                        />
                        Select all
                      </label>
                      <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                        Salary
                      </span>
                    </div>

                    {repoIssues.map((issue, i) => {
                      const key = issueKey(issue.repo, issue.number)
                      const isSelected = selected.has(key)
                      return (
                        <div
                          key={key}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0.875rem 1.25rem',
                            borderBottom: i < repoIssues.length - 1 ? '1px solid var(--border)' : 'none',
                            gap: '0.875rem',
                            background: isSelected ? 'var(--blue-bg)' : 'transparent',
                            transition: 'background 0.1s ease',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleIssue(issue)}
                            style={{ accentColor: 'var(--blue)', cursor: 'pointer', flexShrink: 0 }}
                          />

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                              <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-3)', flexShrink: 0 }}>#{issue.number}</span>
                              <span style={{ fontWeight: 500, fontSize: '0.875rem', color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {issue.title}
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
                              {issue.labels.map((label) => (
                                <span key={label} className={`badge ${labelConfig[label] ?? 'badge-muted'}`} style={{ fontSize: '0.6rem' }}>
                                  {label}
                                </span>
                              ))}
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>
                                opened {timeAgo(issue.created_at)}
                              </span>
                            </div>
                          </div>

                          <div className="salary-wrap" style={{ flexShrink: 0, opacity: isSelected ? 1 : 0.3, pointerEvents: isSelected ? 'auto' : 'none' }}>
                            <input
                              className="salary-input"
                              type="text"
                              value={selected.get(key)?.salary ?? '100'}
                              onChange={(e) => setSalary(issue.repo, issue.number, e.target.value)}
                              style={{ width: 80 }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="anim-fade-up d6" style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href={`/company/connect-repo?installation_id=${installationId}`} style={{ fontSize: '0.825rem', color: 'var(--text-3)', textDecoration: 'none' }}>
            &larr; Back
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link href="/company/issues" style={{ fontSize: '0.825rem', color: 'var(--text-3)', textDecoration: 'none' }}>
              Skip for now
            </Link>
            <button
              className={`btn ${selected.size > 0 ? 'btn-blue' : ''}`}
              style={{
                padding: '0.5rem 1.25rem',
                fontSize: '0.85rem',
                opacity: selected.size > 0 ? 1 : 0.4,
                pointerEvents: selected.size > 0 ? 'auto' : 'none',
              }}
              disabled={saving || selected.size === 0}
              onClick={handleFinish}
            >
              {saving ? <Spinner /> : <>Finish Setup &rarr;</>}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
