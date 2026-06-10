import { useState, useRef } from 'react'

const CATEGORIES = ['all', 'text', 'image', 'link', 'code']

export default function SharedClipboard() {
  const [items, setItems] = useState([])
  const [input, setInput] = useState('')
  const [category, setCategory] = useState('all')
  const [copiedId, setCopiedId] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)

  

  const detectType = (text) => {
    if (/^https?:\/\//.test(text.trim())) return 'link'
    if (/^[\s\S]*[{}\[\]();][\s\S]*$/.test(text) && text.includes('\n')) return 'code'
    return 'text'
  }



  const addItem = (content, type = null, imageUrl = null) => {
    const item = {
      id: Date.now(),
      content,
      type: type || detectType(content),
      imageUrl,
      time: new Date(),
      pinned: false,
      from: 'you',
    }
    setItems(prev => [item, ...prev])
    setInput('')
  }

  const handlePaste = (e) => {
    const text = e.clipboardData.getData('text')
    const imageFile = Array.from(e.clipboardData.items).find(i => i.type.startsWith('image/'))
    if (imageFile) {
      const file = imageFile.getAsFile()
      const url = URL.createObjectURL(file)
      addItem('Pasted image', 'image', url)
      e.preventDefault()
      return
    }
    if (text) setInput(text)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const text = e.dataTransfer.getData('text')
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      addItem(file.name, 'image', url)
    } else if (text) {
      addItem(text)
    }
  }

  const handleImageFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    addItem(file.name, 'image', url)
  }

  const copyItem = (item) => {
    navigator.clipboard.writeText(item.content)
    setCopiedId(item.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const deleteItem = (id) => setItems(prev => prev.filter(i => i.id !== id))

  const togglePin = (id) => {
    setItems(prev =>
      prev.map(i => i.id === id ? { ...i, pinned: !i.pinned } : i)
    )
  }

  const filtered = [...items]
    .sort((a, b) => b.pinned - a.pinned)
    .filter(i => category === 'all' || i.type === category)

  const typeIcon = { text: '📄', image: '🖼️', link: '🔗', code: '💻' }
  const typeColor = {
    text: 'text-gray-400',
    image: 'text-cyan-400',
    link: 'text-blue-400',
    code: 'text-green-400',
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0d0d14]">

      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-white tracking-wider flex items-center gap-2 text-sm">
              <span className="text-cyan-400">📋</span> Shared Clipboard
            </h2>
            <p className="text-xs text-gray-600 mt-0.5">
              Anything you add appears on your friend's screen instantly
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs px-3 py-1.5 rounded-xl border border-white/10 text-gray-500 hover:text-gray-300 transition uppercase tracking-widest"
            >
              + Image
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageFile}
            />
          </div>
        </div>
      </div>

      {/* Input area */}
      <div
        className={`px-6 py-4 border-b border-white/5 shrink-0 transition-all ${
          dragOver ? 'bg-cyan-500/5' : ''
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
      >
        <div className="flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPaste={handlePaste}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && input.trim()) {
                e.preventDefault()
                addItem(input.trim())
              }
            }}
            placeholder="Paste or type anything — text, links, code... (Enter to send, Shift+Enter for new line)"
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-700 outline-none focus:border-cyan-500/50 resize-none transition font-mono"
            rows={2}
          />
          <button
            onClick={() => input.trim() && addItem(input.trim())}
            disabled={!input.trim()}
            className="px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-20 disabled:cursor-not-allowed transition font-bold text-sm shadow-lg shadow-cyan-900/30"
          >
            Send
          </button>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
          <span className="text-[10px] text-gray-600 uppercase tracking-widest">
            Live sync · drop images or paste screenshots directly
          </span>
        </div>
      </div>

      {/* Category filter */}
      <div className="px-6 py-2 border-b border-white/5 flex items-center gap-2 shrink-0">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`text-xs px-3 py-1 rounded-lg transition uppercase tracking-widest ${
              category === cat
                ? 'bg-white/10 text-white'
                : 'text-gray-600 hover:text-gray-400'
            }`}
          >
            {cat}
            {cat !== 'all' && (
              <span className="ml-1 text-[9px] opacity-50">
                ({items.filter(i => i.type === cat).length})
              </span>
            )}
          </button>
        ))}
        {items.length > 0 && (
          <button
            onClick={() => setItems([])}
            className="ml-auto text-xs text-red-900 hover:text-red-500 transition uppercase tracking-widest"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Items list */}
      <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3">

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center flex-1 gap-3 opacity-20">
            <span className="text-4xl">📋</span>
            <p className="text-xs text-gray-500 uppercase tracking-widest text-center">
              {items.length === 0 ? 'Clipboard is empty' : 'Nothing in this category'}
            </p>
          </div>
        )}

        {filtered.map(item => (
          <div
            key={item.id}
            className={`group bg-white/[0.03] border rounded-2xl overflow-hidden transition-all ${
              item.pinned
                ? 'border-yellow-500/20 bg-yellow-500/5'
                : 'border-white/5 hover:border-white/10'
            }`}
          >
            {/* Item header */}
            <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5">
              <span className={`text-xs ${typeColor[item.type]}`}>
                {typeIcon[item.type]} {item.type}
              </span>
              <span className="text-[10px] text-gray-700 ml-auto font-mono">
                {item.from === 'you' ? '↑ You' : '↓ Friend'} ·{' '}
                {item.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              {item.pinned && <span className="text-yellow-500 text-xs">📌</span>}
            </div>

            {/* Item content */}
            <div className="px-4 py-3">
              {item.type === 'image' && item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt="clipboard"
                  className="max-h-40 rounded-lg object-contain"
                />
              ) : item.type === 'code' ? (
                <pre className="text-xs text-green-300 font-mono whitespace-pre-wrap overflow-x-auto max-h-32 overflow-y-auto">
                  {item.content}
                </pre>
              ) : item.type === 'link' ? (
                <a
                  href={item.content}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-sm underline underline-offset-2 break-all transition"
                >
                  {item.content}
                </a>
              ) : (
                <p className="text-sm text-gray-300 whitespace-pre-wrap break-words max-h-24 overflow-y-auto leading-relaxed">
                  {item.content}
                </p>
              )}
            </div>

            {/* Item actions */}
            <div className="flex items-center gap-2 px-4 py-2 border-t border-white/5 opacity-0 group-hover:opacity-100 transition">
              <button
                onClick={() => copyItem(item)}
                className="text-[10px] text-gray-500 hover:text-white transition uppercase tracking-widest"
              >
                {copiedId === item.id ? '✓ Copied' : 'Copy'}
              </button>
              <button
                onClick={() => togglePin(item.id)}
                className={`text-[10px] transition uppercase tracking-widest ${
                  item.pinned
                    ? 'text-yellow-500'
                    : 'text-gray-500 hover:text-yellow-500'
                }`}
              >
                {item.pinned ? 'Unpin' : 'Pin'}
              </button>
              <button
                onClick={() => deleteItem(item.id)}
                className="text-[10px] text-gray-700 hover:text-red-500 transition uppercase tracking-widest ml-auto"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}