const formatTime = (secs) => {
  if (isNaN(secs)) return '0:00'
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = Math.floor(secs % 60)
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function PlayerControls({
  playing, currentTime, duration, volume, muted,
  onTogglePlay, onSeek, onVolume, onMute,
  onSkipForward, onSkipBackward, onFullscreen,
  onNext, onPrev,
  hasNext, hasPrev
}) {
  const progress = duration ? (currentTime / duration) * 100 : 0

  return (
    <div className="bg-gradient-to-t from-black/95 via-black/70 to-transparent px-4 pt-8 pb-4">

      {/* Seek bar */}
      <div className="relative group mb-3">
        <div className="h-1 bg-white/10 rounded-full cursor-pointer group-hover:h-2 transition-all">
          <div
            className="h-full bg-violet-500 rounded-full relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition shadow-lg" />
          </div>
        </div>
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={currentTime}
          onChange={(e) => onSeek(parseFloat(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
        />
      </div>

      {/* Controls row */}
      <div className="flex items-center justify-between">

        {/* Left controls */}
        <div className="flex items-center gap-3">

          {/* Prev */}
          <button
            onClick={onPrev}
            disabled={!hasPrev}
            className="text-gray-400 hover:text-white disabled:opacity-20 transition text-lg"
          >
            ⏮
          </button>

          {/* Skip back */}
          <button onClick={onSkipBackward} className="text-gray-400 hover:text-white transition text-sm">
            ⏪ 10s
          </button>

          {/* Play/Pause */}
          <button
            onClick={onTogglePlay}
            className="w-10 h-10 bg-violet-600 hover:bg-violet-500 rounded-full flex items-center justify-center transition shadow-lg shadow-violet-900"
          >
            {playing ? '⏸' : '▶'}
          </button>

          {/* Skip forward */}
          <button onClick={onSkipForward} className="text-gray-400 hover:text-white transition text-sm">
            10s ⏩
          </button>

          {/* Next */}
          <button
            onClick={onNext}
            disabled={!hasNext}
            className="text-gray-400 hover:text-white disabled:opacity-20 transition text-lg"
          >
            ⏭
          </button>

          {/* Time */}
          <span className="text-xs text-gray-400 font-mono ml-2">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3">


          {/* Volume */}
          <div className="flex items-center gap-2">
            <button onClick={onMute} className="text-gray-400 hover:text-white transition">
              {muted || volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={(e) => onVolume(parseFloat(e.target.value))}
              className="w-20 accent-violet-500"
            />
          </div>

          {/* Fullscreen */}
          <button onClick={onFullscreen} className="text-gray-400 hover:text-white transition">
            ⛶
          </button>
        </div>
      </div>
    </div>
  )
}