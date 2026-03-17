export default function TransferProgress({ transfer, formatBytes, getFileIcon }) {
  const { name, size, progress, speed, status, direction } = transfer

  return (
    <div className={`
      bg-white/[0.03] border rounded-2xl px-4 py-3 transition-all
      ${status === 'done'
        ? 'border-green-500/20 bg-green-500/5'
        : status === 'error'
        ? 'border-red-500/20'
        : 'border-white/5'
      }
    `}>
      <div className="flex items-center gap-3 mb-2">

        {/* Icon */}
        <span className="text-2xl shrink-0">{getFileIcon(name)}</span>

        {/* Name + size */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white truncate font-medium">{name}</p>
          <p className="text-xs text-gray-600">{formatBytes(size)}</p>
        </div>

        {/* Direction + status */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className={`text-xs uppercase tracking-widest font-bold ${
            direction === 'out' ? 'text-violet-400' : 'text-cyan-400'
          }`}>
            {direction === 'out' ? '↑ Sending' : '↓ Receiving'}
          </span>
          {status === 'done' && (
            <span className="text-xs text-green-400 uppercase tracking-widest">✓ Done</span>
          )}
          {status === 'sending' && (
            <span className="text-xs text-gray-600 font-mono">
              {speed.toFixed(1)} MB/s
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-200 ${
            status === 'done'
              ? 'bg-green-500'
              : 'bg-gradient-to-r from-violet-600 to-cyan-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Channels visualization */}
      {status === 'sending' && (
        <div className="flex items-center gap-2 mt-2">
          <span className="text-[9px] text-gray-700 uppercase tracking-widest">Channels</span>
          <div className="flex gap-1 items-end h-3">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-violet-500/60 rounded-sm animate-pulse"
                style={{
                  height: `${Math.random() * 60 + 40}%`,
                  animationDelay: `${i * 100}ms`
                }}
              />
            ))}
          </div>
          <span className="text-[9px] text-gray-700 ml-auto">{Math.round(progress)}%</span>
        </div>
      )}
    </div>
  )
}