import { useState } from 'react'

export default function TransferLeader({ isLeader, friendName, onTransfer, onRequest }) {
  const [confirming, setConfirming] = useState(false)
  const [requested, setRequested] = useState(false)

  const handleTransfer = () => {
    if (!confirming) return setConfirming(true)
    onTransfer?.()
    setConfirming(false)
  }

  const handleRequest = () => {
    setRequested(true)
    onRequest?.()
    setTimeout(() => setRequested(false), 3000)
  }

  if (!friendName) return (
    <div className="px-3 py-2 text-[10px] text-gray-700 uppercase tracking-widest text-center">
      Waiting for<br />friend...
    </div>
  )

  return (
    <div className="flex flex-col gap-2 w-full px-2">
      {isLeader ? (
        <>
          <button
            onClick={handleTransfer}
            className={`w-full text-[10px] uppercase tracking-widest py-2 px-2 rounded-xl border transition text-center ${
              confirming
                ? 'border-yellow-500/50 text-yellow-400 bg-yellow-500/10'
                : 'border-white/10 text-gray-600 hover:text-yellow-400 hover:border-yellow-500/30'
            }`}
          >
            {confirming ? `Give to ${friendName}?` : '👑 Pass Crown'}
          </button>
          {confirming && (
            <button
              onClick={() => setConfirming(false)}
              className="w-full text-[10px] uppercase tracking-widest py-1 px-2 rounded-xl text-gray-700 hover:text-gray-400 transition text-center"
            >
              Cancel
            </button>
          )}
        </>
      ) : (
        <button
          onClick={handleRequest}
          disabled={requested}
          className={`w-full text-[10px] uppercase tracking-widest py-2 px-2 rounded-xl border transition text-center ${
            requested
              ? 'border-violet-500/30 text-violet-400 bg-violet-500/10'
              : 'border-white/10 text-gray-600 hover:text-violet-400 hover:border-violet-500/30'
          }`}
        >
          {requested ? '✓ Requested' : '⬆ Request Crown'}
        </button>
      )}
    </div>
  )
}