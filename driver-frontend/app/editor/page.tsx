'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

const API = process.env.NEXT_PUBLIC_API_URL

/* ── Types ───────────────────────────────────────── */
type FileNode = { name: string; type: 'file' | 'folder'; active?: boolean; children?: FileNode[]; ext?: string }

type Message = {
  role: 'claude' | 'user' | 'system'
  content: string
}

type Session = {
  issue: { id: number; title: string; labels: string[]; bounty: string; repoName: string }
  files: FileNode[]
  diff: { added: number; removed: number }
  usage: { tokens: number; cost: string }
  user: { initials: string }
  activeFile: { name: string; content: string }
}

const DEFAULT_CODE = `// Start writing your fix here`

/* ── Static icons ────────────────────────────────── */
const Logo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
    <div style={{ width: 22, height: 22, background: 'var(--blue)', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: '#fff', fontWeight: 800, fontSize: 11, fontFamily: 'var(--font-display)' }}>D</span>
    </div>
    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--text-1)' }}>Driver</span>
  </div>
)

const AnthropicMark = () => (
  <svg width="14" height="14" viewBox="0 0 32 32" fill="none">
    <rect width="32" height="32" rx="6" fill="#CC785C"/>
    <path d="M19.2 8h-3.2L10 24h3.2l1.4-3.6h5.6l1.4 3.6H24L19.2 8zm-3.6 9.8 1.9-4.9 1.9 4.9h-3.8z" fill="white"/>
  </svg>
)

function FileIcon({ ext }: { ext?: string }) {
  const colors: Record<string, string> = { ts: '#3B82F6', json: '#FBBF24', md: '#34D399', js: '#FBBF24' }
  const c = colors[ext ?? ''] ?? 'var(--text-3)'
  return <div style={{ width: 8, height: 8, borderRadius: 1.5, background: c, flexShrink: 0 }} />
}

function FolderIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M1 4a1 1 0 011-1h3.2l1.3 1.3H11a1 1 0 011 1V10a1 1 0 01-1 1H2a1 1 0 01-1-1V4z" fill="var(--blue-bg)" stroke="var(--blue-border)" strokeWidth="0.9"/>
    </svg>
  )
}

function TreeNode({ node, depth = 0, onRemove }: { node: FileNode; depth?: number; onRemove: (name: string) => void }) {
  return (
    <>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        padding: '0.28rem 0.5rem', paddingLeft: `${0.5 + depth * 1}rem`,
        borderRadius: 5, cursor: 'pointer',
        background: node.active ? 'var(--blue-bg)' : 'transparent',
        fontSize: '0.78rem',
        color: node.active ? 'var(--blue)' : 'var(--text-2)',
        fontFamily: node.type === 'file' ? 'var(--font-mono)' : undefined,
      }}>
        {node.type === 'folder' ? <FolderIcon /> : <FileIcon ext={node.ext} />}
        <span style={{ flex: 1 }}>{node.name}</span>
        {node.type === 'file' && (
          <button
            onClick={e => { e.stopPropagation(); onRemove(node.name) }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', lineHeight: 1, padding: '0 2px', fontSize: '0.8rem', display: 'flex', alignItems: 'center' }}
          >×</button>
        )}
      </div>
      {node.children?.map(child => (
        <TreeNode key={child.name} node={child} depth={depth + 1} onRemove={onRemove} />
      ))}
    </>
  )
}

function removeFile(nodes: FileNode[], name: string): FileNode[] {
  return nodes
    .filter(n => n.name !== name)
    .map(n => n.children ? { ...n, children: removeFile(n.children, name) } : n)
}

