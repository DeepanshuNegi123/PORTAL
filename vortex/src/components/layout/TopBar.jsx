import { useState } from 'react'

export default function TopBar({ roomId, username, onLeave , friendName, isLeader ,connected}) {
  const [copied, setCopied] = useState(false)

  const copyCode = () => {
    navigator.clipboard.writeText(roomId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000) // after 2 secs setcopy is turned to false .
  }

  return (
    <header className="h-14 bg-[#0a0a0f] border-b border-white/5 flex items-center justify-between px-6 shrink-0">

      {/* Left — Logo */}
      <div className="flex items-center gap-3">
        <span className="text-2xl">🌀</span>
        <span className="font-black tracking-widest text-lg text-white">
          VORTEX
        </span>
      </div>

      {/* Center — Room Code */}
      <button
        onClick={copyCode}
        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-1.5 transition group"
      >
        <span className="text-xs text-gray-400 uppercase tracking-widest">Wormhole</span>
        <span className="font-mono font-bold text-violet-300 tracking-widest">{roomId}</span>
        <span className="text-xs text-gray-600 group-hover:text-gray-400 transition">
          {copied ? '✓ Copied' : 'Copy'}
        </span>
      </button>

      {/* Right — User + Status + Leave */}
      <div className="flex items-center gap-4">

        {/* Connection status */}
     { !connected&&  <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
          <span className="text-xs text-gray-400">Waiting for friend...</span>
        </div>
}
{/* if connection is successful */}

{connected && <div className='flex items-center gap-2'>
<div className='w-2 h-2 rounded-full bg-green-400 animate-pulse'>
</div>
<span className='text-xs text-gray-400'>{`${friendName} is online`}</span>
</div>
}




        {/* Username */}
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5">
          <span className="text-yellow-400 text-sm">👑</span>
          <span className="text-sm font-medium text-gray-200">{username}</span>
        </div>


        {/* Leave */}
        <button
          onClick={onLeave}
          className="text-xs text-gray-600 hover:text-red-400 transition uppercase tracking-widest"
        >
          ✕ Leave
        </button>
      </div>
    </header>
  )
}