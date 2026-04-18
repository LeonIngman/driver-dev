'use client'

import Link from 'next/link'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import MonacoEditor from '@monaco-editor/react'

const API = process.env.NEXT_PUBLIC_API_URL

/* ── Types ───────────────────────────────────────── */
type FileNode = { name: string; path: string; type: 'file' | 'folder'; active?: boolean; children?: FileNode[]; ext?: string }

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

/* ── Helpers ─────────────────────────────────────── */
const IGNORED = new Set(['node_modules', '.git', '.next', 'dist', 'build', '.cache', '.DS_Store', '__pycache__', '.turbo'])

function extFromName(name: string): string | undefined {
  const dot = name.lastIndexOf('.')
  return dot > 0 ? name.slice(dot + 1) : undefined
}

function langFromPath(path: string | null): string {
  if (!path) return 'plaintext'
  const ext = extFromName(path)
  const map: Record<string, string> = {
    ts: 'typescript', tsx: 'typescript', js: 'javascript', jsx: 'javascript',
    json: 'json', md: 'markdown', css: 'css', html: 'html', yml: 'yaml', yaml: 'yaml',
    py: 'python', rs: 'rust', go: 'go', sql: 'sql', sh: 'shell', bash: 'shell',
    xml: 'xml', svg: 'xml', toml: 'ini', env: 'ini',
  }
  return map[ext ?? ''] ?? 'plaintext'
}

function markActive(nodes: FileNode[], activePath: string): FileNode[] {
  return nodes.map(n => ({
    ...n,
    active: n.type === 'file' ? n.path === activePath : false,
    children: n.children ? markActive(n.children, activePath) : undefined,
  }))
}

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
  const colors: Record<string, string> = { ts: '#3B82F6', tsx: '#3B82F6', json: '#FBBF24', md: '#34D399', js: '#FBBF24', jsx: '#FBBF24', css: '#A78BFA', html: '#F87171', py: '#3B82F6', go: '#38BDF8', rs: '#F97316' }
  const c = colors[ext ?? ''] ?? 'var(--text-3)'
  return <div style={{ width: 8, height: 8, borderRadius: 1.5, background: c, flexShrink: 0 }} />
}

function FolderIcon({ open }: { open?: boolean }) {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M1 4a1 1 0 011-1h3.2l1.3 1.3H11a1 1 0 011 1V10a1 1 0 01-1 1H2a1 1 0 01-1-1V4z" fill="var(--blue-bg)" stroke="var(--blue-border)" strokeWidth="0.9"/>
    </svg>
  )
}

