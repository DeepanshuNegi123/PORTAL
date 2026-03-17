import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import TopBar from '../components/layout/TopBar'
import Sidebar from '../components/layout/Sidebar'
import VideoPlayer from '../components/player/VideoPlayer'
import FileTransfer from '../components/transfer/FileTransfer'
import SharedNotepad from '../components/shared/SharedNotepad'
import SharedClipboard from '../components/shared/SharedClipboard'
import WormholePortal from '../components/wormhole/WormholePortal'
import RoomCode from '../components/wormhole/RoomCode'
import ConnectionStatus from '../components/wormhole/ConnectionStatus'

export default function Base() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const username = localStorage.getItem('vortex_user') || 'Unknown'

  const [activePanel, setActivePanel] = useState('player')
  const [connected, setConnected] = useState(false)
  const [friendName, setFriendName] = useState('')
  const [isLeader, setIsLeader] = useState(true)

  const handleTransferLeader = () => {
    setIsLeader(false)
  }

  const simulateFriendJoin = () => {
    setConnected(true)
    setFriendName('Shadow')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col overflow-hidden">

      <TopBar
        roomId={roomId}
        username={username}
        connected={connected}
        friendName={friendName}
        isLeader={isLeader}
        onLeave={() => navigate('/')}
      />

      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 56px)' }}>

        <Sidebar
          activePanel={activePanel}
          setActivePanel={setActivePanel}
          isLeader={isLeader}
          username={username}
          friendName={friendName}
          connected={connected}
          onTransferLeader={handleTransferLeader}
        />

        <main className="flex-1 flex flex-col overflow-hidden bg-[#0d0d14] relative">

          {/* Waiting overlay */}
          {!connected && (
            <div className="absolute inset-0 z-30 bg-[#0a0a0f]/95 backdrop-blur flex flex-col items-center justify-center gap-8">
              {/* <WormholePortal connected={connected} /> */}
              <ConnectionStatus
                connected={connected}
                friendName={friendName}
                roomId={roomId}
              />
              <RoomCode roomId={roomId} />
              <button
                onClick={simulateFriendJoin}
                className="text-xs text-gray-700 hover:text-gray-400 transition uppercase tracking-widest border border-white/5 px-4 py-2 rounded-xl"
              >
                [Dev] Simulate friend joining →
              </button>
            </div>
          )}

          {/* Panels */}
          {activePanel === 'player'    && <VideoPlayer />}
          {activePanel === 'files'     && <FileTransfer />}
          {activePanel === 'notepad'   && <SharedNotepad />}
          {activePanel === 'clipboard' && <SharedClipboard />}

        </main>
      </div>
    </div>
  )
}