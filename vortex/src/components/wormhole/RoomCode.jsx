import { useState } from 'react'

export default function RoomCode({ roomId }) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(roomId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareUrl = `${window.location.origin}/base/${roomId}`

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-xs">

      {/* Code display */}
      <div className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 flex flex-col items-center gap-2">
        <span className="text-[10px] text-gray-600 uppercase tracking-widest">
          Wormhole Code
        </span>
        <span className="text-3xl font-black font-mono tracking-widest text-violet-300">
          {roomId}
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 w-full">
        <button
          onClick={copy}
          className="flex-1 bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 rounded-xl py-2 text-xs text-violet-300 font-bold uppercase tracking-widest transition"
        >
          {copied ? '✓ Copied' : 'Copy Code'}
        </button>
        <button
          onClick={copyLink}
          className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-2 text-xs text-gray-400 font-bold uppercase tracking-widest transition"
        >
          Copy Link
        </button>
      </div>

      {/* Share hint */}
      <p className="text-[10px] text-gray-700 text-center uppercase tracking-widest">
        Share this code with your friend to connect
      </p>
    </div>
  )
}