function TreeNode({ node, depth = 0, onFileClick }: { node: FileNode; depth?: number; onFileClick: (path: string) => void }) {
  const [open, setOpen] = useState(depth < 2)

  return (
    <>
      <div
        onClick={() => {
          if (node.type === 'folder') setOpen(o => !o)
          else onFileClick(node.path)
        }}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          padding: '0.28rem 0.5rem', paddingLeft: `${0.5 + depth * 1}rem`,
          borderRadius: 5, cursor: 'pointer',
          background: node.active ? 'var(--blue-bg)' : 'transparent',
          fontSize: '0.78rem',
          color: node.active ? 'var(--blue)' : 'var(--text-2)',
          fontFamily: node.type === 'file' ? 'var(--font-mono)' : undefined,
        }}
      >
        {node.type === 'folder' ? (
          <>
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none" style={{ flexShrink: 0, transition: 'transform 0.1s', transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}>
              <path d="M2 1L6 4L2 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <FolderIcon open={open} />
          </>
        ) : <FileIcon ext={node.ext} />}
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{node.name}</span>
      </div>
      {node.type === 'folder' && open && node.children?.map(child => (
        <TreeNode key={child.path} node={child} depth={depth + 1} onFileClick={onFileClick} />
      ))}
    </>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
      style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4, cursor: 'pointer', color: 'var(--text-3)', padding: '0.2rem 0.4rem', fontSize: '0.65rem', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
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
  const [submitting, setSubmitting] = useState(false)
  const [chatOpen, setChatOpen] = useState(true)
  const [filesOpen, setFilesOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // File system state
  const [folderOpen, setFolderOpen] = useState(false)
  const [folderName, setFolderName] = useState('')
  const [dirHandle, setDirHandle] = useState<FileSystemDirectoryHandle | null>(null)
  const [fileHandles, setFileHandles] = useState<Map<string, FileSystemFileHandle>>(new Map())
  const fileContentsRef = useRef<Map<string, string>>(new Map())
  const [activeFilePath, setActiveFilePath] = useState<string | null>(null)
  const [editorContent, setEditorContent] = useState('')
  const [saveStatus, setSaveStatus] = useState<'saved' | 'unsaved' | 'saving'>('saved')
  const folderInputRef = useRef<HTMLInputElement>(null)

  // Ensure webkitdirectory is set on the hidden input (React may strip non-standard attrs)
  useEffect(() => {
    if (folderInputRef.current) {
      folderInputRef.current.setAttribute('webkitdirectory', '')
      folderInputRef.current.setAttribute('directory', '')
    }
  }, [])

  // Fetch session data
  useEffect(() => {
    if (!sessionId) return
    fetch(`${API}/api/sessions/${sessionId}`)
      .then(r => r.ok ? r.json() : null)
      .then((data: Session | null) => { if (data) setSession(data) })
      .catch(() => {})

    fetch(`${API}/api/sessions/${sessionId}/messages`)
      .then(r => r.ok ? r.json() : null)
      .then(data => data && setMessages(data))
      .catch(() => {})
  }, [sessionId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── File System Access API ────────────────────
  async function readDirTree(
    handle: FileSystemDirectoryHandle,
    prefix = '',
    handles: Map<string, FileSystemFileHandle> = new Map()
  ): Promise<{ nodes: FileNode[]; handles: Map<string, FileSystemFileHandle> }> {
    const folders: FileNode[] = []
    const fileNodes: FileNode[] = []

    // @ts-expect-error — File System Access API types not in default lib
    for await (const entry of handle.values() as AsyncIterable<FileSystemHandle & { kind: 'file' | 'directory'; name: string }>) {
      if (IGNORED.has(entry.name)) continue
      const path = prefix ? `${prefix}/${entry.name}` : entry.name

      if (entry.kind === 'directory') {
        const sub = await readDirTree(entry as FileSystemDirectoryHandle, path, handles)
        folders.push({
          name: entry.name, path, type: 'folder',
          ext: undefined,
          children: sub.nodes,
        })
      } else {
        handles.set(path, entry as FileSystemFileHandle)
        fileNodes.push({
          name: entry.name, path, type: 'file',
          ext: extFromName(entry.name),
        })
      }
    }

    // Sort: folders first (alphabetical), then files (alphabetical)
    folders.sort((a, b) => a.name.localeCompare(b.name))
    fileNodes.sort((a, b) => a.name.localeCompare(b.name))

    return { nodes: [...folders, ...fileNodes], handles }
  }

  async function openFolder() {
    // @ts-expect-error — File System Access API not in default TS lib
    const hasNativeAPI = typeof window.showDirectoryPicker === 'function'

    if (hasNativeAPI) {
      try {
        // @ts-expect-error — File System Access API not in default TS lib
        const dirH = await window.showDirectoryPicker({ mode: 'readwrite' }) as FileSystemDirectoryHandle
        setDirHandle(dirH)
        setFolderName(dirH.name)
        const { nodes, handles } = await readDirTree(dirH)
        setFiles(nodes)
        setFileHandles(handles)
        setFolderOpen(true)
        setFilesOpen(true)
        return
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return
        // Native API failed (e.g. Brave blocks it) — fall through to input fallback
        console.warn('Native folder picker failed, using fallback:', err)
      }
    }

    // Fallback: trigger <input webkitdirectory>
    folderInputRef.current?.click()
  }

  function handleFolderInput(e: React.ChangeEvent<HTMLInputElement>) {
    const inputFiles = e.target.files
    if (!inputFiles || inputFiles.length === 0) return

    const contents = new Map<string, string>()
    const nodeMap = new Map<string, FileNode>()
    const roots: FileNode[] = []

    // Determine the common root folder name
    const firstPath = inputFiles[0].webkitRelativePath
    const rootName = firstPath.split('/')[0] ?? 'folder'
    setFolderName(rootName)

    let pending = inputFiles.length

    Array.from(inputFiles).forEach(file => {
      // webkitRelativePath = "rootFolder/sub/file.ts"
      const relPath = file.webkitRelativePath
      // Strip the root folder prefix so paths are relative
      const path = relPath.split('/').slice(1).join('/')
      if (!path) { pending--; checkDone(); return }

      // Skip ignored directories
      const parts = path.split('/')
      if (parts.some(p => IGNORED.has(p))) { pending--; checkDone(); return }

      const reader = new FileReader()
      reader.onload = () => {
        contents.set(path, reader.result as string)
        pending--
        checkDone()
      }
      reader.onerror = () => { pending--; checkDone() }
      reader.readAsText(file)

      // Build tree nodes
      for (let i = 0; i < parts.length; i++) {
        const current = parts.slice(0, i + 1).join('/')
        if (nodeMap.has(current)) continue
        const isFile = i === parts.length - 1
        const node: FileNode = {
          name: parts[i],
          path: current,
          type: isFile ? 'file' : 'folder',
          ext: isFile ? extFromName(parts[i]) : undefined,
          children: isFile ? undefined : [],
        }
        nodeMap.set(current, node)

        if (i === 0) {
          roots.push(node)
        } else {
          const parentPath = parts.slice(0, i).join('/')
          nodeMap.get(parentPath)?.children?.push(node)
        }
      }
    })

    function sortNodes(nodes: FileNode[]) {
      nodes.sort((a, b) => {
        if (a.type !== b.type) return a.type === 'folder' ? -1 : 1
        return a.name.localeCompare(b.name)
      })
      nodes.forEach(n => { if (n.children) sortNodes(n.children) })
    }

    function checkDone() {
      if (pending > 0) return
      sortNodes(roots)
      fileContentsRef.current = contents
      setFiles(roots)
      setFolderOpen(true)
      setFilesOpen(true)
    }

    // Reset input so re-selecting the same folder works
    e.target.value = ''
  }

  async function openFile(path: string) {
    // Try native handle first, then fall back to in-memory contents
    const handle = fileHandles.get(path)
    if (handle) {
      const file = await handle.getFile()
      const text = await file.text()
      setEditorContent(text)
    } else {
      const text = fileContentsRef.current.get(path)
      if (text === undefined) return
      setEditorContent(text)
    }
    setActiveFilePath(path)
    setSaveStatus('saved')
    setFiles(prev => markActive(prev, path))
  }

  const saveFile = useCallback(async () => {
    if (!activeFilePath) return
    setSaveStatus('saving')

    // Try native write first
    const handle = fileHandles.get(activeFilePath)
    if (handle) {
      try {
        const writable = await handle.createWritable()
        await writable.write(editorContent)
        await writable.close()
        setSaveStatus('saved')
        return
      } catch {
        // Fall through to download
      }
    }

    // Fallback: update in-memory contents + trigger download
    fileContentsRef.current.set(activeFilePath, editorContent)
    const blob = new Blob([editorContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = activeFilePath.split('/').pop() ?? 'file'
    a.click()
    URL.revokeObjectURL(url)
    setSaveStatus('saved')
  }, [activeFilePath, fileHandles, editorContent])

  // Cmd+S / Ctrl+S keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        saveFile()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [saveFile])

  function handleSend() {
    if (!chatInput.trim()) return
    setMessages(prev => [...prev, { role: 'user', content: chatInput.trim() }])
    setChatInput('')
  }

  async function handleSubmit() {
    if (!sessionId) return
    setSubmitting(true)
    try {
      const res = await fetch(`${API}/api/sessions/${sessionId}/submit`, { method: 'POST' })
      if (res.ok) router.push('/repos/detail')
    } finally {
      setSubmitting(false)
    }
  }

  const issue = session?.issue
  const diff = session?.diff
  const usage = session?.usage
  const userInitials = session?.user?.initials ?? '?'
  const activeFileName = activeFilePath?.split('/').pop() ?? 'No file open'
  const activeExt = activeFilePath ? extFromName(activeFilePath) : undefined

  // Derive repo clone URL from session
  const repoName = issue?.repoName ?? ''
  const cloneUrl = repoName ? `https://github.com/${repoName}.git` : ''
  const branchName = issue ? `fix/issue-${issue.id}` : 'fix/issue'

  return (
    <div style={{ display: 'flex', height: '100vh', flexDirection: 'column', background: 'var(--bg-0)', overflow: 'hidden' }}>

      {/* Hidden input for folder fallback (Firefox, Safari, Brave) */}
      {/* @ts-expect-error — webkitdirectory is non-standard but widely supported */}
      <input ref={folderInputRef} type="file" webkitdirectory="" style={{ display: 'none' }} onChange={handleFolderInput} />

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
          <Link href="/repos/detail" style={{ color: 'var(--text-3)', textDecoration: 'none' }}>{repoName || '...'}</Link>
          <span>/</span>
          <span style={{ color: 'var(--text-1)', fontWeight: 500 }}>
            {issue ? `#${issue.id} · ${issue.title}` : '...'}
          </span>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          {folderOpen && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--green-bg)', border: '1px solid rgba(52,211,153,0.25)', borderRadius: 5, padding: '0.25rem 0.625rem' }}>
              <span className="live-dot" />
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--green)' }}>Workspace open</span>
            </div>
          )}

          <button className="btn btn-orange" style={{ padding: '0.4rem 0.875rem', fontSize: '0.78rem' }} onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit for Review'}
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

            <div ref={messagesEndRef} />
          </div>

          <div style={{ padding: '0.75rem', borderTop: '1px solid var(--border)', background: 'var(--bg-1)' }}>
            <div style={{ background: 'var(--bg-0)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
              <textarea
                placeholder="Ask Claude to adjust the fix..."
                rows={3}
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                style={{
                  width: '100%', background: 'transparent', border: 'none', outline: 'none',
                  padding: '0.625rem 0.75rem', color: 'var(--text-1)', fontSize: '0.825rem',
                  resize: 'none', fontFamily: 'var(--font-body)', lineHeight: 1.5,
                }}
              />
              <div style={{ padding: '0.375rem 0.625rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.67rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>Enter to send</span>
                <button className="btn btn-blue" style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem' }} onClick={handleSend}>
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
          width: filesOpen ? 240 : 32, minWidth: filesOpen ? 240 : 32,
          background: 'var(--bg-1)', borderRight: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
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
              <button onClick={() => setFilesOpen(false)} title="Collapse files" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', display: 'flex', alignItems: 'center', padding: '0.1rem' }}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M8 2.5L4 6.5L8 10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '0.375rem' }}>
            {files.length === 0 && !folderOpen && (
              <div style={{ padding: '1rem 0.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginBottom: '0.5rem' }}>No folder open</div>
                <button className="btn btn-blue" style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem' }} onClick={openFolder}>
                  Open Folder
                </button>
              </div>
            )}
            {files.map(node => <TreeNode key={node.path} node={node} onFileClick={openFile} />)}
          </div>

          {folderOpen && (
            <div style={{ padding: '0.5rem 0.75rem', borderTop: '1px solid var(--border)', background: 'var(--bg-0)' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {folderName}
              </div>
            </div>
          )}
          </>)}
        </div>

        {/* ── PANEL 3: Editor ──────────────────────────── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg-0)' }}>

          {/* Toolbar — only show when a folder is open */}
          {folderOpen && (
            <div style={{
              height: 38, minHeight: 38,
              background: 'var(--bg-1)', borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', padding: '0 0.875rem', gap: '0.5rem',
            }}>
              {/* Active file tab */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.125rem', flex: 1 }}>
                {activeFilePath && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.375rem',
                    padding: '0.25rem 0.75rem', borderRadius: '5px 5px 0 0',
                    background: 'var(--bg-0)', borderBottom: '2px solid var(--blue)', cursor: 'pointer',
                  }}>
                    <FileIcon ext={activeExt} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-1)' }}>{activeFileName}</span>
                    {saveStatus === 'unsaved' && (
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--orange)' }} />
                    )}
                  </div>
                )}
              </div>

              {/* Save button */}
              <button
                className={`btn ${saveStatus === 'unsaved' ? 'btn-blue' : 'btn-ghost'}`}
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem' }}
                onClick={saveFile}
                disabled={saveStatus !== 'unsaved'}
              >
                {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved' : 'Save'}
              </button>
            </div>
          )}

          {/* Onboarding: workspace setup — shown when no folder open */}
          {!folderOpen && (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-1)' }}>
              <div style={{ maxWidth: 480, width: '100%', padding: '2rem' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-1)', marginBottom: '0.25rem', fontFamily: 'var(--font-display)' }}>
                  Set up your workspace
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginBottom: '1.5rem' }}>
                  Clone the repository and open the folder to start working on this issue.
                </div>

                {/* Step 1 */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#fff' }}>1</span>
                    </div>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-1)' }}>Clone the repository</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-0)', border: '1px solid var(--border)', borderRadius: 6, padding: '0.5rem 0.75rem' }}>
                    <code style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      git clone {cloneUrl || 'https://github.com/org/repo.git'}
                    </code>
                    <CopyButton text={`git clone ${cloneUrl || 'https://github.com/org/repo.git'}`} />
                  </div>
                </div>

                {/* Step 2 */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#fff' }}>2</span>
                    </div>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-1)' }}>Create your fix branch</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-0)', border: '1px solid var(--border)', borderRadius: 6, padding: '0.5rem 0.75rem' }}>
                    <code style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      git checkout -b {branchName}
                    </code>
                    <CopyButton text={`git checkout -b ${branchName}`} />
                  </div>
                </div>

                {/* Step 3: Open folder */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#fff' }}>3</span>
                    </div>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-1)' }}>Open your local copy</span>
                  </div>
                </div>

                <button className="btn btn-orange" style={{ width: '100%', padding: '0.625rem 1rem', fontSize: '0.85rem', justifyContent: 'center' }} onClick={openFolder}>
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <path d="M1.5 5a1.5 1.5 0 011.5-1.5h3.5l1.5 1.5H12a1.5 1.5 0 011.5 1.5v5a1.5 1.5 0 01-1.5 1.5H3A1.5 1.5 0 011.5 11.5V5z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Open Local Folder
                </button>
              </div>
            </div>
          )}

          {/* Monaco editor — shown when folder is open */}
          {folderOpen && activeFilePath && (
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <MonacoEditor
                value={editorContent}
                language={langFromPath(activeFilePath)}
                theme="light"
                onChange={val => { setEditorContent(val ?? ''); setSaveStatus('unsaved') }}
                options={{
                  fontSize: 13,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  padding: { top: 12 },
                  lineNumbers: 'on',
                  renderLineHighlight: 'line',
                  fontFamily: 'var(--font-mono), monospace',
                  tabSize: 2,
                  wordWrap: 'on',
                }}
              />
            </div>
          )}

          {/* Empty state when folder open but no file selected */}
          {folderOpen && !activeFilePath && (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-0)' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-2)', marginBottom: '0.375rem' }}>Select a file to edit</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>Choose a file from the tree on the left</div>
              </div>
            </div>
          )}

          {/* Status bar */}
          <div style={{
            height: 24, minHeight: 24, background: 'var(--blue-dim)',
            display: 'flex', alignItems: 'center', padding: '0 0.875rem', gap: '1.25rem',
          }}>
            {activeFilePath && (
              <>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'rgba(255,255,255,0.55)' }}>{langFromPath(activeFilePath)}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'rgba(255,255,255,0.55)' }}>UTF-8</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'rgba(255,255,255,0.55)' }}>
                  {editorContent.length} chars
                </span>
              </>
            )}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              {saveStatus === 'unsaved' && (
                <>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--orange)' }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'rgba(255,255,255,0.7)' }}>Unsaved</span>
                </>
              )}
              {saveStatus === 'saved' && activeFilePath && (
                <>
                  <span className="live-dot" style={{ width: 5, height: 5 }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'rgba(255,255,255,0.7)' }}>Saved</span>
                </>
              )}
              {saveStatus === 'saving' && (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'rgba(255,255,255,0.7)' }}>Saving...</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
