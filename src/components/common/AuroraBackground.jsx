import { useEffect, useRef } from 'react'

// Each orb: base position (0-1 normalized), radius (fraction of min dimension),
// RGB color, drift speed, and phase offset for organic movement
const ORBS = [
  { cx: 0.72, cy: 0.12, r: 0.60, color: [10, 40, 90],  speed: 0.00011, phase: 0.0  },
  { cx: 0.22, cy: 0.78, r: 0.55, color: [24, 8,  72],  speed: 0.00008, phase: 2.1  },
  { cx: 0.50, cy: 0.42, r: 0.42, color: [65, 42, 0],   speed: 0.00014, phase: 1.0  },
  { cx: 0.12, cy: 0.22, r: 0.48, color: [5,  22, 48],  speed: 0.00006, phase: 4.2  },
  { cx: 0.88, cy: 0.82, r: 0.44, color: [8,  38, 46],  speed: 0.00010, phase: 3.1  },
]

export default function AuroraBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let raf
    let w = 0
    let h = 0

    function resize() {
      w = canvas.width  = canvas.offsetWidth
      h = canvas.height = canvas.offsetHeight
    }
    resize()

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    function draw(t) {
      ctx.clearRect(0, 0, w, h)

      // Base background
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, w, h)

      const minDim = Math.min(w, h)

      ORBS.forEach(({ cx, cy, r, color, speed, phase }) => {
        // Sinusoidal drift — different axes at slightly different speeds/phases
        const ox = Math.sin(t * speed       + phase)       * w * 0.10
        const oy = Math.cos(t * speed * 0.7 + phase + 1.3) * h * 0.10
        const x  = cx * w + ox
        const y  = cy * h + oy
        const radius = r * minDim * 1.1

        const grad = ctx.createRadialGradient(x, y, 0, x, y, radius)
        grad.addColorStop(0,   `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.32)`)
        grad.addColorStop(0.45,`rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.14)`)
        grad.addColorStop(0.8, `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.04)`)
        grad.addColorStop(1,   `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0)`)

        ctx.fillStyle = grad
        ctx.fillRect(0, 0, w, h)
      })

      raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none hidden sm:block"
      aria-hidden="true"
    />
  )
}
