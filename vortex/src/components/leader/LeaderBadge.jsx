export default function LeaderBadge({ isLeader, username, friendName }) {
  return (
    
    <div className={`
      flex flex-col items-center gap-1 px-3 py-2  w-full transition-all duration-300 ease-out
      ${isLeader
        ? 'bg-yellow-500/10 '
        : 'bg-white/5 border-white/5'
      }
    `}>

      <span className="text-xl">{isLeader ? '👑' : '👤'}</span>
      <span className={`text-[9px] uppercase tracking-widest font-bold ${
        isLeader ? 'text-yellow-400' : 'text-gray-600'
      }`}>
        {isLeader ? 'Leader' : 'Member'}
      </span>
      <span className="text-[9px] text-gray-600 truncate max-w-[60px] text-center">
        {isLeader ? 'You' : friendName || '...'}
      </span>
    </div>
  )
}