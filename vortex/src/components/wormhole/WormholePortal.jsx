import { useEffect, useRef } from 'react'

export default function WormholePortal({ connected }) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const particlesRef = useRef([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = 300
    canvas.height = 300

    const cx = 150
    const cy = 150

    // Create particles
    particlesRef.current = Array.from({ length: 80 }, () => ({
      angle: Math.random() * Math.PI * 2,
      radius: Math.random() * 60 + 40,
      speed: (Math.random() * 0.01 + 0.005) * (Math.random() > 0.5 ? 1 : -1),
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.8 + 0.2,
      color: Math.random() > 0.5 ? '#a78bfa' : '#22d3ee',
      drift: Math.random() * 0.5 - 0.25,
    }))

    const draw = () => {
      ctx.clearRect(0, 0, 300, 300)

      // Outer glow rings
      for (let i = 3; i >= 1; i--) {
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 100 * i / 2)
        gradient.addColorStop(0, connected
          ? `rgba(167,139,250,${0.08 / i})`
          : `rgba(100,100,120,${0.05 / i})`
        )
        gradient.addColorStop(1, 'transparent')
        ctx.beginPath()
        ctx.arc(cx, cy, 100 * i / 2, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()
      }

      // Spinning rings
      const rings = [
        { r: 90, speed: 0.003, dash: [4, 8],  color: connected ? '#a78bfa' : '#333' },
        { r: 70, speed: -0.005, dash: [2, 12], color: connected ? '#22d3ee' : '#2a2a2a' },
        { r: 50, speed: 0.008, dash: [6, 4],  color: connected ? '#f472b6' : '#222' },
      ]

      rings.forEach((ring, idx) => {
        ctx.save()
        ctx.translate(cx, cy)
        ctx.rotate(Date.now() * ring.speed * 0.05)
        ctx.beginPath()
        ctx.arc(0, 0, ring.r, 0, Math.PI * 2)
        ctx.setLineDash(ring.dash)
        ctx.strokeStyle = ring.color
        ctx.lineWidth = 1
        ctx.globalAlpha = connected ? 0.6 : 0.2
        ctx.stroke()
        ctx.restore()
      })

      // Particles
      particlesRef.current.forEach(p => {
        p.angle += p.speed
        const x = cx + Math.cos(p.angle) * p.radius
        const y = cy + Math.sin(p.angle) * p.radius

        ctx.beginPath()
        ctx.arc(x, y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = connected ? p.color : '#333'
        ctx.globalAlpha = connected ? p.opacity : 0.15
        ctx.fill()
      })

      // Center orb
      const orbGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30)
      orbGrad.addColorStop(0, connected ? 'rgba(167,139,250,0.9)' : 'rgba(60,60,80,0.5)')
      orbGrad.addColorStop(0.5, connected ? 'rgba(34,211,238,0.4)' : 'rgba(40,40,60,0.3)')
      orbGrad.addColorStop(1, 'transparent')
      ctx.beginPath()
      ctx.arc(cx, cy, 30, 0, Math.PI * 2)
      ctx.fillStyle = orbGrad
      ctx.globalAlpha = 1
      ctx.fill()

      // Center icon
      ctx.font = '22px serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.globalAlpha = connected ? 1 : 0.3
      ctx.fillText('🌀', cx, cy)

      animRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [connected])

  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={300}
      className="drop-shadow-[0_0_40px_rgba(139,92,246,0.4)]"
    />
  )
}