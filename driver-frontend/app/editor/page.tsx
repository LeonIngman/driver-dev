'use client'

import Link from 'next/link'
import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import MonacoEditor, { loader } from '@monaco-editor/react'

loader.config({
  paths: {
    vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs',
  },
})

const API = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001').replace(/\/$/, '')

/* ── Types ───────────────────────────────────────── */
type FileNode = { name: string; path: string; type: 'file' | 'folder'; active?: boolean; children?: FileNode[]; ext?: string }

type Message = {
  role: 'claude' | 'user' | 'system'
  content: string
}

type Session = {
  issue: { id: number; title: string; labels: string[]; bounty: string; repoName: string }
  branch: string | null
  defaultBranch: string | null
  previewUrl?: string
  model?: string
  status: string
  diff: { added: number; removed: number }
  usage: { tokens: number; cost: string }
  user: { initials: string }
}

/* ── Helpers ─────────────────────────────────────── */
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

/* ── Preview builder ────────────────────────────── */
function buildPreviewDoc(content: string, filePath: string | null): string {
  const ext = filePath ? extFromName(filePath) : undefined

  // HTML files: render directly
  if (ext === 'html' || ext === 'htm') {
    return content
  }

  // CSS files: render with a sample HTML page
  if (ext === 'css') {
    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>${content}</style></head>
<body>
<h1>CSS Preview</h1>
<p>This is a paragraph with your styles applied.</p>
<button>Button</button>
<a href="#">Link</a>
<ul><li>List item 1</li><li>List item 2</li><li>List item 3</li></ul>
<div class="container"><div class="card"><h2>Card</h2><p>Card content</p></div></div>
<input type="text" placeholder="Text input" />
<table><thead><tr><th>Header</th><th>Header</th></tr></thead><tbody><tr><td>Cell</td><td>Cell</td></tr></tbody></table>
</body></html>`
  }

  // SVG files: render inline
  if (ext === 'svg') {
    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f5f5f5}</style></head>
<body>${content}</body></html>`
  }

  // JSON files: formatted view
  if (ext === 'json') {
    let formatted = content
    try { formatted = JSON.stringify(JSON.parse(content), null, 2) } catch {}
    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{margin:0;padding:1.5rem;font-family:ui-monospace,monospace;font-size:13px;background:#1e1e1e;color:#d4d4d4}pre{white-space:pre-wrap;word-break:break-word}</style></head>
<body><pre>${formatted.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</pre></body></html>`
  }

  // Markdown files: basic render
  if (ext === 'md' || ext === 'markdown') {
    const html = content
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>')
    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{margin:0;padding:2rem;font-family:-apple-system,system-ui,sans-serif;font-size:15px;line-height:1.6;max-width:720px;color:#24292f}
h1,h2,h3{margin:1em 0 0.5em}code{background:#f0f0f0;padding:0.15em 0.4em;border-radius:3px;font-size:0.9em}</style></head>
<body>${html}</body></html>`
  }

  // JS/TS/JSX/TSX: transpile with Babel and render with React
  if (['js', 'jsx', 'ts', 'tsx', 'mjs'].includes(ext ?? '')) {
    const isJsx = ['jsx', 'tsx'].includes(ext ?? '')
    const isTs = ['ts', 'tsx'].includes(ext ?? '')
    const presets = isTs ? '["env","react","typescript"]' : isJsx ? '["env","react"]' : '["env"]'
    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
body{margin:0;font-family:-apple-system,system-ui,sans-serif;font-size:14px;background:#fff;color:#24292f}
#root{padding:1rem}
#error-display{margin:1rem;padding:1rem;background:#1e1e1e;color:#f48771;font-family:ui-monospace,monospace;font-size:13px;border-radius:6px;white-space:pre-wrap;word-break:break-word;display:none}
#console-output{margin:1rem;font-family:ui-monospace,monospace;font-size:13px;color:#d4d4d4;background:#1e1e1e;border-radius:6px;overflow:hidden}
#console-output:empty{display:none}
#console-output .log{padding:0.35rem 0.75rem;border-bottom:1px solid #333}
#console-output .error{color:#f48771}
#console-output .warn{color:#cca700}
</style>
<script src="https://unpkg.com/react@18/umd/react.development.js"><\/script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"><\/script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
</head>
<body>
<div id="root"></div>
<div id="error-display"></div>
<div id="console-output"></div>
<script>
(function(){
  var consoleOut=document.getElementById('console-output');
  function appendLog(cls,args){
    var d=document.createElement('div');d.className='log '+cls;
    d.textContent=[].map.call(args,function(a){
      try{return typeof a==='object'?JSON.stringify(a,null,2):String(a)}catch(e){return String(a)}
    }).join(' ');
    consoleOut.appendChild(d);
  }
  var origLog=console.log,origWarn=console.warn,origError=console.error;
  console.log=function(){appendLog('',arguments);origLog.apply(console,arguments)};
  console.warn=function(){appendLog('warn',arguments);origWarn.apply(console,arguments)};
  console.error=function(){appendLog('error',arguments);origError.apply(console,arguments)};

  var code=${JSON.stringify(content)};
  var errEl=document.getElementById('error-display');
  try{
    var result=Babel.transform(code,{presets:${presets},filename:"file.${ext}"});
    var fn=new Function('React','ReactDOM','require','exports','module',result.code+'\\n//# sourceURL=preview.js');
    // Deep proxy that returns itself for property access/calls, but coerces to empty string
    // Blacklist React internal/lifecycle keys so the proxy doesn't look like a class component
    var reactBlacklist=['componentWillMount','componentWillReceiveProps','componentWillUpdate',
      'componentDidMount','componentDidUpdate','componentWillUnmount','componentDidUnmount',
      'componentDidReceiveProps','componentWillRecieveProps','UNSAFE_componentWillRecieveProps',
      'UNSAFE_componentWillMount','UNSAFE_componentWillReceiveProps','UNSAFE_componentWillUpdate',
      'componentShouldUpdate','shouldComponentUpdate','getSnapshotBeforeUpdate',
      'getDerivedStateFromProps','getDerivedStateFromError',
      'propTypes','contextTypes','contextType','childContextTypes','getChildContext',
      'defaultProps','state','refs','context','updater',
      '_reactInternals','_reactInternalInstance',
      '__reactInternalMemoizedUnmaskedChildContext','__reactInternalMemoizedMaskedChildContext',
      '__reactInternalMemoizedMergedChildContext','isReactComponent','render',
      'isMounted','replaceState','isPureReactComponent'];
    function makeStub(){
      var handler={
        get:function(_,k){
          if(k==='__esModule')return true;
          if(k==='$$typeof'||k==='then')return undefined;
          if(k===Symbol.toPrimitive)return function(){return '';};
          if(k==='toString'||k==='valueOf')return function(){return '';};
          if(typeof k==='string'&&reactBlacklist.indexOf(k)!==-1)return undefined;
          return stub;
        },
        apply:function(){return stub;}
      };
      var stub=new Proxy(function(){return stub;},handler);
      return stub;
    }
    // Simple stub component for next/image and next/link
    function StubImage(props){
      return React.createElement('img',{src:props.src||'',alt:props.alt||'',width:props.width,height:props.height,style:{maxWidth:'100%'}});
    }
    function StubLink(props){
      return React.createElement('a',{href:props.href||'#'},props.children);
    }
    var mockRequire=function(m){
      if(m==='react')return React;
      if(m==='react-dom'||m==='react-dom/client')return ReactDOM;
      // Provide stub components for known Next.js modules
      if(m==='next/image')return {__esModule:true,default:StubImage};
      if(m==='next/link')return {__esModule:true,default:StubLink};
      // Stub next/font/* — any named or default export acts as a font constructor
      if(m.startsWith('next/font/')){var fontFn=function(){return {className:'',style:{}};};return new Proxy({__esModule:true,default:fontFn},{get:function(_,k){if(k==='__esModule')return true;if(k==='default')return fontFn;return fontFn;}});}
      // Stub next/navigation, next/router, etc.
      if(m.startsWith('next/'))return makeStub();
      // Silently stub CSS/asset imports
      var silent=/\\.(css|scss|sass|less|svg|png|jpg|jpeg|gif|woff|woff2|ttf|eot|ico)$/i.test(m);
      if(!silent)console.warn('Module "'+m+'" is not available in preview');
      return makeStub();
    };
    var mockExports={};
    var mockModule={exports:mockExports};
    fn(React,ReactDOM,mockRequire,mockExports,mockModule);
    var exported=mockModule.exports.default||mockModule.exports;
    if(typeof exported==='function'){
      var root=ReactDOM.createRoot(document.getElementById('root'));
      var sampleChildren=React.createElement('div',{style:{padding:'1rem'}},
        React.createElement('h1',null,'Preview'),
        React.createElement('p',null,'This is a preview of your component.')
      );
      // Detect layout components by checking source for <html tag
      var isLayout=/<html[\\s>]/i.test(code);
      if(isLayout){
        root.render(sampleChildren);
      }else{
        try{
          root.render(React.createElement(exported,{children:sampleChildren}));
        }catch(e){
          root.render(React.createElement(exported));
        }
      }
    }
  }catch(e){
    errEl.style.display='block';
    errEl.textContent=e.message;
  }
  window.onerror=function(m){errEl.style.display='block';errEl.textContent+=('\\n'+m)};
})();
<\/script></body></html>`
  }

  // Fallback: syntax-highlighted source view
  const escaped = content.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
  const lang = langFromPath(filePath)
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{margin:0;padding:1.5rem;font-family:ui-monospace,monospace;font-size:13px;background:#1e1e1e;color:#d4d4d4}
pre{white-space:pre-wrap;word-break:break-word;margin:0}
.meta{color:#666;font-size:11px;margin-bottom:1rem;padding-bottom:0.5rem;border-bottom:1px solid #333}</style></head>
<body><div class="meta">${filePath ?? 'untitled'} · ${lang}</div><pre>${escaped}</pre></body></html>`
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

/* ── Page ────────────────────────────────────────── */
function EditorInner() {
  const params = useSearchParams()
  const sessionId = params.get('sessionId')

  const [session, setSession] = useState<Session | null>(null)
  const [files, setFiles] = useState<FileNode[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [chatInput, setChatInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [claudeTyping, setClaudeTyping] = useState(false)
  const [chatOpen, setChatOpen] = useState(true)
  const [filesOpen, setFilesOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Editor state
  const [loading, setLoading] = useState(true)
  const fileContentsRef = useRef<Map<string, string>>(new Map())
  const [fileShas, setFileShas] = useState<Map<string, string>>(new Map())
  const [activeFilePath, setActiveFilePath] = useState<string | null>(null)
  const [editorContent, setEditorContent] = useState('')
  const [saveStatus, setSaveStatus] = useState<'saved' | 'unsaved' | 'saving'>('saved')
  const [branchName, setBranchName] = useState<string | null>(null)
  const [dirtyFiles, setDirtyFiles] = useState<Set<string>>(new Set())
  const [prUrl, setPrUrl] = useState<string | null>(null)
  const [showPrModal, setShowPrModal] = useState(false)
  const [viewMode, setViewMode] = useState<'code' | 'preview'>('code')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewKey, setPreviewKey] = useState(0)

  // Fetch session data and file tree
  useEffect(() => {
    if (!sessionId) return

    fetch(`${API}/api/sessions/${sessionId}`)
      .then(r => r.ok ? r.json() : null)
      .then((data: Session | null) => {
        if (data) {
          setSession(data)
          setBranchName(data.branch ?? null)
          if (data.previewUrl) setPreviewUrl(data.previewUrl)
        }
      })
      .catch(() => {})

    fetch(`${API}/api/sessions/${sessionId}/messages`)
      .then(r => r.ok ? r.json() : null)
      .then(data => data && setMessages(data))
      .catch(() => {})

    fetch(`${API}/api/sessions/${sessionId}/tree`)
      .then(async r => {
        if (!r.ok) {
          const body = await r.text()
          console.error('Tree fetch failed:', r.status, body)
          return null
        }
        return r.json()
      })
      .then(data => {
        if (data) {
          setFiles(data.files)
          setBranchName(data.branch)
          setFilesOpen(true)
        }
        setLoading(false)
      })
      .catch(err => { console.error('Tree fetch error:', err); setLoading(false) })
  }, [sessionId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── GitHub-backed file operations ────────────────────
  async function openFile(path: string) {
    // Check in-memory cache first
    const cached = fileContentsRef.current.get(path)
    if (cached !== undefined) {
      setEditorContent(cached)
      setActiveFilePath(path)
      setSaveStatus(dirtyFiles.has(path) ? 'unsaved' : 'saved')
      setFiles(prev => markActive(prev, path))
      return
    }

    // Fetch from GitHub via backend
    const res = await fetch(`${API}/api/sessions/${sessionId}/file?path=${encodeURIComponent(path)}`)
    if (!res.ok) return
    const data = await res.json()

    fileContentsRef.current.set(path, data.content)
    setFileShas(prev => new Map(prev).set(path, data.sha))
    setEditorContent(data.content)
    setActiveFilePath(path)
    setSaveStatus('saved')
    setFiles(prev => markActive(prev, path))
  }

  const saveFile = useCallback(async () => {
    if (!activeFilePath || !sessionId) return
    setSaveStatus('saving')

    const sha = fileShas.get(activeFilePath)
    const res = await fetch(`${API}/api/sessions/${sessionId}/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: activeFilePath, content: editorContent, sha }),
    })

    if (!res.ok) {
      setSaveStatus('unsaved')
      return
    }

    const data = await res.json()
    setFileShas(prev => new Map(prev).set(activeFilePath, data.sha))
    fileContentsRef.current.set(activeFilePath, editorContent)
    if (data.branch) setBranchName(data.branch)
    setDirtyFiles(prev => { const next = new Set(prev); next.delete(activeFilePath); return next })
    setSaveStatus('saved')
  }, [activeFilePath, sessionId, editorContent, fileShas])

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

  async function handleSend() {
    const text = chatInput.trim()
    if (!text || claudeTyping || !sessionId) return
    setChatInput('')
    setMessages(prev => [...prev, { role: 'user', content: text }])
    setClaudeTyping(true)
    try {
      const res = await fetch(`${API}/api/sessions/${sessionId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
      })
      if (res.ok) {
        const data = await res.json()
        setMessages(prev => [...prev, { role: 'claude', content: data.content }])
        if (data.fileChanges?.length) {
          const changes = data.fileChanges as { path: string; content: string }[]
          let firstPath: string | null = null

          for (const { path, content } of changes) {
            fileContentsRef.current.set(path, content)
            setDirtyFiles(prev => new Set(prev).add(path))

            // Add new files to the tree if not already present
            setFiles(prev => {
              const exists = prev.some(n => n.path === path || (n.children ?? []).some(c => c.path === path))
              if (exists) return prev
              const name = path.split('/').pop() ?? path
              const ext = extFromName(name)
              return [...prev, { name, path, type: 'file', ext }]
            })

            if (!firstPath) firstPath = path
          }

          // Auto-open the first changed file
          if (firstPath) {
            const { content } = changes.find(c => c.path === firstPath)!
            setActiveFilePath(firstPath)
            setEditorContent(content)
            setSaveStatus('unsaved')
            setFiles(prev => markActive(prev, firstPath!))
          }

          const changeMsgs = changes.map(f => ({
            role: 'system' as const,
            content: `Edited ${f.path}`,
          }))
          setMessages(prev => [...prev, ...changeMsgs])
        }
      } else {
        const err = await res.json().catch(() => ({ error: 'Request failed' }))
        setMessages(prev => [...prev, { role: 'system', content: `Error: ${err.error ?? res.statusText}` }])
      }
    } catch {
      setMessages(prev => [...prev, { role: 'system', content: 'Could not reach the server.' }])
    } finally {
      setClaudeTyping(false)
    }
  }

  async function handleSubmit() {
    if (!sessionId) return
    if (dirtyFiles.size > 0) {
      alert('Please save all files before submitting.')
      return
    }
    if (!branchName) {
      alert('No changes have been saved yet.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch(`${API}/api/sessions/${sessionId}/submit`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        setPrUrl(data.pr_url)
        setShowPrModal(true)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const issue = session?.issue
  const usage = session?.usage
  const userInitials = session?.user?.initials ?? '?'
  const activeFileName = activeFilePath?.split('/').pop() ?? 'No file open'
  const activeExt = activeFilePath ? extFromName(activeFilePath) : undefined
  const repoName = issue?.repoName ?? ''
  const treeLoaded = files.length > 0

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
          <Link href="/developer/repos" style={{ color: 'var(--text-3)', textDecoration: 'none' }}>Browse</Link>
          <span>/</span>
          <Link href="/developer/repos/detail" style={{ color: 'var(--text-3)', textDecoration: 'none' }}>{issue?.repoName ?? '…'}</Link>
          <span>/</span>
          <span style={{ color: 'var(--text-1)', fontWeight: 500 }}>
            {issue ? `#${issue.id} · ${issue.title}` : '...'}
          </span>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          {treeLoaded && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--green-bg)', border: '1px solid rgba(52,211,153,0.25)', borderRadius: 5, padding: '0.25rem 0.625rem' }}>
              <span className="live-dot" />
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--green)' }}>
                {branchName ?? session?.defaultBranch ?? 'main'}
              </span>
            </div>
          )}

          {prUrl && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--green-bg)', border: '1px solid rgba(52,211,153,0.25)', borderRadius: 5, padding: '0.25rem 0.625rem' }}>
              <span className="live-dot" />
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--green)' }}>PR Created</span>
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
            <span className="badge badge-muted" style={{ fontSize: '0.6rem', fontFamily: 'var(--font-mono)' }}>{session?.model ?? 'claude-opus-4-6'}</span>
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

            {claudeTyping && (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <div style={{ width: 22, height: 22, borderRadius: 5, background: '#CC785C18', border: '1px solid #CC785C33', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                  <AnthropicMark />
                </div>
                <div className="chat-claude" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.5rem 0.75rem' }}>
                  {[0, 150, 300].map(delay => (
                    <div key={delay} style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--text-3)', animation: 'blink 1.2s ease infinite', animationDelay: `${delay}ms` }} />
                  ))}
                </div>
              </div>
            )}

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
                <button className="btn btn-blue" style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem' }} onClick={handleSend} disabled={claudeTyping}>
                  {claudeTyping ? '...' : 'Send'}
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
            {loading && (
              <div style={{ padding: '1rem 0.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>Loading files...</div>
              </div>
            )}
            {!loading && files.length === 0 && (
              <div style={{ padding: '1rem 0.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>No files found</div>
              </div>
            )}
            {files.map(node => <TreeNode key={node.path} node={node} onFileClick={openFile} />)}
          </div>

          {repoName && (
            <div style={{ padding: '0.5rem 0.75rem', borderTop: '1px solid var(--border)', background: 'var(--bg-0)' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {repoName}
              </div>
            </div>
          )}
          </>)}
        </div>

        {/* ── PANEL 3: Editor ──────────────────────────── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg-0)' }}>

          {/* Toolbar — only show when tree is loaded */}
          {treeLoaded && (
            <div style={{
              height: 38, minHeight: 38,
              background: 'var(--bg-1)', borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', padding: '0 0.875rem', gap: '0.5rem',
            }}>
              {/* View mode tabs */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginRight: '0.5rem' }}>
                <button
                  onClick={() => setViewMode('code')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.35rem',
                    padding: '0.3rem 0.7rem', fontSize: '0.72rem', fontWeight: 600,
                    border: '1px solid var(--border)', borderRight: 'none',
                    borderRadius: '5px 0 0 5px', cursor: 'pointer',
                    background: viewMode === 'code' ? 'var(--bg-0)' : 'transparent',
                    color: viewMode === 'code' ? 'var(--text-1)' : 'var(--text-3)',
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M4 2L1.5 6L4 10M8 2L10.5 6L8 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Code
                </button>
                <button
                  onClick={() => setViewMode('preview')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.35rem',
                    padding: '0.3rem 0.7rem', fontSize: '0.72rem', fontWeight: 600,
                    border: '1px solid var(--border)',
                    borderRadius: '0 5px 5px 0', cursor: 'pointer',
                    background: viewMode === 'preview' ? 'var(--bg-0)' : 'transparent',
                    color: viewMode === 'preview' ? 'var(--text-1)' : 'var(--text-3)',
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <rect x="1" y="2" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.1" fill="none"/>
                    <path d="M1 4.5h10" stroke="currentColor" strokeWidth="1.1"/>
                    <circle cx="2.5" cy="3.25" r="0.5" fill="currentColor"/>
                    <circle cx="4" cy="3.25" r="0.5" fill="currentColor"/>
                  </svg>
                  Preview
                </button>
              </div>

              {/* Active file tab */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.125rem', flex: 1 }}>
                {activeFilePath && viewMode === 'code' && (
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
                {viewMode === 'preview' && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.375rem',
                    padding: '0.25rem 0.75rem',
                    fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {previewUrl ?? (activeFilePath ? activeFilePath.split('/').pop() : 'No file selected')}
                  </div>
                )}
              </div>

              {/* Save button (code mode only) */}
              {viewMode === 'code' && (
                <button
                  className={`btn ${saveStatus === 'unsaved' ? 'btn-blue' : 'btn-ghost'}`}
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem' }}
                  onClick={saveFile}
                  disabled={saveStatus !== 'unsaved'}
                >
                  {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved' : 'Save'}
                </button>
              )}

              {/* Reload preview button (preview mode only) */}
              {viewMode === 'preview' && (previewUrl || activeFilePath) && (
                <button
                  className="btn btn-ghost"
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem' }}
                  onClick={() => setPreviewKey(k => k + 1)}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M1.5 6a4.5 4.5 0 018.3-2.4M10.5 6a4.5 4.5 0 01-8.3 2.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                    <path d="M10 1.5v2.1H7.9M2 10.5V8.4h2.1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Reload
                </button>
              )}

              {/* Open in new tab (preview mode only, external URL) */}
              {viewMode === 'preview' && previewUrl && (
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost"
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                >
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                    <path d="M8.5 6v3a1 1 0 01-1 1H2.5a1 1 0 01-1-1V4a1 1 0 011-1h3M7 1.5h3v3M5 6.5L9.5 2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
              )}
            </div>
          )}

          {/* Loading state */}
          {loading && !treeLoaded && (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-1)' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-2)', marginBottom: '0.375rem' }}>Loading repository...</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>Fetching files from GitHub</div>
              </div>
            </div>
          )}

          {/* Monaco editor — shown in code mode when a file is selected */}
          {treeLoaded && viewMode === 'code' && activeFilePath && (
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <MonacoEditor
                value={editorContent}
                language={langFromPath(activeFilePath)}
                theme="light"
                onChange={val => {
                  const newVal = val ?? ''
                  setEditorContent(newVal)
                  const original = fileContentsRef.current.get(activeFilePath)
                  if (newVal !== original) {
                    setSaveStatus('unsaved')
                    setDirtyFiles(prev => new Set(prev).add(activeFilePath))
                  } else {
                    setSaveStatus('saved')
                    setDirtyFiles(prev => { const next = new Set(prev); next.delete(activeFilePath); return next })
                  }
                }}
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

          {/* Empty state when code mode but no file selected */}
          {treeLoaded && viewMode === 'code' && !activeFilePath && (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-0)' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-2)', marginBottom: '0.375rem' }}>Select a file to edit</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>Choose a file from the tree on the left</div>
              </div>
            </div>
          )}

          {/* Preview iframe — shown in preview mode */}
          {treeLoaded && viewMode === 'preview' && (
            <div style={{ flex: 1, overflow: 'hidden', background: '#fff' }}>
              {previewUrl ? (
                <iframe
                  id="preview-iframe"
                  key={previewKey}
                  src={previewUrl}
                  style={{ width: '100%', height: '100%', border: 'none', background: '#fff' }}
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                  title="Preview"
                />
              ) : activeFilePath ? (
                <iframe
                  id="preview-iframe"
                  key={`${activeFilePath}-${previewKey}`}
                  srcDoc={buildPreviewDoc(editorContent, activeFilePath)}
                  style={{ width: '100%', height: '100%', border: 'none', background: '#fff' }}
                  sandbox="allow-scripts"
                  title="Preview"
                />
              ) : (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'var(--bg-0)' }}>
                  <div style={{ textAlign: 'center', maxWidth: 320 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 12,
                      background: 'var(--bg-2)', border: '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 0.75rem',
                    }}>
                      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                        <rect x="2" y="4" width="18" height="14" rx="2" stroke="var(--text-3)" strokeWidth="1.5" fill="none"/>
                        <path d="M2 8h18" stroke="var(--text-3)" strokeWidth="1.5"/>
                        <circle cx="5" cy="6" r="0.75" fill="var(--text-3)"/>
                        <circle cx="7.5" cy="6" r="0.75" fill="var(--text-3)"/>
                        <circle cx="10" cy="6" r="0.75" fill="var(--text-3)"/>
                      </svg>
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-2)', marginBottom: '0.375rem' }}>
                      Select a file to preview
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', lineHeight: 1.5 }}>
                      Choose a file from the tree on the left to see its preview.
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Status bar */}
          <div style={{
            height: 24, minHeight: 24, background: 'var(--blue-dim)',
            display: 'flex', alignItems: 'center', padding: '0 0.875rem', gap: '1.25rem',
          }}>
            {viewMode === 'code' && activeFilePath && (
              <>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'rgba(255,255,255,0.55)' }}>{langFromPath(activeFilePath)}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'rgba(255,255,255,0.55)' }}>UTF-8</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'rgba(255,255,255,0.55)' }}>
                  {editorContent.length} chars
                </span>
              </>
            )}
            {viewMode === 'preview' && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'rgba(255,255,255,0.55)' }}>
                {previewUrl ? 'Preview deployment' : activeFilePath ? 'File preview' : 'No file selected'}
              </span>
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

      {/* PR Created modal */}
      {showPrModal && prUrl && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: 'var(--bg-1)', border: '1px solid var(--border)',
            borderRadius: 12, padding: '2rem 2.25rem', width: 380,
            textAlign: 'center', animation: 'fadeUp 0.3s cubic-bezier(0.16,1,0.3,1) forwards',
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'var(--green-bg)', border: '1px solid rgba(4,120,87,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem',
            }}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M6 11.5l3.5 3.5L16 7" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-1)', marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>
              PR created!
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Your pull request has been submitted for review.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                className="btn btn-ghost"
                style={{ flex: 1, fontSize: '0.8rem' }}
                onClick={() => setShowPrModal(false)}
              >
                Keep editing
              </button>
              <a
                href={prUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-blue"
                style={{ flex: 1, fontSize: '0.8rem', textDecoration: 'none' }}
              >
                Check out PR
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6h8M6.5 2.5L10 6l-3.5 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Editor() {
  return (
    <Suspense>
      <EditorInner />
    </Suspense>
  )
}
