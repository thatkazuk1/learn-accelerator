import { useEffect, useRef } from 'react'

const PARTICLE_COUNT = 80
const DURATION = 2400
const COLORS = ['#efb63a', '#63c4c0', '#df7692', '#91b86a', '#ab99dc', '#235d47']

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  rotation: number
  spin: number
  shape: 'rect' | 'circle'
}

function createParticles(width: number, height: number): Particle[] {
  const particles: Particle[] = []
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: width * 0.5 + (Math.random() - 0.5) * width * 0.4,
      y: height * 0.4,
      vx: (Math.random() - 0.5) * 8,
      vy: -Math.random() * 12 - 4,
      size: Math.random() * 6 + 3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)] ?? '#235d47',
      rotation: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.3,
      shape: Math.random() > 0.5 ? 'rect' : 'circle',
    })
  }
  return particles
}

export function Confetti({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!active) return
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height

    const particles = createParticles(canvas.width, canvas.height)
    const start = performance.now()
    let frame: number

    function draw(now: number) {
      const elapsed = now - start
      if (elapsed > DURATION) {
        ctx!.clearRect(0, 0, canvas!.width, canvas!.height)
        return
      }
      const progress = elapsed / DURATION
      const fade = progress > 0.7 ? 1 - (progress - 0.7) / 0.3 : 1

      ctx!.clearRect(0, 0, canvas!.width, canvas!.height)
      ctx!.globalAlpha = fade

      for (const p of particles) {
        p.x += p.vx
        p.vy += 0.15
        p.y += p.vy
        p.vx *= 0.99
        p.rotation += p.spin

        ctx!.save()
        ctx!.translate(p.x, p.y)
        ctx!.rotate(p.rotation)
        ctx!.fillStyle = p.color

        if (p.shape === 'rect') {
          ctx!.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6)
        } else {
          ctx!.beginPath()
          ctx!.arc(0, 0, p.size / 2, 0, Math.PI * 2)
          ctx!.fill()
        }
        ctx!.restore()
      }

      ctx!.globalAlpha = 1
      frame = requestAnimationFrame(draw)
    }

    frame = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(frame)
  }, [active])

  if (!active) return null

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  )
}
