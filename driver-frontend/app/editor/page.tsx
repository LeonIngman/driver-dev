import Link from 'next/link'

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

/* ── Mock file tree ──────────────────────────────── */
type FileNode = { name: string; type: 'file' | 'folder'; active?: boolean; children?: FileNode[]; ext?: string }

const fileTree: FileNode[] = [
  {
    name: 'src', type: 'folder', children: [
      { name: 'client', type: 'folder', children: [
        { name: 'streaming.ts', type: 'file', active: true, ext: 'ts' },
        { name: 'retry.ts', type: 'file', ext: 'ts' },
        { name: 'index.ts', type: 'file', ext: 'ts' },
      ]},
      { name: 'types', type: 'folder', children: [
        { name: 'messages.ts', type: 'file', ext: 'ts' },
        { name: 'common.ts', type: 'file', ext: 'ts' },
      ]},
      { name: 'utils.ts', type: 'file', ext: 'ts' },
    ],
  },
  { name: 'tests', type: 'folder', children: [
    { name: 'streaming.test.ts', type: 'file', ext: 'ts' },
  ]},
  { name: 'package.json', type: 'file', ext: 'json' },
  { name: 'tsconfig.json', type: 'file', ext: 'json' },
]

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

function TreeNode({ node, depth = 0 }: { node: FileNode; depth?: number }) {
  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.28rem 0.5rem',
          paddingLeft: `${0.5 + depth * 1}rem`,
          borderRadius: 5,
          cursor: 'pointer',
          background: node.active ? 'var(--blue-bg)' : 'transparent',
          transition: 'background 0.1s',
          fontSize: '0.78rem',
          color: node.active ? 'var(--blue)' : 'var(--text-2)',
          fontFamily: node.type === 'file' ? 'var(--font-mono)' : undefined,
        }}
      >
        {node.type === 'folder' ? <FolderIcon /> : <FileIcon ext={node.ext} />}
        <span>{node.name}</span>
      </div>
      {node.children?.map(child => (
        <TreeNode key={child.name} node={child} depth={depth + 1} />
      ))}
    </>
  )
}

/* ── Mock messages ───────────────────────────────── */
const messages = [
  {
    role: 'claude',
    content: `I've opened issue #384: **Fix race condition in streaming response handler**.

Looking at the code, the issue occurs in \`src/client/streaming.ts\` when multiple concurrent streams try to write to the shared \`buffer\` without proper synchronization.

I'll fix this by introducing a per-stream lock using an \`AsyncMutex\` pattern.`,
  },
  {
    role: 'user',
    content: 'Looks good. Also make sure the fix handles the case where a stream is aborted mid-flight.',
  },
  {
    role: 'claude',
    content: `Good call. I've updated the fix to handle abort signals — when a stream is aborted, we now release the mutex immediately and clean up any partial buffer state to avoid a deadlock.

Changes made to \`streaming.ts\`:
- Added \`AsyncMutex\` class with FIFO queue
- Wrapped buffer writes in \`mutex.acquire()\` / \`release()\`
- Added \`AbortSignal\` listener that calls \`mutex.release()\` on abort

Running the test suite now…`,
  },
  {
    role: 'system',
    content: '✓ 47 tests passed  ·  0 failed  ·  Build successful',
  },
  {
    role: 'user',
    content: 'Perfect. Submit for review.',
  },
]

