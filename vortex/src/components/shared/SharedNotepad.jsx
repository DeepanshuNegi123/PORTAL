import { useState, useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import socket from '../../lib/socket'

const COLORS = [
  { id: 'default', bg: 'bg-[#0d0d14]', border: 'border-white/5', label: 'Dark' },
  { id: 'warm',    bg: 'bg-[#1a1208]', border: 'border-yellow-900/30', label: 'Warm' },
  { id: 'cool',    bg: 'bg-[#08121a]', border: 'border-cyan-900/30', label: 'Cool' },
  { id: 'violet',  bg: 'bg-[#110d1a]', border: 'border-violet-900/30', label: 'Violet' },
]

export default function SharedNotepad() {
  const { roomId } = useParams()
  const [text, setText] = useState('')
  const [theme, setTheme] = useState('default')
  const [fontSize, setFontSize] = useState('lg')
  const [wordWrap, setWordWrap] = useState(true)
  const [copied, setCopied] = useState(false)
  const [showMarkdown, setShowMarkdown] = useState(false)
  const textareaRef = useRef(null)

  useEffect(() => {
    const handleUpdate = ({ text: newText }) => {
      setText(newText)
    }
    socket.on('notepad-update', handleUpdate)
    return () => {
      socket.off('notepad-update', handleUpdate)
    }
  }, [])

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0
  const charCount = text.length
  const lineCount = text.split('\n').length

  const currentTheme = COLORS.find(c => c.id === theme)

  const copyAll = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const clearAll = () => {
    setText('')
    socket.emit('notepad-update', { roomId, text: '' })
    textareaRef.current?.focus()
  }

  const insertTimestamp = () => {
    const ts = new Date().toLocaleTimeString()
    const insertion = `[${ts}] `
    const el = textareaRef.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const newText = text.slice(0, start) + insertion + text.slice(end)
    setText(newText)
    socket.emit('notepad-update', { roomId, text: newText })
    setTimeout(() => {
      el.selectionStart = start + insertion.length
      el.selectionEnd = start + insertion.length
      el.focus()
    }, 0)
  }

  const downloadNote = () => {
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `vortex-note-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const fontSizeClass = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
  }[fontSize]

  // Simple markdown-like rendering
  const renderMarkdown = (raw) => {
    return raw
      .split('\n')
      .map((line, i) => {
        if (line.startsWith('# '))
          return <h1 key={i} className="text-2xl font-bold text-white mt-4 mb-2">{line.slice(2)}</h1>
        if (line.startsWith('## '))
          return <h2 key={i} className="text-xl font-bold text-violet-300 mt-3 mb-1">{line.slice(3)}</h2>
        if (line.startsWith('### '))
          return <h3 key={i} className="text-lg font-semibold text-cyan-300 mt-2 mb-1">{line.slice(4)}</h3>
        if (line.startsWith('- ') || line.startsWith('* '))
          return <li key={i} className="text-gray-300 ml-4 list-disc">{line.slice(2)}</li>
        if (line.startsWith('> '))
          return <blockquote key={i} className="border-l-2 border-violet-500 pl-3 text-gray-400 italic my-1">{line.slice(2)}</blockquote>
        if (line === '')
          return <br key={i} />
        return <p key={i} className="text-gray-300 leading-relaxed">{line}</p>
      })
  }

  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden ${currentTheme.bg}`}>

      {/* Header toolbar */}
      <div className={`px-6 py-3 border-b ${currentTheme.border} flex items-center justify-between shrink-0 gap-4`}>

        {/* Left — title + stats */}
        <div className="flex items-center gap-4">
          <div>
            <h1 className="font-bold text-white tracking-wider flex items-center gap-2 text-lg">
              <span className="text-violet-400">📝</span> Shared Notepad
            </h1>
            <p className="text-[15px] text-gray-600 mt-0.5 font-mono">
              {wordCount}w · {charCount}c · {lineCount}L
            </p>
          </div>
        </div>

        {/* Right — controls */}
        <div className="flex items-center gap-2 flex-wrap justify-end">

          {/* Theme picker */}
          <div className="flex items-center gap-1">
            {COLORS.map(c => (
              <button
                key={c.id}
                onClick={() => setTheme(c.id)}
                title={c.label}
                className={`w-4 h-4 rounded-full border transition ${
                  theme === c.id ? 'border-white scale-125' : 'border-transparent hover:scale-110'
                } ${c.bg}`}
                style={{ outline: theme === c.id ? '1px solid rgba(255,255,255,0.3)' : 'none' }}
              />
            ))}
          </div>

          <div className="w-px h-5 bg-white/10" />

          {/* Font size */}
          {['xs', 'sm', 'base', 'lg'].map(f => (
            <button
              key={f}
              onClick={() => setFontSize(f)}
              className={`text-xs px-2 py-1 rounded-lg transition uppercase tracking-widest ${
                fontSize === f
                  ? 'bg-violet-600/30 text-violet-300 border border-violet-500/30'
                  : 'text-gray-600 hover:text-gray-400'
              }`}
            >
              {f}
            </button>
          ))}

          <div className="w-px h-5 bg-white/10" />

          {/* Word wrap */}
          <button
            onClick={() => setWordWrap(w => !w)}
            className={`text-xs px-2 py-1 rounded-lg border transition uppercase tracking-widest ${
              wordWrap
                ? 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10'
                : 'border-white/10 text-gray-600 hover:text-gray-400'
            }`}
          >
            Wrap
          </button>

          {/* Markdown preview */}
          <button
            onClick={() => setShowMarkdown(m => !m)}
            className={`text-xs px-2 py-1 rounded-lg border transition uppercase tracking-widest ${
              showMarkdown
                ? 'border-violet-500/30 text-violet-400 bg-violet-500/10'
                : 'border-white/10 text-gray-600 hover:text-gray-400'
            }`}
          >
            Preview
          </button>

          <div className="w-px h-5 bg-white/10" />

          {/* Actions */}
          <button
            onClick={insertTimestamp}
            className="text-xs px-2 py-1 rounded-lg border border-white/10 text-gray-500 hover:text-gray-300 transition uppercase tracking-widest"
            title="Insert timestamp"
          >
            ⏱
          </button>

          <button
            onClick={copyAll}
            className="text-xs px-2 py-1 rounded-lg border border-white/10 text-gray-500 hover:text-gray-300 transition uppercase tracking-widest"
          >
            {copied ? '✓' : 'Copy'}
          </button>

          <button
            onClick={downloadNote}
            className="text-xs px-2 py-1 rounded-lg border border-white/10 text-gray-500 hover:text-gray-300 transition uppercase tracking-widest"
          >
            ↓ Save
          </button>

          <button
            onClick={clearAll}
            className="text-xs px-2 py-1 rounded-lg border border-red-900/30 text-red-900 hover:text-red-500 transition uppercase tracking-widest"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Sync indicator */}
      <div className={`px-6 py-1.5 border-b ${currentTheme.border} flex items-center gap-2 shrink-0 bg-white/[0.01]`}>
        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        <span className="text-[10px] text-gray-600 uppercase tracking-widest">
          Live sync · changes visible to your friend in real time
        </span>
      </div>

      {/* Editor / Preview */}
      <div className="flex-1 flex overflow-hidden">

        {/* Text editor */}
        <div className={`flex-1 flex flex-col overflow-hidden ${showMarkdown ? 'border-r border-white/5' : ''}`}>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => {
              const val = e.target.value;
              setText(val);
              socket.emit('notepad-update', { roomId, text: val });
            }}
            placeholder={`Start typing...\n\nThis notepad is shared with your friend in real time.\nUse # for headings, - for lists, > for quotes.\n\nTip: Press the ⏱ button to insert a timestamp.`}
            className={`
              flex-1 w-full bg-inherit resize-none  text-gray-200
              placeholder-gray-700 outline-none px-8 py-6 leading-relaxed
              font-roman ${fontSizeClass}
              ${wordWrap ? 'whitespace-pre-wrap' : 'whitespace-pre overflow-x-auto'}
            `}
            spellCheck={true}
          />
        </div>




        {/* Markdown preview */}

        {showMarkdown && (
          <div className="flex-1 overflow-y-auto px-8 py-6">
            <div className={`prose prose-invert max-w-none ${fontSizeClass}`}>
              {text
                ? renderMarkdown(text)
                : <p className="text-gray-700 italic text-sm">Preview will appear here...</p>
              }
            </div>
          </div>
        )}

      </div>

      {/* Bottom bar */}
      <div className={`px-6 py-2 border-t ${currentTheme.border} flex items-center justify-between shrink-0`}>
        <div className="flex items-center gap-4 text-[10px] text-gray-700 font-mono uppercase tracking-widest">
          <span>UTF-8</span>
          <span>Plain Text</span>
          <span>Vortex Notepad</span>
        </div>
        <div className="text-[10px] text-gray-700 font-mono">
          Ln {text.slice(0, textareaRef.current?.selectionStart || 0).split('\n').length}
        </div>
      </div>
    </div>
  )
}