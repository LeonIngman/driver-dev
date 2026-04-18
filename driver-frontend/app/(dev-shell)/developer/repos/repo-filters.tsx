'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

type Repo = {
  org: string; orgInitial: string; orgColor: string
  name: string; description: string
  lang: string; langDot: string
  issues: number; totalValue: number; avgSalary: number
  devs: number; stars: number
  tags: string[]
}

const sortOptions = [
  { label: 'Most issues', fn: (a: Repo, b: Repo) => b.issues - a.issues },
  { label: 'Highest salary', fn: (a: Repo, b: Repo) => b.avgSalary - a.avgSalary },
  { label: 'Most active', fn: (a: Repo, b: Repo) => b.devs - a.devs },
  { label: 'Most stars', fn: (a: Repo, b: Repo) => b.stars - a.stars },
]

const filterTags = ['All', 'TypeScript', 'Go', 'Python', 'Rust', 'bug', 'performance', 'ui']

export default function RepoFilters({ repos }: { repos: Repo[] }) {
  const [activeFilter, setActiveFilter] = useState('All')
  const [sortIndex, setSortIndex] = useState(0)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    let result = repos

    // Search
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.org.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
      )
    }

    // Filter by tag/language
    if (activeFilter !== 'All') {
      const tag = activeFilter.toLowerCase()
      result = result.filter(r =>
        r.lang.toLowerCase() === tag ||
        r.tags.some(t => t.toLowerCase() === tag)
      )
    }

    // Sort
    return [...result].sort(sortOptions[sortIndex].fn)
  }, [repos, activeFilter, sortIndex, search])

  return (
    <>
      {/* Filters row */}
      <div className="anim-fade-up d2" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
          {filterTags.map(tag => {
            const isActive = tag === activeFilter
            return (
              <button
                key={tag}
                className="btn"
                onClick={() => setActiveFilter(tag)}
                style={{
                  padding: '0.3rem 0.7rem',
                  fontSize: '0.76rem',
                  background: isActive ? 'var(--blue-bg)' : 'var(--bg-3)',
                  color: isActive ? 'var(--blue)' : 'var(--text-3)',
                  border: `1px solid ${isActive ? 'var(--blue-border)' : 'var(--border)'}`,
                  borderRadius: 5,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {tag}
              </button>
            )
          })}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>Sort by</span>
          <select
            className="input"
            style={{ width: 'auto', padding: '0.35rem 0.625rem', fontSize: '0.8rem' }}
            value={sortIndex}
            onChange={e => setSortIndex(Number(e.target.value))}
          >
            {sortOptions.map((o, i) => <option key={o.label} value={i}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* Search */}
      <div className="anim-fade-up d2" style={{ position: 'relative', marginBottom: '1.25rem' }}>
        <svg style={{ position: 'absolute', left: '0.625rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} width="13" height="13" viewBox="0 0 13 13" fill="none">
          <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.2"/>
          <path d="M8.5 8.5L11 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
        <input
          className="input"
          type="text"
          placeholder="Search repos or orgs…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', maxWidth: 360, paddingLeft: '2rem', padding: '0.4rem 0.75rem 0.4rem 2rem', fontSize: '0.8rem' }}
        />
      </div>

      {/* Repo grid */}
      <div
        className="anim-fade-up d3"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '0.875rem' }}
      >
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-3)' }}>
            <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>No repos match your filters</div>
            <button
              className="btn"
              onClick={() => { setActiveFilter('All'); setSearch('') }}
              style={{ fontSize: '0.8rem', color: 'var(--blue)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Clear filters
            </button>
          </div>
        )}
        {filtered.map(repo => (
          <Link
            key={`${repo.org}-${repo.name}`}
            href={`/developer/repos/${repo.org}/${repo.name}`}
            style={{ textDecoration: 'none' }}
          >
            <div
              className="card card-hover"
              style={{ padding: '1.25rem', height: '100%', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.875rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: repo.orgColor + '18', border: `1px solid ${repo.orgColor}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.9rem', color: repo.orgColor }}>{repo.orgInitial}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginBottom: '0.1rem' }}>{repo.org}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.975rem', color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {repo.name}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}>
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="var(--text-3)"><path d="M5.5 1L7 3.8l3 .44-2.2 2.14.52 3.02L5.5 7.9 3.18 9.4l.52-3.02L1.5 4.24l3-.44L5.5 1z"/></svg>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>{(repo.stars / 1000).toFixed(1)}k</span>
                </div>
              </div>

              {/* Description */}
              <p style={{ fontSize: '0.8rem', color: 'var(--text-2)', lineHeight: 1.5, marginBottom: '1rem', flex: 1 }}>
                {repo.description}
              </p>

              {/* Tags */}
              <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', color: 'var(--text-3)' }}>
                  <span className={`lang-dot ${repo.langDot}`} />{repo.lang}
                </span>
                {repo.tags.map(tag => (
                  <span key={tag} className="badge badge-muted" style={{ fontSize: '0.6rem' }}>{tag}</span>
                ))}
              </div>

              {/* Stats row */}
              <div style={{ display: 'flex', gap: '0', borderTop: '1px solid var(--border)', paddingTop: '0.875rem' }}>
                {[
                  { label: 'Issues', value: repo.issues, color: 'var(--blue)' },
                  { label: 'Avg salary', value: `$${repo.avgSalary}`, color: 'var(--green)' },
                  { label: 'Devs active', value: repo.devs, color: 'var(--orange)' },
                ].map((s, i) => (
                  <div key={s.label} style={{ flex: 1, textAlign: i === 1 ? 'center' : i === 2 ? 'right' : 'left' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: '0.67rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  )
}