/* ── Code content (syntax-colored) ──────────────── */
function CodeEditor() {
  const lines = [
    { n: 1,  content: <span className="syn-cmt">// src/client/streaming.ts</span> },
    { n: 2,  content: <></> },
    { n: 3,  content: <><span className="syn-kw">import</span><span className="syn-var"> &#123; EventEmitter &#125; </span><span className="syn-kw">from</span><span className="syn-str"> &apos;events&apos;</span></> },
    { n: 4,  content: <><span className="syn-kw">import</span><span className="syn-var"> &#123; AsyncMutex &#125; </span><span className="syn-kw">from</span><span className="syn-str"> &apos;../utils&apos;</span></> },
    { n: 5,  content: <></> },
    { n: 6,  content: <><span className="syn-kw">export class </span><span className="syn-type">StreamingHandler </span><span className="syn-kw">extends </span><span className="syn-type">EventEmitter </span><span className="syn-punc">&#123;</span></> },
    { n: 7,  content: <><span className="syn-kw">  private </span><span className="syn-var">buffer</span><span className="syn-punc">: </span><span className="syn-type">string</span><span className="syn-punc">[] = []</span></> },
    { n: 8,  content: <><span className="syn-kw">  private </span><span className="syn-var">mutex</span><span className="syn-punc"> = </span><span className="syn-kw">new </span><span className="syn-fn">AsyncMutex</span><span className="syn-punc">()</span></> },
    { n: 9,  content: <><span className="syn-kw">  private </span><span className="syn-var">aborted</span><span className="syn-punc"> = </span><span className="syn-kw">false</span></> },
    { n: 10, content: <></> },
    { n: 11, content: <><span className="syn-fn">  async write</span><span className="syn-punc">(</span><span className="syn-var">chunk</span><span className="syn-punc">: </span><span className="syn-type">string</span><span className="syn-punc">, </span><span className="syn-var">signal</span><span className="syn-punc">?: </span><span className="syn-type">AbortSignal</span><span className="syn-punc">): </span><span className="syn-type">Promise</span><span className="syn-punc">&lt;</span><span className="syn-type">void</span><span className="syn-punc">&gt; &#123;</span></> },
    { n: 12, content: <><span className="syn-kw">    if </span><span className="syn-punc">(</span><span className="syn-kw">this</span><span className="syn-punc">.</span><span className="syn-var">aborted</span><span className="syn-punc">) </span><span className="syn-kw">return</span></> },
    { n: 13, content: <></> },
    { n: 14, content: <><span className="syn-kw">    const </span><span className="syn-var">release </span><span className="syn-punc">= </span><span className="syn-kw">await </span><span className="syn-kw">this</span><span className="syn-punc">.</span><span className="syn-var">mutex</span><span className="syn-punc">.</span><span className="syn-fn">acquire</span><span className="syn-punc">()</span></> },
    { n: 15, content: <></> },
    { n: 16, content: <><span className="syn-cmt">    // Release immediately if abort was signalled</span></> },
    { n: 17, content: <><span className="syn-var">    signal</span><span className="syn-punc">?.</span><span className="syn-fn">addEventListener</span><span className="syn-punc">(</span><span className="syn-str">&apos;abort&apos;</span><span className="syn-punc">, () =&gt; &#123;</span></> },
    { n: 18, content: <><span className="syn-kw">      this</span><span className="syn-punc">.</span><span className="syn-var">aborted </span><span className="syn-punc">= </span><span className="syn-kw">true</span></> },
    { n: 19, content: <><span className="syn-kw">      this</span><span className="syn-punc">.</span><span className="syn-var">buffer </span><span className="syn-punc">= []</span></> },
    { n: 20, content: <><span className="syn-fn">      release</span><span className="syn-punc">()</span></> },
    { n: 21, content: <><span className="syn-punc">    &#125;, &#123; </span><span className="syn-var">once</span><span className="syn-punc">: </span><span className="syn-kw">true </span><span className="syn-punc">&#125;)</span></> },
    { n: 22, content: <></> },
    { n: 23, content: <><span className="syn-kw">    try </span><span className="syn-punc">&#123;</span></> },
    { n: 24, content: <><span className="syn-kw">      this</span><span className="syn-punc">.</span><span className="syn-var">buffer</span><span className="syn-punc">.</span><span className="syn-fn">push</span><span className="syn-punc">(</span><span className="syn-var">chunk</span><span className="syn-punc">)</span></> },
    { n: 25, content: <><span className="syn-kw">      this</span><span className="syn-punc">.</span><span className="syn-fn">emit</span><span className="syn-punc">(</span><span className="syn-str">&apos;data&apos;</span><span className="syn-punc">, </span><span className="syn-var">chunk</span><span className="syn-punc">)</span></> },
    { n: 26, content: <><span className="syn-punc">    &#125; </span><span className="syn-kw">finally </span><span className="syn-punc">&#123;</span></> },
    { n: 27, content: <><span className="syn-fn">      release</span><span className="syn-punc">()</span></> },
    { n: 28, content: <><span className="syn-punc">    &#125;</span></> },
    { n: 29, content: <><span className="syn-punc">  &#125;</span></> },
    { n: 30, content: <><span className="syn-punc">&#125;</span></> },
  ]

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '1rem 0', background: 'var(--bg-0)' }}>
      {lines.map(line => (
        <div
          key={line.n}
          style={{
            display: 'flex',
            background: [14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28].includes(line.n)
              ? 'rgba(59,130,246,0.04)' : 'transparent',
            borderLeft: [14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28].includes(line.n)
              ? '2px solid rgba(59,130,246,0.35)' : '2px solid transparent',
          }}
        >
          <span style={{ width: 42, flexShrink: 0, textAlign: 'right', paddingRight: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-3)', lineHeight: '1.6rem', userSelect: 'none' }}>
            {line.n}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', lineHeight: '1.6rem', whiteSpace: 'pre', color: 'var(--text-1)' }}>
            {line.content}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function Editor() {
  return (
    <div style={{ display: 'flex', height: '100vh', flexDirection: 'column', background: 'var(--bg-0)', overflow: 'hidden' }}>

      {/* Global top bar */}
      <div style={{
        height: 44,
        minHeight: 44,
        background: 'var(--bg-1)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 1rem',
        gap: '1rem',
        zIndex: 10,
      }}>
        <Logo />

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--text-3)', marginLeft: '0.5rem' }}>
          <Link href="/repos" style={{ color: 'var(--text-3)', textDecoration: 'none' }}>Browse</Link>
          <span>/</span>
          <Link href="/repos/detail" style={{ color: 'var(--text-3)', textDecoration: 'none' }}>claude-tools</Link>
          <span>/</span>
          <span style={{ color: 'var(--text-1)', fontWeight: 500 }}>#384 · Fix race condition in streaming handler</span>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          {/* Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--green-bg)', border: '1px solid rgba(52,211,153,0.25)', borderRadius: 5, padding: '0.25rem 0.625rem' }}>
            <span className="live-dot" />
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--green)' }}>Preview live</span>
          </div>

          {/* Submit */}
          <button className="btn btn-orange" style={{ padding: '0.4rem 0.875rem', fontSize: '0.78rem' }}>
            Submit for Review
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6h8M6.5 2.5L10 6l-3.5 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.58rem', fontWeight: 700, color: '#fff' }}>JK</span>
          </div>
        </div>
      </div>

      {/* Main 3-panel area */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── PANEL 1: Chat ──────────────────────────── */}
        <div style={{
          width: 340,
          minWidth: 340,
          background: 'var(--bg-1)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Chat header */}
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AnthropicMark />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-1)' }}>Claude</div>
            </div>
            <span className="badge badge-muted" style={{ fontSize: '0.6rem', fontFamily: 'var(--font-mono)' }}>claude-3-7-sonnet</span>
          </div>

          {/* Issue context pill */}
          <div style={{ padding: '0.625rem 0.875rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-0)' }}>
            <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 7, padding: '0.5rem 0.75rem' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 700, marginBottom: '0.25rem' }}>Active issue</div>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-1)', lineHeight: 1.3, marginBottom: '0.25rem' }}>
                #384 · Fix race condition in streaming response handler
              </div>
              <div style={{ display: 'flex', gap: '0.3rem' }}>
                <span className="badge badge-red" style={{ fontSize: '0.58rem' }}>bug</span>
                <span className="badge badge-orange" style={{ fontSize: '0.58rem' }}>P1</span>
                <span className="badge badge-green" style={{ fontSize: '0.58rem', marginLeft: 'auto' }}>$450</span>
              </div>
            </div>
          </div>

          {/* Messages */}
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

            {/* Typing indicator */}
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
          </div>

          {/* Chat input */}
          <div style={{ padding: '0.75rem', borderTop: '1px solid var(--border)', background: 'var(--bg-1)' }}>
            <div style={{ background: 'var(--bg-0)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
              <textarea
                placeholder="Ask Claude to adjust the fix…"
                rows={3}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  padding: '0.625rem 0.75rem',
                  color: 'var(--text-1)',
                  fontSize: '0.825rem',
                  resize: 'none',
                  fontFamily: 'var(--font-body)',
                  lineHeight: 1.5,
                }}
              />
              <div style={{ padding: '0.375rem 0.625rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: '0.2rem', display: 'flex', alignItems: 'center' }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1.5v11M1.5 7h11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
                  </button>
                </div>
                <button className="btn btn-blue" style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem' }}>
                  Send
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                    <path d="M1.5 5.5h8M6 2l3.5 3.5L6 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
            <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.67rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
                Using your API key · ~2,400 tokens
              </span>
              <span style={{ fontSize: '0.67rem', color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>≈ $0.007</span>
            </div>
          </div>
        </div>

        {/* ── PANEL 2: File tree ─────────────────────── */}
        <div style={{
          width: 200,
          minWidth: 200,
          background: 'var(--bg-1)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{ padding: '0.625rem 0.75rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Files</span>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              {/* Changed files badge */}
              <span className="badge badge-blue" style={{ fontSize: '0.58rem' }}>1 changed</span>
            </div>
          </div>

          {/* Tree */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0.375rem' }}>
            {fileTree.map(node => <TreeNode key={node.name} node={node} />)}
          </div>

          {/* Diff summary */}
          <div style={{ padding: '0.625rem 0.75rem', borderTop: '1px solid var(--border)', background: 'var(--bg-0)' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-3)', marginBottom: '0.375rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Diff summary</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--green)' }}>+24</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--red)' }}>-3</span>
              <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'var(--border)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '89%', background: 'var(--green)', borderRadius: 2 }} />
              </div>
            </div>
          </div>
        </div>

        {/* ── PANEL 3: Editor / Preview ─────────────── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg-0)' }}>

          {/* Editor toolbar */}
          <div style={{
            height: 38,
            minHeight: 38,
            background: 'var(--bg-1)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 0.875rem',
            gap: '0.5rem',
          }}>
            {/* Tabs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.125rem', flex: 1 }}>
              {[
                { name: 'streaming.ts', active: true, dot: 'lang-ts', changed: true },
              ].map(tab => (
                <div
                  key={tab.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '5px 5px 0 0',
                    background: tab.active ? 'var(--bg-0)' : 'transparent',
                    borderBottom: tab.active ? '2px solid var(--blue)' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  <span className={`lang-dot ${tab.dot}`} style={{ width: 7, height: 7 }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: tab.active ? 'var(--text-1)' : 'var(--text-3)' }}>
                    {tab.name}
                  </span>
                  {tab.changed && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--orange)' }} />}
                </div>
              ))}
            </div>

            {/* Code / Preview toggle */}
            <div style={{ display: 'flex', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 6, padding: 2 }}>
              {['Code', 'Preview'].map((v, i) => (
                <button
                  key={v}
                  style={{
                    padding: '0.2rem 0.625rem',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                    background: i === 0 ? 'var(--bg-1)' : 'transparent',
                    color: i === 0 ? 'var(--text-1)' : 'var(--text-3)',
                    fontFamily: 'var(--font-body)',
                    transition: 'all 0.1s',
                  }}
                >
                  {v}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.375rem' }}>
              <button className="btn btn-ghost" style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem' }}>
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M1 5.5h9M6.5 2L10 5.5 6.5 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Run tests
              </button>
            </div>
          </div>

          {/* Code area */}
          <CodeEditor />

          {/* Status bar */}
          <div style={{
            height: 24,
            minHeight: 24,
            background: 'var(--blue-dim)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 0.875rem',
            gap: '1.25rem',
          }}>
            {[
              { label: 'TypeScript' },
              { label: 'UTF-8' },
              { label: 'LF' },
              { label: 'Ln 17, Col 5' },
              { label: '2 spaces' },
            ].map(item => (
              <span key={item.label} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'rgba(255,255,255,0.55)' }}>
                {item.label}
              </span>
            ))}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <span className="live-dot" style={{ width: 5, height: 5 }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'rgba(255,255,255,0.7)' }}>
                Preview syncing
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
