import { useRef } from 'react'

export default function Playlist({ playlist, activeIndex, onSelect, onAdd }) {
  const inputRef = useRef(null)

  return (
    <div className="w-64 bg-[#0a0a0f] border-l border-white/5 flex flex-col shrink-0">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <span className="text-xs uppercase tracking-widest text-gray-400">Playlist</span>
        <button
          onClick={() => inputRef.current?.click()}
          className="text-xs text-violet-400 hover:text-violet-300 transition uppercase tracking-widest"
        >
          + Add
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files.length > 0 && onAdd(e.target.files)}
        />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {playlist.map((item, i) => (
          <button
            key={i}
            onClick={() => onSelect(i)}
            className={`w-full text-left px-4 py-3 border-b border-white/5 transition flex items-center gap-3 group ${
              i === activeIndex
                ? 'bg-violet-600/20 text-white'
                : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'
            }`}
          >
            <span className="text-lg shrink-0">
              {i === activeIndex ? '▶' : '○'}
            </span>
            <span className="text-xs truncate">{item.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}