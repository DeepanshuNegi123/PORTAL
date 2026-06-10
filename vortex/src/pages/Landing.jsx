import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'

export default function Landing() {
  const navigate = useNavigate()
  const [roomInput, setRoomInput] = useState('')
  const [username, setUsername] = useState('')
  const [mode, setMode] = useState(null) // 'create' or 'join'
  const [error, setError] = useState('')


  const handleCreate = () => {
    if (!username.trim()) return setError('Enter your name first')
    const roomId = uuidv4().slice(0, 8).toUpperCase()
    localStorage.setItem('vortex_user', username.trim())
    navigate(`/base/${roomId}`)
  }



  const handleJoin = () => {
    if (!username.trim()) return setError('Enter your name first')
    if (!roomInput.trim()) return setError('Enter a room code')
    // localStorage.setItem('vortex_user', username.trim())
    navigate(`/base/${roomInput.trim().toUpperCase()}`)
  }


  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col items-center justify-center relative overflow-hidden">

      {/* Animated background orbs */}
      <div className="absolute w-[300px] h-[500px] bg-purple-700  rounded-full  top-[-100px] left-[-100px] " />
      <div className="absolute w-[300px] h-[400px] bg-cyan-500  rounded-full  bottom-[-100px] right-[-100px] " />
      <div className="absolute w-[00px] h-[300px] bg-violet-600  rounded-full  top-[40%] left-[40%] " />

      {/* Logo */}
      <div className="relative z-10 flex flex-col items-center mb-12">
        <div className="text-7xl mb-4 ">🌀</div>
        <h1 className="text-6xl font-black tracking-widest text-white bg-clip-text text-transparent">
          VORTEX
        </h1>
        <p className="text-gray-400 mt-3 tracking-widest text-sm uppercase">
          Your private wormhole — share anything, instantly
        </p>
      </div>

      {/* Card */}
      <div className="relative z-10 bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-8 w-full max-w-md shadow-2xl">

        {/* Username input always visible */}
        <div className="mb-6">
          <label className="text-xs text-gray-400 uppercase tracking-widest mb-2 block">Your Name</label>
          <input
            type="text"
            placeholder="e.g. Shadow"
            value={username}
            onChange={(e) => { setUsername(e.target.value); setError('') }}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition"
          />
        </div>

        {/* Mode selector */}
        {!mode && (
          <div className="flex gap-4">
            <button
              onClick={() => setMode('create')}
              className="flex-1 bg-violet-600  transition rounded-xl py-3 font-bold tracking-wider text-sm uppercase  shadow-violet-900"
            >
              Create Wormhole
            </button>
            <button
              onClick={() => setMode('join')}
              className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 transition rounded-xl py-3 font-bold tracking-wider text-sm uppercase"
            >
              ⟶ Join Wormhole
            </button>
          </div>
        )}

        {/* Create mode */}
        {mode === 'create' && (
          <div className="flex flex-col gap-4">
            <p className="text-gray-400 text-sm text-center">A unique wormhole code will be generated for you to share with your friend.</p>
            <button
              onClick={handleCreate}
              className="w-full bg-violet-600 hover:bg-violet-500 transition rounded-xl py-3 font-bold tracking-wider text-sm uppercase shadow-lg shadow-violet-900"
            >
              🌀 Open Wormhole
            </button>
            <button onClick={() => setMode(null)} className="text-gray-600 hover:text-gray-400 text-xs text-center transition">
              ← Back
            </button>
          </div>
        )}

        {/* Join mode */}
        {mode === 'join' && (
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-widest mb-2 block">Wormhole Code</label>
              <input
                type="text"
                placeholder="e.g. A1B2C3D4"
                value={roomInput}
                onChange={(e) => { setRoomInput(e.target.value); setError('') }}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 transition uppercase tracking-widest"
              />
            </div>
            <button
              onClick={handleJoin}
              className="w-full bg-cyan-600 hover:bg-cyan-500 transition rounded-xl py-3 font-bold tracking-wider text-sm uppercase shadow-lg shadow-cyan-900"
            >
              ⟶ Enter Wormhole
            </button>
            <button onClick={() => setMode(null)} className="text-gray-600 hover:text-gray-400 text-xs text-center transition">
              ← Back
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-red-400 text-xs text-center mt-4">{error}</p>
        )}
      </div>

      {/* Bottom tag */}
      <p className="relative z-10 text-gray-700 text-xs mt-8 tracking-widest uppercase">
        Zero servers. Zero storage. Pure P2P.
      </p>
    </div>
  )
}