/* ── Page ────────────────────────────────────────── */
export default function Editor() {
  const params = useSearchParams()
  const router = useRouter()
  const sessionId = params.get('sessionId')

  const [session, setSession] = useState<Session | null>(null)
  const [files, setFiles] = useState<FileNode[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [chatInput, setChatInput] = useState('')
  const [sending, setSending] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [code, setCode] = useState(DEFAULT_CODE)
  const [activeTab, setActiveTab] = useState<'Code' | 'Preview'>('Code')
  const [chatOpen, setChatOpen] = useState(true)
  const [filesOpen, setFilesOpen] = useState(true)
  // Preview tab is a placeholder — will be replaced with e2b sandbox
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sessionId) return
    fetch(`${API}/sessions/${sessionId}`)
      .then(r => r.ok ? r.json() : null)
      .then((data: Session | null) => {
        if (data) {
          setSession(data)
          setFiles(data.files ?? [])
          if (data.activeFile?.content) setCode(data.activeFile.content)
        }
      })
      .catch(() => {})

    fetch(`${API}/sessions/${sessionId}/messages`)
      .then(r => r.ok ? r.json() : null)
      .then(data => data && setMessages(data))
      .catch(() => {})
  }, [sessionId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    if (!chatInput.trim() || !sessionId) return
    const content = chatInput.trim()
    setChatInput('')
    setMessages(prev => [...prev, { role: 'user', content }])
    setSending(true)
    try {
      const res = await fetch(`${API}/sessions/${sessionId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      if (res.ok) {
        const reply = await res.json()
        setMessages(prev => [...prev, reply])
      }
    } finally {
      setSending(false)
    }
  }

  async function handleSubmit() {
    if (!sessionId) return
    setSubmitting(true)
    try {
      const res = await fetch(`${API}/sessions/${sessionId}/submit`, { method: 'POST' })
      if (res.ok) router.push('/repos/detail')
    } finally {
      setSubmitting(false)
    }
  }

  const issue = session?.issue
  const diff = session?.diff
  const usage = session?.usage
  const userInitials = session?.user.initials ?? '?'
  const changedCount = files.filter(f => f.type === 'file' && f.active).length
  const activeFile = session?.activeFile ?? { name: 'index.html', content: '' }

  return (
    <div style={{ display: 'flex', height: '100vh', flexDirection: 'column', background: 'var(--bg-0)', overflow: 'hidden' }}>

      {/* Global top bar */}
      <div style={{
        height: 44, minHeight: 44,
        background: 'var(--bg-1)', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', padding: '0 1rem', gap: '1rem', zIndex: 10,
      }}>
        <Logo />

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--text-3)', marginLeft: '0.5rem' }}>
          <Link href="/repos" style={{ color: 'var(--text-3)', textDecoration: 'none' }}>Browse</Link>
          <span>/</span>
          <Link href="/repos/detail" style={{ color: 'var(--text-3)', textDecoration: 'none' }}>{issue?.repoName ?? '…'}</Link>
          <span>/</span>
          <span style={{ color: 'var(--text-1)', fontWeight: 500 }}>
            {issue ? `#${issue.id} · ${issue.title}` : '…'}
          </span>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--green-bg)', border: '1px solid rgba(52,211,153,0.25)', borderRadius: 5, padding: '0.25rem 0.625rem' }}>
            <span className="live-dot" />
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--green)' }}>Preview live</span>
          </div>

          <button className="btn btn-orange" style={{ padding: '0.4rem 0.875rem', fontSize: '0.78rem' }} onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit for Review'}
            {!submitting && (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6h8M6.5 2.5L10 6l-3.5 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>

          <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg, var(--blue), var(--blue-light))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.58rem', fontWeight: 700, color: '#fff' }}>{userInitials}</span>
          </div>
        </div>
      </div>

      {/* Main 3-panel area */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── PANEL 1: Chat ──────────────────────────── */}
        <div style={{
          width: chatOpen ? 340 : 32, minWidth: chatOpen ? 340 : 32,
          background: 'var(--bg-1)', borderRight: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          {/* Collapsed strip */}
          {!chatOpen && (
            <button
              onClick={() => setChatOpen(true)}
              title="Expand chat"
              style={{ flex: 1, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)' }}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M5 2.5L9 6.5L5 10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          )}

          {chatOpen && (<>
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AnthropicMark />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-1)' }}>Claude</div>
            </div>
            <span className="badge badge-muted" style={{ fontSize: '0.6rem', fontFamily: 'var(--font-mono)' }}>claude-3-7-sonnet</span>
            <button onClick={() => setChatOpen(false)} title="Collapse chat" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', display: 'flex', alignItems: 'center', padding: '0.1rem' }}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M8 2.5L4 6.5L8 10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>

          {issue && (
            <div style={{ padding: '0.625rem 0.875rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-0)' }}>
              <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 7, padding: '0.5rem 0.75rem' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 700, marginBottom: '0.25rem' }}>Active issue</div>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-1)', lineHeight: 1.3, marginBottom: '0.25rem' }}>
                  #{issue.id} · {issue.title}
                </div>
                <div style={{ display: 'flex', gap: '0.3rem' }}>
                  {issue.labels.map(label => (
                    <span key={label} className="badge badge-red" style={{ fontSize: '0.58rem' }}>{label}</span>
                  ))}
                  <span className="badge badge-green" style={{ fontSize: '0.58rem', marginLeft: 'auto' }}>{issue.bounty}</span>
                </div>
              </div>
            </div>
          )}

          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 0.875rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {messages.map((msg, i) => (
              <div key={i}>
                {msg.role === 'claude' && (
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                    <div style={{ width: 22, height: 22, borderRadius: 5, background: '#CC785C18', border: '1px solid #CC785C33', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                      <AnthropicMark />
                    </div>
                    <div className="chat-claude" style={{ flex: 1 }}>
                      <span dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/`(.+?)`/g, `<code style="font-family:var(--font-mono);font-size:0.78em;background:var(--bg-4);padding:0.1em 0.35em;border-radius:3px;color:var(--blue)">$1</code>`) }} />
                    </div>
                  </div>
                )}
                {msg.role === 'user' && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div className="chat-user">{msg.content}</div>
                  </div>
                )}
                {msg.role === 'system' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--green-bg)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: 6, padding: '0.45rem 0.75rem' }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l2.8 3L10 3" stroke="#34D399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--green)' }}>{msg.content}</span>
                  </div>
                )}
              </div>
            ))}

            {sending && (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <div style={{ width: 22, height: 22, borderRadius: 5, background: '#CC785C18', border: '1px solid #CC785C33', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <AnthropicMark />
                </div>
                <div style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: '12px 12px 12px 2px', padding: '0.5rem 0.75rem', display: 'flex', gap: '4px', alignItems: 'center' }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--text-3)', animation: `pulse-dot 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div style={{ padding: '0.75rem', borderTop: '1px solid var(--border)', background: 'var(--bg-1)' }}>
            <div style={{ background: 'var(--bg-0)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
              <textarea
                placeholder="Ask Claude to adjust the fix…"
                rows={3}
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSend() }}
                style={{
                  width: '100%', background: 'transparent', border: 'none', outline: 'none',
                  padding: '0.625rem 0.75rem', color: 'var(--text-1)', fontSize: '0.825rem',
                  resize: 'none', fontFamily: 'var(--font-body)', lineHeight: 1.5,
                }}
              />
              <div style={{ padding: '0.375rem 0.625rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.67rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>⌘↵ to send</span>
                <button className="btn btn-blue" style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem' }} onClick={handleSend} disabled={sending}>
                  Send
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                    <path d="M1.5 5.5h8M6 2l3.5 3.5L6 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
            {usage && (
              <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.67rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
                  Using your API key · ~{usage.tokens.toLocaleString()} tokens
                </span>
                <span style={{ fontSize: '0.67rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>{usage.cost}</span>
              </div>
            )}
          </div>
          </>)}
        </div>

        {/* ── PANEL 2: File tree ─────────────────────── */}
        <div style={{
          width: filesOpen ? 200 : 32, minWidth: filesOpen ? 200 : 32,
          background: 'var(--bg-1)', borderRight: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          {/* Collapsed strip */}
          {!filesOpen && (
            <button
              onClick={() => setFilesOpen(true)}
              title="Expand files"
              style={{ flex: 1, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)' }}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M5 2.5L9 6.5L5 10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          )}

          {filesOpen && (<>
          <div style={{ padding: '0.625rem 0.75rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Files</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              {changedCount > 0 && (
                <span className="badge badge-blue" style={{ fontSize: '0.58rem' }}>{changedCount} changed</span>
              )}
              <button onClick={() => setFilesOpen(false)} title="Collapse files" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', display: 'flex', alignItems: 'center', padding: '0.1rem' }}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M8 2.5L4 6.5L8 10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '0.375rem' }}>
            {files.map(node => <TreeNode key={node.name} node={node} onRemove={name => setFiles(f => removeFile(f, name))} />)}
          </div>

          {diff && (
            <div style={{ padding: '0.625rem 0.75rem', borderTop: '1px solid var(--border)', background: 'var(--bg-0)' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-3)', marginBottom: '0.375rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Diff summary</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--green)' }}>+{diff.added}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--red)' }}>-{diff.removed}</span>
                <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'var(--border)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.round(diff.added / (diff.added + diff.removed) * 100)}%`, background: 'var(--green)', borderRadius: 2 }} />
                </div>
              </div>
            </div>
          )}
          </>)}
        </div>

        {/* ── PANEL 3: Editor / Preview ─────────────── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg-0)' }}>

          {/* Toolbar */}
          <div style={{
            height: 38, minHeight: 38,
            background: 'var(--bg-1)', borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', padding: '0 0.875rem', gap: '0.5rem',
          }}>
            {/* Active file tab */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.125rem', flex: 1 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.375rem',
                padding: '0.25rem 0.75rem', borderRadius: '5px 5px 0 0',
                background: 'var(--bg-0)', borderBottom: '2px solid var(--blue)', cursor: 'pointer',
              }}>
                <span className="lang-dot lang-ts" style={{ width: 7, height: 7 }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-1)' }}>{activeFile.name}</span>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--orange)' }} />
              </div>
            </div>

            {/* Code / Preview toggle */}
            <div style={{ display: 'flex', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 6, padding: 2 }}>
              {(['Code', 'Preview'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '0.2rem 0.625rem', fontSize: '0.72rem', fontWeight: 600,
                    border: 'none', borderRadius: 4, cursor: 'pointer',
                    background: activeTab === tab ? 'var(--bg-1)' : 'transparent',
                    color: activeTab === tab ? 'var(--text-1)' : 'var(--text-3)',
                    fontFamily: 'var(--font-body)', transition: 'all 0.1s',
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            <button className="btn btn-ghost" style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem' }}>
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M1 5.5h9M6.5 2L10 5.5 6.5 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Run tests
            </button>
          </div>

          {/* Code editor — real textarea */}
          {activeTab === 'Code' && (
            <textarea
              value={code}
              onChange={e => setCode(e.target.value)}
              spellCheck={false}
              style={{
                flex: 1,
                width: '100%',
                background: 'var(--bg-0)',
                border: 'none',
                outline: 'none',
                resize: 'none',
                padding: '1rem 1rem 1rem 3rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                lineHeight: '1.6rem',
                color: 'var(--text-1)',
                tabSize: 2,
              }}
            />
          )}

          {/* Preview — e2b sandbox placeholder */}
          {activeTab === 'Preview' && (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-1)' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-2)', marginBottom: '0.375rem' }}>Preview coming soon</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>Will be powered by e2b</div>
              </div>
            </div>
          )}

          {/* Status bar */}
          <div style={{
            height: 24, minHeight: 24, background: 'var(--blue-dim)',
            display: 'flex', alignItems: 'center', padding: '0 0.875rem', gap: '1.25rem',
          }}>
            {['HTML', 'UTF-8', 'LF'].map(label => (
              <span key={label} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'rgba(255,255,255,0.55)' }}>{label}</span>
            ))}
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'rgba(255,255,255,0.55)' }}>
              {code.length} chars
            </span>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <span className="live-dot" style={{ width: 5, height: 5 }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'rgba(255,255,255,0.7)' }}>
                {activeTab === 'Preview' ? 'Preview live' : 'Editing'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
