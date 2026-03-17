export default function ConnectionStatus({ connected, friendName, roomId }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">

      {/* Status dot + label */}
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${
          connected ? 'bg-green-400' : 'bg-yellow-400 animate-pulse'
        }`} />
        <span className={`text-sm font-bold uppercase tracking-widest ${
          connected ? 'text-green-400' : 'text-yellow-400'
        }`}>
          {connected ? 'Wormhole Active' : 'Waiting for friend...'}
        </span>
      </div>

      {/* Friend name */}
      {connected && friendName && (
        <p className="text-gray-400 text-xs">
          <span className="text-violet-300 font-bold">{friendName}</span> has entered the wormhole
        </p>
      )}

      {/* Room code */}
      <p className="text-gray-700 text-xs font-mono uppercase tracking-widest mt-1">
        Room · {roomId}
      </p>
    </div>
  )
}