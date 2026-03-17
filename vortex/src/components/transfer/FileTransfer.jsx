import { useState, useRef } from 'react'
import TransferProgress from './TransferProgress'
import FileHistory from './FileHistory'

export default function FileTransfer() {
  const inputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [transfers, setTransfers] = useState([])
  const [history, setHistory] = useState([])

  // Simulate a transfer for UI purposes
  
  const simulateTransfer = (files) => {
    Array.from(files).forEach((file) => {
      const id = Date.now() + Math.random()
      const transfer = {
        id,
        name: file.name,
        size: file.size,
        type: file.type || 'unknown',
        progress: 0,
        speed: 0,
        status: 'sending', // sending | done | error
        direction: 'out',
      }

      setTransfers((prev) => [...prev, transfer])

      // Simulate progress
      let progress = 0
      const interval = setInterval(() => {
        progress += Math.random() * 8 + 2
        const speed = Math.random() * 50 + 10
        if (progress >= 100) {
          progress = 100
          clearInterval(interval)
          setTransfers((prev) =>
            prev.map((t) =>
              t.id === id ? { ...t, progress: 100, status: 'done' } : t
            )
          )
          setHistory((prev) => [
            { ...transfer, progress: 100, status: 'done', time: new Date() },
            ...prev,
          ])
          setTimeout(() => {
            setTransfers((prev) => prev.filter((t) => t.id !== id))
          }, 3000)
        } else {
          setTransfers((prev) =>
            prev.map((t) =>
              t.id === id ? { ...t, progress: Math.min(progress, 100), speed } : t
            )
          )
        }
      }, 200)
    })
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files.length > 0) simulateTransfer(e.dataTransfer.files)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const getFileIcon = (name) => {
    const ext = name.split('.').pop().toLowerCase()
    if (['mp4', 'mkv', 'avi', 'mov', 'webm'].includes(ext)) return '🎬'
    if (['mp3', 'wav', 'flac', 'aac'].includes(ext)) return '🎵'
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return '🖼️'
    if (['zip', 'rar', '7z', 'tar'].includes(ext)) return '📦'
    if (['pdf'].includes(ext)) return '📄'
    if (['exe', 'msi', 'pkg'].includes(ext)) return '⚙️'
    if (['iso', 'bin'].includes(ext)) return '💿'
    return '📁'
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0d0d14]">

      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-white tracking-wider flex items-center gap-2">
              <span className="text-violet-400">⚡</span> Wormhole Transfer
            </h2>
            <p className="text-xs text-gray-600 mt-0.5">
              Direct P2P · No size limit · End-to-end encrypted
            </p>
          </div>
          <button
            onClick={() => inputRef.current?.click()}
            className="bg-violet-600 hover:bg-violet-500 transition px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-widest shadow-lg shadow-violet-900/50"
          >
            + Send File
          </button>
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) =>
              e.target.files.length > 0 && simulateTransfer(e.target.files)
            }
          />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left — Drop zone + Active transfers */}
        <div className="flex-1 flex flex-col overflow-hidden p-6 gap-4">

          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={() => setIsDragging(false)}
            onClick={() => inputRef.current?.click()}
            className={`
              border-2 border-dashed rounded-3xl flex flex-col items-center justify-center
              cursor-pointer transition-all shrink-0 py-10 gap-3
              ${isDragging
                ? 'border-violet-500 bg-violet-500/10 scale-[1.01]'
                : 'border-white/10 hover:border-violet-500/40 hover:bg-white/[0.02]'
              }
            `}
          >
            <div className={`text-5xl transition-transform ${isDragging ? 'scale-125' : ''}`}>
              🌀
            </div>
            <p className="text-gray-400 text-sm uppercase tracking-widest">
              {isDragging ? 'Release to send through wormhole' : 'Drop any file here to send'}
            </p>
            <p className="text-gray-700 text-xs">
              Game files · Videos · Archives · Anything
            </p>

            {/* Fake speed indicators */}
            <div className="flex items-center gap-4 mt-2">
              {['CH-1', 'CH-2', 'CH-3', 'CH-4'].map((ch) => (
                <div key={ch} className="flex flex-col items-center gap-1">
                  <div className="flex gap-0.5 items-end h-4">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-1 rounded-sm ${isDragging ? 'bg-violet-400' : 'bg-white/10'} transition-all`}
                        style={{ height: `${(i + 1) * 20}%` }}
                      />
                    ))}
                  </div>
                  <span className="text-[9px] text-gray-700 uppercase">{ch}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Active transfers */}
          {transfers.length > 0 && (
            <div className="flex flex-col gap-3 overflow-y-auto">
              <p className="text-xs text-gray-500 uppercase tracking-widest">Active Transfers</p>
              {transfers.map((t) => (
                <TransferProgress
                  key={t.id}
                  transfer={t}
                  formatBytes={formatBytes}
                  getFileIcon={getFileIcon}
                />
              ))}
            </div>
          )}

          {/* Empty state */}
          {transfers.length === 0 && (
            <div className="flex flex-col items-center justify-center flex-1 gap-2 opacity-30">
              <p className="text-xs text-gray-500 uppercase tracking-widest">
                No active transfers
              </p>
            </div>
          )}
        </div>

        {/* Right — History */}
        <FileHistory
          history={history}
          formatBytes={formatBytes}
          getFileIcon={getFileIcon}
        />
      </div>
    </div>
  )
}