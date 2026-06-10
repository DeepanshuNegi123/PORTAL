import { useState, useRef, useEffect } from 'react'
import PlayerControls from './PlayerControls'
import FileDropZone from './FileDropZone'
import Playlist from './Playlist'

export default function VideoPlayer() {
  const videoRef = useRef(null)
  const [videoSrc, setVideoSrc] = useState(null)
  const [videoName, setVideoName] = useState('')
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [playlist, setPlaylist] = useState([])
  const [activeIndex, setActiveIndex] = useState(0)
  const controlsTimer = useRef(null)
  const containerRef = useRef(null)

  // Auto hide controls
  const resetControlsTimer = () => {
    setShowControls(true)
    clearTimeout(controlsTimer.current)
    if (playing) {
      controlsTimer.current = setTimeout(() => setShowControls(false), 3000)
    }
  }

  useEffect(() => {
    return () => clearTimeout(controlsTimer.current)
  }, [])

  // Load file into player
  const loadFile = (file) => {
    const url = URL.createObjectURL(file)
    setVideoSrc(url)
    setVideoName(file.name)
    setPlaying(false)
    setCurrentTime(0)
  }

  // Add files to playlist
  const addToPlaylist = (files) => {
    const newItems = Array.from(files).map((file) => ({
      name: file.name,
      file,
      url: URL.createObjectURL(file),
    }))
    setPlaylist((prev) => {
      const updated = [...prev, ...newItems]
      if (prev.length === 0) {
        setVideoSrc(updated[0].url)
        setVideoName(updated[0].name)
        setActiveIndex(0)
      }
      return updated
    })
  }

  const playFromPlaylist = (index) => {
    setVideoSrc(playlist[index].url)
    setVideoName(playlist[index].name)
    setActiveIndex(index)
    setPlaying(true)
    setTimeout(() => videoRef.current?.play(), 100)
  }

  // Controls
  const togglePlay = () => {
    if (!videoRef.current) return
    if (playing) {
      videoRef.current.pause()
      setPlaying(false)
    } else {
      videoRef.current.play()
      setPlaying(true)
    }
  }

  const handleSeek = (val) => {
    if (!videoRef.current) return
    videoRef.current.currentTime = val
    setCurrentTime(val)
  }

  const handleVolume = (val) => {
    if (!videoRef.current) return
    videoRef.current.volume = val
    setVolume(val)
    setMuted(val === 0)
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    const newMuted = !muted
    videoRef.current.muted = newMuted
    setMuted(newMuted)
  }

  const skip = (secs) => {
    if (!videoRef.current) return
    videoRef.current.currentTime = Math.min(
      Math.max(0, videoRef.current.currentTime + secs),
      duration
    )
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return
    if (!fullscreen) {
      containerRef.current.requestFullscreen()
      setFullscreen(true)
    } else {
      document.exitFullscreen()
      setFullscreen(false)
    }
  }

  const playNext = () => {
    if (activeIndex < playlist.length - 1) playFromPlaylist(activeIndex + 1)
  }

  const playPrev = () => {
    if (activeIndex > 0) playFromPlaylist(activeIndex - 1)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Player + Playlist row */}
      <div className="flex flex-1 overflow-hidden">

        {/* Video area */}
        <div
          ref={containerRef}
          className="relative flex-1 bg-black flex items-center justify-center overflow-hidden"
          onMouseMove={resetControlsTimer}
          onClick={togglePlay}
        >
          {/* No video loaded */}
          {!videoSrc && (
            <FileDropZone onFiles={addToPlaylist} />
          )}

          {/* Video element */}
          {videoSrc && (
            <video
              ref={videoRef}
              src={videoSrc}
              className="max-h-full max-w-full w-full h-full object-contain"
              onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
              onLoadedMetadata={(e) => setDuration(e.target.duration)}
              onEnded={playNext}
              onClick={(e) => e.stopPropagation()}
            />
          )}


          {/* Center play/pause flash */}
          {videoSrc && (
            <div
              className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${showControls ? 'opacity-0' : 'opacity-0'}`}
            />
          )}

          {/* Top gradient — file name */}
          {videoSrc && showControls && (
            <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/80 to-transparent flex items-center px-4 pointer-events-none">
              <span className="text-sm text-gray-300 truncate">{videoName}</span>
            </div>
          )}

          {/* Controls overlay */}
          {videoSrc && (
            <div
              className={`absolute bottom-0 left-0 right-0 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
              onClick={(e) => e.stopPropagation()}
            >
              <PlayerControls
                playing={playing}
                currentTime={currentTime}
                duration={duration}
                volume={volume}
                muted={muted}
                onTogglePlay={togglePlay}
                onSeek={handleSeek}
                onVolume={handleVolume}
                onMute={toggleMute}
                onSkipForward={() => skip(10)}
                onSkipBackward={() => skip(-10)}
                onFullscreen={toggleFullscreen}
                onNext={playNext}
                onPrev={playPrev}
                hasNext={activeIndex < playlist.length - 1}
                hasPrev={activeIndex > 0}
              />
            </div>
          )}
        </div>

        {/* Playlist sidebar */}
        {playlist.length > 0 && (
          <Playlist
            playlist={playlist}
            activeIndex={activeIndex}
            onSelect={playFromPlaylist}
            onAdd={addToPlaylist}
          />
        )}
      </div>
    </div>
  )
}