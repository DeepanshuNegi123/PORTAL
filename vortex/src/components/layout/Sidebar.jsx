import LeaderBadge from '../leader/LeaderBadge'
import TransferLeader from '../leader/TransferLeader'

const panels = [
  { id: 'player',    icon: '/player-movie.svg', label: 'Player'    },
  { id: 'files',     icon: '/trans.svg', label: 'Transfer'  },
  { id: 'notepad',   icon: '/notepad-s.svg', label: 'Notepad'   },
  { id: 'clipboard', icon: '/clipboard.svg', label: 'Clipboard' },
]

export default function Sidebar({
  activePanel,
  setActivePanel,
  isLeader,
  username,
  friendName,
  connected,
  onTransferLeader,
  onRequestLeader,
}) {
  return (
    <aside className="w-20 bg-[#0a0a0f] border-r border-white/5 flex flex-col items-center gap-[2rem]  shrink-0">

      {/* Nav buttons */}
      {panels.map((panel) => (
        <button
          key={panel.id}
          onClick={() => setActivePanel(panel.id)}
          className={`
            w-full h-16  flex flex-col items-center justify-center gap-1 mt-2 transition-all duration-300 ease-in-out border-none
            ${activePanel === panel.id
              ? 'bg-violet-600/30  border-none shadow-lg shadow-violet-900/30 '
              : 'hover:bg-white/5 border border-transparent'
            }
          `}
        >
          <span className="text-l"><img  className='h-6 w-6 ' src={panel.icon}></img></span>
          <span className="text-[12px] text-gray-600 uppercase tracking-wider">
            {panel.label}
          </span>
        </button>
      ))}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Leader section */}
      {connected && (
        <>
          <LeaderBadge
            isLeader={isLeader}
            username={username}
            friendName={friendName}
          />
          <TransferLeader
            isLeader={isLeader}
            friendName={friendName}
            onTransfer={onTransferLeader}
            onRequest={onRequestLeader}
          />
        </>
      )}

      {/* Not connected yet */}
      {!connected && (
        <div className="w-14 h-14 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center gap-1">
          <span className="text-xl opacity-20">👑</span>
          <span className="text-[9px] text-white-900 uppercase tracking-wider">Leader</span>
        </div>
      )}
    </aside>
  )
}