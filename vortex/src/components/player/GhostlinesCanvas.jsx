import { useRef, useEffect, useState, useCallback } from 'react'

export default function GhostlinesCanvas({ currentTime, containerRef }) {
  const canvasRef = useRef(null)
  const isDrawing = useRef(false)
  const lastPos = useRef(null)
  // strokes stored as Map: timestamp(floored) -> [{points, color, width}]
  const strokeMap = useRef(new Map())
  const currentStroke = useRef([])
  const [tool, setTool] = useState('pen') // pen | eraser | arrow | highlight
  const [color, setColor] = useState('#a78bfa')
  const [brushSize, setBrushSize] = useState(3)
  const [showToolbar, setShowToolbar] = useState(true)

  const colors = ['#a78bfa', '#22d3ee', '#f472b6', '#facc15', '#4ade80', '#ff6b6b', '#ffffff']
  const timeKey = Math.floor(currentTime)

  // Resize canvas to match container
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    canvas.width = container.offsetWidth
    canvas.height = container.offsetHeight
    redrawCanvas()
  }, [currentTime])

  useEffect(() => {
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    return () => window.removeEventListener('resize', resizeCanvas)
  }, [resizeCanvas])

  // Redraw when time changes
  useEffect(() => {
    redrawCanvas()
  }, [currentTime])

  const redrawCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw strokes for current timestamp
    const strokes = strokeMap.current.get(timeKey) || []
    strokes.forEach(stroke => drawStroke(ctx, stroke))
  }

  const drawStroke = (ctx, stroke) => {
    if (!stroke.points || stroke.points.length < 2) return
    ctx.beginPath()
    ctx.strokeStyle = stroke.color
    ctx.lineWidth = stroke.width
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.globalAlpha = stroke.tool === 'highlight' ? 0.35 : 1

    if (stroke.tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out'
    } else {
      ctx.globalCompositeOperation = 'source-over'
    }

    ctx.moveTo(stroke.points[0].x, stroke.points[0].y)
    stroke.points.forEach(p => ctx.lineTo(p.x, p.y))
    ctx.stroke()

    // Arrow head
    if (stroke.tool === 'arrow' && stroke.points.length >= 2) {
      const last = stroke.points[stroke.points.length - 1]
      const prev = stroke.points[stroke.points.length - 2]
      drawArrowHead(ctx, prev, last, stroke.color, stroke.width)
    }

    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = 'source-over'
  }

  const drawArrowHead = (ctx, from, to, color, width) => {
    const angle = Math.atan2(to.y - from.y, to.x - from.x)
    const size = width * 4 + 8
    ctx.beginPath()
    ctx.fillStyle = color
    ctx.moveTo(to.x, to.y)
    ctx.lineTo(to.x - size * Math.cos(angle - Math.PI / 6), to.y - size * Math.sin(angle - Math.PI / 6))
    ctx.lineTo(to.x - size * Math.cos(angle + Math.PI / 6), to.y - size * Math.sin(angle + Math.PI / 6))
    ctx.closePath()
    ctx.fill()
  }

  const getPos = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    }
  }

  const startDrawing = (e) => {
    e.stopPropagation()
    isDrawing.current = true
    const pos = getPos(e)
    lastPos.current = pos
    currentStroke.current = [pos]
  }

  const draw = (e) => {
    e.stopPropagation()
    if (!isDrawing.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const pos = getPos(e)

    currentStroke.current.push(pos)

    // Live draw current stroke
    ctx.beginPath()
    ctx.strokeStyle = tool === 'eraser' ? 'rgba(0,0,0,1)' : color
    ctx.lineWidth = tool === 'highlight' ? brushSize * 6 : tool === 'eraser' ? brushSize * 4 : brushSize
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.globalAlpha = tool === 'highlight' ? 0.35 : 1
    ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over'
    ctx.moveTo(lastPos.current.x, lastPos.current.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = 'source-over'

    lastPos.current = pos
  }

  const stopDrawing = (e) => {
    if (!isDrawing.current) return
    isDrawing.current = false

    // Save stroke to map
    const stroke = {
      points: [...currentStroke.current],
      color: tool === 'eraser' ? 'rgba(0,0,0,1)' : color,
      width: tool === 'highlight' ? brushSize * 6 : tool === 'eraser' ? brushSize * 4 : brushSize,
      tool
    }

    const existing = strokeMap.current.get(timeKey) || []
    strokeMap.current.set(timeKey, [...existing, stroke])
    currentStroke.current = []
    redrawCanvas()
  }

  const clearCanvas = () => {
    strokeMap.current.delete(timeKey)
    redrawCanvas()
  }

  const clearAll = () => {
    strokeMap.current.clear()
    redrawCanvas()
  }

  return (
    <>
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full z-10"
        style={{
          mixBlendMode: 'screen',
          cursor: tool === 'eraser' ? 'cell' : 'crosshair',
          pointerEvents: 'all'
        }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />

      {/* Toolbar */}
      <div
        className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-black/70 backdrop-blur border border-white/10 rounded-2xl px-3 py-2"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tools */}
        {[
          { id: 'pen',       icon: '✏️',  label: 'Pen'       },
          { id: 'highlight', icon: '🖊️',  label: 'Highlight' },
          { id: 'arrow',     icon: '➡️',  label: 'Arrow'     },
          { id: 'eraser',    icon: '⬜',  label: 'Eraser'    },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTool(t.id)}
            title={t.label}
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition ${
              tool === t.id
                ? 'bg-violet-600 shadow-lg shadow-violet-900'
                : 'hover:bg-white/10'
            }`}
          >
            {t.icon}
          </button>
        ))}

        {/* Divider */}
        <div className="w-px h-6 bg-white/10" />

        {/* Colors */}
        {colors.map(c => (
          <button
            key={c}
            onClick={() => { setColor(c); setTool('pen') }}
            className={`w-5 h-5 rounded-full border-2 transition ${
              color === c && tool !== 'eraser'
                ? 'border-white scale-125'
                : 'border-transparent hover:scale-110'
            }`}
            style={{ backgroundColor: c }}
          />
        ))}

        {/* Divider */}
        <div className="w-px h-6 bg-white/10" />

        {/* Brush size */}
        <input
          type="range"
          min={1}
          max={10}
          value={brushSize}
          onChange={(e) => setBrushSize(parseInt(e.target.value))}
          className="w-16 accent-violet-500"
          title="Brush size"
        />

        {/* Divider */}
        <div className="w-px h-6 bg-white/10" />

        {/* Clear current frame */}
        <button
          onClick={clearCanvas}
          title="Clear this frame"
          className="text-xs text-gray-400 hover:text-red-400 transition px-2 uppercase tracking-widest"
        >
          Clear
        </button>

        {/* Clear all */}
        <button
          onClick={clearAll}
          title="Clear all frames"
          className="text-xs text-gray-600 hover:text-red-600 transition px-2 uppercase tracking-widest"
        >
          All
        </button>
      </div>

      {/* Timestamp label */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <span className="text-xs text-violet-400/60 font-mono bg-black/40 px-2 py-1 rounded-lg">
          👻 ghostlines @ {Math.floor(currentTime)}s
        </span>
      </div>
    </>
  )
}