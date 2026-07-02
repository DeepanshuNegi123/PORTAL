export default function FileHistory({ history, formatBytes, getFileIcon }) {
  return (
    <div className="w-72 border-l border-white/5 flex flex-col shrink-0">

      {/* Header */}
      <div className="px-4 py-3 border-b border-white/5 shrink-0">
        <p className="text-xs text-gray-400 uppercase tracking-widest">Session History</p>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {history.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-2 opacity-20">
            <span className="text-3xl">📭</span>
            <p className="text-xs text-gray-500 uppercase tracking-widest text-center">
              No files transferred yet
            </p>
          </div>
        )}

        {history.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-4 py-3 border-b border-white/5 hover:bg-white/[0.02] transition"
          >
            <span className="text-xl shrink-0">{getFileIcon(item.name)}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-300 truncate">{item.name}</p>
              <p className="text-[10px] text-gray-600">{formatBytes(item.size)}</p>
            </div>
            <div className="flex flex-col items-end gap-0.5 shrink-0">
              <span className={`text-[10px] uppercase tracking-widest ${
                item.direction === 'out' ? 'text-violet-400' : 'text-cyan-400'
              }`}>
                {item.direction === 'out' ? 'Sent' : 'Recv'}
              </span>
              <span className="text-[10px] text-gray-700">
                {item.time?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              {item.downloadUrl && (
                <a
                  href={item.downloadUrl}
                  download={item.name}
                  className="text-[10px] text-green-400 hover:underline uppercase tracking-wider mt-1"
                >
                  Save
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer stats */}
      {history.length > 0 && (
        <div className="px-4 py-3 border-t border-white/5 shrink-0">
          <div className="flex justify-between text-[10px] text-gray-600 uppercase tracking-widest">
            <span>{history.length} file{history.length > 1 ? 's' : ''}</span>
            <span>
              {formatBytes(history.reduce((acc, h) => acc + h.size, 0))} total
            </span>
          </div>
        </div>
      )}
    </div>
  )
}