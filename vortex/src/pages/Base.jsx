import { useEffect, useState } from 'react'

import { useParams, useNavigate } from 'react-router-dom'
import TopBar from '../components/layout/TopBar'
import Sidebar from '../components/layout/Sidebar'
import VideoPlayer from '../components/player/VideoPlayer'
import FileTransfer from '../components/transfer/FileTransfer'
import SharedNotepad from '../components/shared/SharedNotepad'
import SharedClipboard from '../components/shared/SharedClipboard'
import RoomCode from '../components/wormhole/RoomCode'
import ConnectionStatus from '../components/wormhole/ConnectionStatus'
import socket from '../lib/socket'

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


  useEffect(()=>{

    socket.emit('join-room',{roomId,username});
    socket.on('room-full',()=>{
      navigate('/');
    })
     
    socket.on('friend-left', ({ name }) => {
    setConnected(false)
    setFriendName('')
})

    socket.on('friend-joined',({name})=>{
      console.log("at frontend",name,"has been joined");
      setConnected(true);
      setFriendName(name);
      setIsLeader(true);
    })

    
      socket.on('you-are-leader', () => setIsLeader(true))
      socket.on('you-are-member', () => setIsLeader(false))


    return () => {
        socket.off('friend-joined')
        socket.off('friend-left')
        socket.off('room-full')
        socket.off('you-are-leader')
        socket.off('you-are-member')
    }

  },[])



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