import { useEffect, useState, useRef } from 'react'

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
  const [friendSocketId, setFriendSocketId] = useState('')
  const [isLeader, setIsLeader] = useState(true)

  // WebRTC State & Refs
  const [p2pConnected, setP2pConnected] = useState(false)
  const [transfers, setTransfers] = useState([])
  const [history, setHistory] = useState([])

  const peerConnectionRef = useRef(null)
  const dataChannelRef = useRef(null)
  const activeIncomingRef = useRef(null)
  const incomingChunksRef = useRef([])
  const incomingReceivedBytesRef = useRef(0)

  const handleTransferLeader = () => {
    if (friendSocketId) {
      socket.emit('transfer-leader', { roomId, toSocketId: friendSocketId })
    }
  }

  const handleRequestLeader = () => {
    socket.emit('request-leader', { roomId })
  }

  const initWebRTC = (leaderMode) => {
    if (peerConnectionRef.current) return

    console.log("Initializing WebRTC... Leader Mode:", leaderMode)
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    })

    peerConnectionRef.current = pc

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit('webrtc-ice-candidate', { roomId, candidate: e.candidate })
      }
    }

    pc.onconnectionstatechange = () => {
      console.log("WebRTC Connection State:", pc.connectionState)
      if (pc.connectionState === 'connected') {
        setP2pConnected(true)
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        setP2pConnected(false)
      }
    }

    if (leaderMode) {
      const dc = pc.createDataChannel('fileTransfer', { ordered: true })
      dataChannelRef.current = dc
      setupDataChannel(dc)

      pc.createOffer()
        .then(offer => pc.setLocalDescription(offer))
        .then(() => {
          socket.emit('webrtc-offer', { roomId, offer: pc.localDescription })
        })
        .catch(console.error)
    } else {
      pc.ondatachannel = (e) => {
        const dc = e.channel
        dataChannelRef.current = dc
        setupDataChannel(dc)
      }
    }
  }

  const setupDataChannel = (dc) => {
    dc.binaryType = 'arraybuffer'
    dc.onopen = () => {
      console.log("Data channel opened!")
      setP2pConnected(true)
    }
    dc.onclose = () => {
      console.log("Data channel closed!")
      setP2pConnected(false)
    }
    dc.onmessage = handleIncomingMessage
  }

  const handleIncomingMessage = (e) => {
    if (typeof e.data === 'string') {
      const msg = JSON.parse(e.data)
      if (msg.type === 'metadata') {
        activeIncomingRef.current = msg
        incomingChunksRef.current = []
        incomingReceivedBytesRef.current = 0

        const transfer = {
          id: msg.id,
          name: msg.name,
          size: msg.size,
          type: msg.fileType,
          progress: 0,
          speed: 0,
          status: 'receiving',
          direction: 'in'
        }
        setTransfers(prev => [...prev, transfer])
      }
    } else {
      const buffer = e.data
      incomingChunksRef.current.push(buffer)
      incomingReceivedBytesRef.current += buffer.byteLength

      const metadata = activeIncomingRef.current
      if (metadata) {
        const progress = Math.min((incomingReceivedBytesRef.current / metadata.size) * 100, 100)
        setTransfers(prev => prev.map(t => t.id === metadata.id ? { ...t, progress } : t))

        if (incomingReceivedBytesRef.current >= metadata.size) {
          const blob = new Blob(incomingChunksRef.current, { type: metadata.fileType })
          const downloadUrl = URL.createObjectURL(blob)

          const completed = {
            id: metadata.id,
            name: metadata.name,
            size: metadata.size,
            type: metadata.fileType,
            progress: 100,
            status: 'done',
            direction: 'in',
            time: new Date(),
            downloadUrl
          }

          setTransfers(prev => prev.filter(t => t.id !== metadata.id))
          setHistory(prev => [completed, ...prev])

          activeIncomingRef.current = null
          incomingChunksRef.current = []
          incomingReceivedBytesRef.current = 0
        }
      }
    }
  }

  const sendFile = (file) => {
    const dc = dataChannelRef.current
    if (!dc || dc.readyState !== 'open') {
      alert("Direct P2P connection not established yet.")
      return
    }

    const transferId = Date.now() + Math.random()
    const transfer = {
      id: transferId,
      name: file.name,
      size: file.size,
      type: file.type || 'unknown',
      progress: 0,
      speed: 0,
      status: 'sending',
      direction: 'out',
    }
    setTransfers(prev => [...prev, transfer])

    dc.send(JSON.stringify({
      type: 'metadata',
      id: transferId,
      name: file.name,
      size: file.size,
      fileType: file.type || 'unknown'
    }))

    const chunkSize = 16384
    let offset = 0
    const reader = new FileReader()
    const startTime = Date.now()

    const readSlice = (o) => {
      const slice = file.slice(o, o + chunkSize)
      reader.readAsArrayBuffer(slice)
    }

    reader.onload = (e) => {
      const buffer = e.target.result
      dc.send(buffer)
      offset += buffer.byteLength

      const elapsed = (Date.now() - startTime) / 1000
      const speed = elapsed > 0 ? (offset / elapsed) / (1024 * 1024) : 0
      const progress = Math.min((offset / file.size) * 100, 100)

      setTransfers(prev => prev.map(t => t.id === transferId ? { ...t, progress, speed } : t))

      if (offset < file.size) {
        if (dc.bufferedAmount > 1024 * 1024) {
          setTimeout(() => readSlice(offset), 50)
        } else {
          readSlice(offset)
        }
      } else {
        setTransfers(prev => prev.filter(t => t.id !== transferId))
        setHistory(prev => [{ ...transfer, progress: 100, status: 'done', time: new Date() }, ...prev])
      }
    }

    readSlice(0)
  }

  const simulateFriendJoin = () => {
    setConnected(true)
    setFriendName('Shadow')
  }

  const isLeaderRef = useRef(isLeader)
  const friendSocketIdRef = useRef(friendSocketId)

  useEffect(() => {
    isLeaderRef.current = isLeader
  }, [isLeader])

  useEffect(() => {
    friendSocketIdRef.current = friendSocketId
  }, [friendSocketId])

  const iceCandidatesQueueRef = useRef([])

  useEffect(() => {
    socket.emit('join-room', { roomId, username })

    socket.on('room-full', () => {
      navigate('/')
    })

    socket.on('friend-left', ({ name }) => {
      setConnected(false)
      setFriendName('')
      setFriendSocketId('')
      setP2pConnected(false)
      iceCandidatesQueueRef.current = []
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close()
        peerConnectionRef.current = null
      }
    })

    socket.on('friend-joined', ({ name, socketId }) => {
      console.log("at frontend", name, "has joined with ID", socketId)
      setConnected(true)
      setFriendName(name)
      setFriendSocketId(socketId)
      initWebRTC(true)
    })

    socket.on('you-are-leader', () => {
      setIsLeader(true)
    })

    socket.on('you-are-member', (data) => {
      setIsLeader(false)
      if (data?.members && data.members.length > 0) {
        setConnected(true)
        setFriendName(data.members[0].username)
        setFriendSocketId(data.members[0].socketId)
        initWebRTC(false)
      }
    })

    socket.on('leader-requested', ({ fromName, fromSocketId }) => {
      const accept = window.confirm(`${fromName} requested to be the leader of this room. Allow?`)
      if (accept) {
        socket.emit('accept-leader-request', { roomId, toSocketId: fromSocketId })
      }
    })

    const processQueuedCandidates = async (pc) => {
      while (iceCandidatesQueueRef.current.length > 0) {
        const candidate = iceCandidatesQueueRef.current.shift()
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate))
          console.log("Applied buffered ICE candidate successfully")
        } catch (err) {
          console.error("Error adding queued ICE candidate:", err)
        }
      }
    }

    const handleOffer = async ({ offer }) => {
      if (isLeaderRef.current) return
      initWebRTC(false)
      const pc = peerConnectionRef.current
      if (!pc) return

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer))
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        socket.emit('webrtc-answer', { roomId, answer })
        await processQueuedCandidates(pc)
      } catch (err) {
        console.error("Error handling WebRTC offer:", err)
      }
    }

    const handleAnswer = async ({ answer }) => {
      if (!isLeaderRef.current) return
      const pc = peerConnectionRef.current
      if (!pc) return

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(answer))
        await processQueuedCandidates(pc)
      } catch (err) {
        console.error("Error handling WebRTC answer:", err)
      }
    }

    const handleIceCandidate = async ({ candidate }) => {
      const pc = peerConnectionRef.current
      if (!pc || !pc.remoteDescription) {
        console.log("Buffering ICE candidate (remoteDescription not set yet)")
        iceCandidatesQueueRef.current.push(candidate)
        return
      }

      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate))
      } catch (err) {
        console.error("Error handling WebRTC ICE candidate:", err)
      }
    }

    socket.on('webrtc-offer', handleOffer)
    socket.on('webrtc-answer', handleAnswer)
    socket.on('webrtc-ice-candidate', handleIceCandidate)

    return () => {
      socket.off('friend-joined')
      socket.off('friend-left')
      socket.off('room-full')
      socket.off('you-are-leader')
      socket.off('you-are-member')
      socket.off('leader-requested')
      socket.off('webrtc-offer', handleOffer)
      socket.off('webrtc-answer', handleAnswer)
      socket.off('webrtc-ice-candidate', handleIceCandidate)
    }
  }, [roomId, username])

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
          onRequestLeader={handleRequestLeader}
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
          {activePanel === 'player'    && <VideoPlayer isLeader={isLeader} roomId={roomId} />}
          {activePanel === 'files'     && (
            <FileTransfer
              isLeader={isLeader}
              roomId={roomId}
              p2pConnected={p2pConnected}
              transfers={transfers}
              history={history}
              sendFile={sendFile}
            />
          )}
          {activePanel === 'notepad'   && <SharedNotepad />}
          {activePanel === 'clipboard' && <SharedClipboard />}

        </main>
      </div>
    </div>
  )
}