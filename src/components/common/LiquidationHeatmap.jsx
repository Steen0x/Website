import { useEffect, useRef, useCallback } from 'react'

// ── Config ──
const BASE_PRICE = 69000
const PRICE_RANGE = 4000 // ±2000 from base
const ROWS = 40
const COLS = 60
const CELL_GAP = 1.5
const PRICE_SPEED = 0.003
const SCROLL_SPEED = 0.4

// DoM config
const DOM_WIDTH_RATIO = 0.14 // 14% of canvas width
const DOM_GAP = 20 // px gap between chart and DoM
const DOM_ROWS = 24 // visible price levels in the ladder
const DOM_TICK_MS = 80 // how often rows update (lower = faster)

// Liquidation cluster definitions (relative to price range 0–1)
const LIQ_CLUSTERS = [
  { center: 0.12, spread: 0.08, intensity: 1.0,  type: 'long' },
  { center: 0.28, spread: 0.10, intensity: 0.7,  type: 'long' },
  { center: 0.40, spread: 0.06, intensity: 0.5,  type: 'long' },
  { center: 0.60, spread: 0.06, intensity: 0.5,  type: 'short' },
  { center: 0.72, spread: 0.10, intensity: 0.7,  type: 'short' },
  { center: 0.88, spread: 0.08, intensity: 1.0,  type: 'short' },
]

function lerpColor(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
}

function intensityToColor(val, type) {
  if (val < 0.03) return null
  const base = type === 'long' ? [201, 168, 76] : [255, 68, 68]
  const dim = [15, 15, 26]
  const color = lerpColor(dim, base, val)
  const alpha = Math.min(0.55, val * 0.5 + 0.03)
  return `rgba(${color[0] | 0},${color[1] | 0},${color[2] | 0},${alpha})`
}

function noise(x, y, seed) {
  const n = Math.sin(x * 127.1 + y * 311.7 + seed * 43758.5453) * 43758.5453
  return n - Math.floor(n)
}

// Generate a random DoM size with realistic distribution (lots of small, few large)
function randDomSize() {
  const r = Math.random()
  if (r < 0.4) return Math.floor(Math.random() * 5 + 1) // 1-5
  if (r < 0.7) return Math.floor(Math.random() * 20 + 5) // 5-25
  if (r < 0.9) return Math.floor(Math.random() * 80 + 20) // 20-100
  return Math.floor(Math.random() * 300 + 80) // 80-380 (whale)
}

export default function LiquidationHeatmap() {
  const canvasRef = useRef(null)
  const stateRef = useRef({
    price: 0.5,
    priceVel: 0,
    priceHistory: [],
    scrollOffset: 0,
    mouse: null,
    seed: Math.random() * 1000,
    // DoM state
    domBids: Array.from({ length: DOM_ROWS }, () => ({ size: randDomSize(), flash: 0 })),
    domAsks: Array.from({ length: DOM_ROWS }, () => ({ size: randDomSize(), flash: 0 })),
    domLastTick: 0,
    domTradeFlash: 0, // >0 means a "trade" just happened at spread
    domTradeDir: 1, // 1 = buy, -1 = sell
  })

  const getSize = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return { w: 0, h: 0 }
    return { w: canvas.offsetWidth, h: canvas.offsetHeight }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId
    let lastTime = 0
    const state = stateRef.current

    state.priceHistory = Array.from({ length: COLS }, () => 0.5)

    function resize() {
      const dpr = window.devicePixelRatio || 1
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function updatePrice(dt) {
      state.priceVel += (Math.random() - 0.5) * PRICE_SPEED * dt
      state.priceVel *= 0.98
      state.priceVel += (0.5 - state.price) * 0.0002 * dt
      state.price += state.priceVel
      state.price = Math.max(0.08, Math.min(0.92, state.price))
    }

    function updateDom(timestamp) {
      if (timestamp - state.domLastTick < DOM_TICK_MS) return
      state.domLastTick = timestamp

      // Randomly mutate 30-60% of levels each tick for chaotic feel
      const mutateCount = Math.floor(DOM_ROWS * (0.3 + Math.random() * 0.3))
      for (let i = 0; i < mutateCount; i++) {
        const idx = Math.floor(Math.random() * DOM_ROWS)
        // Bids
        const oldBid = state.domBids[idx].size
        const newBid = randDomSize()
        state.domBids[idx].size = newBid
        state.domBids[idx].flash = newBid > oldBid * 2 ? 1 : (newBid < oldBid * 0.3 ? -1 : 0)
        // Asks
        const oldAsk = state.domAsks[idx].size
        const newAsk = randDomSize()
        state.domAsks[idx].size = newAsk
        state.domAsks[idx].flash = newAsk > oldAsk * 2 ? 1 : (newAsk < oldAsk * 0.3 ? -1 : 0)
      }

      // Random trade flash at spread (the middle)
      if (Math.random() < 0.35) {
        state.domTradeFlash = 1
        state.domTradeDir = Math.random() < 0.5 ? 1 : -1
      }
    }

    function getLiqIntensity(row, col) {
      const rowNorm = row / ROWS
      let totalIntensity = 0
      let type = 'long'
      for (const cluster of LIQ_CLUSTERS) {
        const dist = Math.abs(rowNorm - cluster.center) / cluster.spread
        if (dist < 2.5) {
          const val = cluster.intensity * Math.exp(-dist * dist * 0.5)
          const n = noise(col * 0.3, row * 0.5, state.seed + col * 0.01) * 0.4
          const cellVal = Math.max(0, val + n * val * 0.5)
          if (cellVal > totalIntensity) {
            totalIntensity = cellVal
            type = cluster.type
          }
        }
      }
      return { intensity: Math.min(1, totalIntensity), type }
    }

    function drawDom(w, h, domX, domW) {
      // Gradient fade from transparent to dark background (replaces hard border)
      const fadeW = Math.min(40, domW * 0.35)
      const fadeGrad = ctx.createLinearGradient(domX - fadeW, 0, domX + fadeW * 0.5, 0)
      fadeGrad.addColorStop(0, 'rgba(0,0,0,0)')
      fadeGrad.addColorStop(0.5, 'rgba(0,0,0,0.4)')
      fadeGrad.addColorStop(1, 'rgba(0,0,0,0.7)')
      ctx.fillStyle = fadeGrad
      ctx.fillRect(domX - fadeW, 0, fadeW + fadeW * 0.5, h)

      // Solid background for the main DoM area (past the fade)
      ctx.fillStyle = 'rgba(0,0,0,0.7)'
      ctx.fillRect(domX + fadeW * 0.5, 0, domW - fadeW * 0.5, h)

      const rowH = h / DOM_ROWS
      const midRow = Math.floor(DOM_ROWS / 2)
      const pad = 3 // inner padding
      const innerW = domW - pad * 2
      const halfCol = innerW / 2
      const maxSize = 380

      // Dynamic font size — hard clamped to pane width
      const fontSize = Math.max(6, Math.min(9, Math.floor(domW / 14)))
      const monoFont = `${fontSize}px "Fira Code", "Source Code Pro", "Consolas", monospace`
      ctx.font = monoFont

      for (let i = 0; i < DOM_ROWS; i++) {
        const y = i * rowH
        const isAsk = i < midRow
        const dataIdx = isAsk ? (midRow - 1 - i) : (i - midRow)
        const entry = isAsk ? state.domAsks[dataIdx] : state.domBids[dataIdx]
        if (!entry) continue

        const size = entry.size
        const barRatio = Math.min(1, size / maxSize)
        // Clamp bar width to never exceed half column
        const barW = Math.min(barRatio * halfCol, halfCol - 2)

        // Spread row highlight
        if (i === midRow || i === midRow - 1) {
          const flashAlpha = state.domTradeFlash > 0
            ? (state.domTradeDir === (isAsk ? -1 : 1) ? 0.15 : 0.04)
            : 0.04
          ctx.fillStyle = `rgba(201,168,76,${flashAlpha})`
          ctx.fillRect(domX + pad, y, innerW, rowH)
        }

        // Bar — clamped inside pane
        if (isAsk) {
          const barAlpha = 0.25 + barRatio * 0.35
          ctx.fillStyle = `rgba(255,68,68,${barAlpha})`
          ctx.fillRect(domX + pad + halfCol - barW, y + 1, barW, rowH - 2)
        } else {
          const barAlpha = 0.25 + barRatio * 0.35
          ctx.fillStyle = `rgba(34,197,94,${barAlpha})`
          ctx.fillRect(domX + pad + halfCol, y + 1, barW, rowH - 2)
        }

        // Size text — clamped inside pane edges
        ctx.font = monoFont
        const sizeStr = size >= 100 ? size.toString() : size.toFixed(0)
        const flashColor = entry.flash > 0
          ? (isAsk ? 'rgba(255,120,120,0.9)' : 'rgba(80,220,120,0.9)')
          : 'rgba(255,255,255,0.35)'
        ctx.fillStyle = flashColor
        if (isAsk) {
          ctx.textAlign = 'left'
          ctx.fillText(sizeStr, domX + pad + 2, y + rowH / 2 + fontSize * 0.35)
        } else {
          ctx.textAlign = 'right'
          ctx.fillText(sizeStr, domX + domW - pad - 2, y + rowH / 2 + fontSize * 0.35)
        }

        // Price label near center
        const priceTop = BASE_PRICE - PRICE_RANGE / 2
        const levelPrice = priceTop + (i / DOM_ROWS) * PRICE_RANGE
        ctx.textAlign = 'center'
        ctx.fillStyle = i === midRow || i === midRow - 1
          ? 'rgba(201,168,76,0.7)'
          : 'rgba(255,255,255,0.18)'
        const priceFontSize = Math.max(5, fontSize - 1)
        ctx.font = `${priceFontSize}px "Fira Code", "Source Code Pro", "Consolas", monospace`
        ctx.fillText(
          levelPrice.toFixed(0),
          domX + pad + halfCol,
          y + rowH / 2 + priceFontSize * 0.35
        )

        // Row divider
        ctx.strokeStyle = 'rgba(255,255,255,0.03)'
        ctx.lineWidth = 0.5
        ctx.beginPath()
        ctx.moveTo(domX + pad, y)
        ctx.lineTo(domX + domW - pad, y)
        ctx.stroke()
      }

      // "BID" / "ASK" labels
      const labelSize = Math.max(5, fontSize - 2)
      ctx.font = `bold ${labelSize}px "Fira Code", "Source Code Pro", "Consolas", monospace`
      ctx.textAlign = 'center'
      ctx.fillStyle = 'rgba(255,68,68,0.5)'
      ctx.fillText('ASK', domX + pad + halfCol / 2, 10)
      ctx.fillStyle = 'rgba(34,197,94,0.5)'
      ctx.fillText('BID', domX + pad + halfCol + halfCol / 2, 10)

      // Decay flash
      if (state.domTradeFlash > 0) state.domTradeFlash -= 0.08
    }

    function draw(timestamp) {
      if (!lastTime) { lastTime = timestamp }
      const dt = Math.min(timestamp - lastTime, 50)
      lastTime = timestamp

      const { w, h } = getSize()
      if (!w || !h) { animId = requestAnimationFrame(draw); return }

      ctx.clearRect(0, 0, w, h)

      // Calculate DoM area with gap
      const domW = Math.floor(w * DOM_WIDTH_RATIO)
      const chartW = w - domW - DOM_GAP // heatmap + price line area
      const domX = chartW + DOM_GAP // DoM starts after gap

      // Update state
      updatePrice(dt)
      updateDom(timestamp)
      state.scrollOffset += SCROLL_SPEED * dt / 1000
      if (state.scrollOffset >= 1) {
        state.scrollOffset -= 1
        state.priceHistory.push(state.price)
        if (state.priceHistory.length > COLS + 20) state.priceHistory.shift()
        state.seed += 0.1
      }

      const cellW = chartW / COLS
      const cellH = h / ROWS
      const offsetPx = state.scrollOffset * cellW

      // ── Draw heatmap cells (only in chart area) ──
      const histLen = state.priceHistory.length
      for (let col = 0; col < COLS + 1; col++) {
        const x = col * cellW - offsetPx
        if (x + cellW < 0 || x > chartW) continue

        for (let row = 0; row < ROWS; row++) {
          const { intensity, type } = getLiqIntensity(row, histLen - COLS + col)
          if (intensity < 0.05) continue
          const color = intensityToColor(intensity, type)
          if (!color) continue
          ctx.fillStyle = color
          ctx.fillRect(
            x + CELL_GAP,
            row * cellH + CELL_GAP,
            cellW - CELL_GAP * 2,
            cellH - CELL_GAP * 2
          )
        }
      }

      // ── Draw subtle grid (chart area only) ──
      ctx.strokeStyle = 'rgba(255,255,255,0.015)'
      ctx.lineWidth = 0.5
      for (let r = 0; r < ROWS; r += 5) {
        const y = r * cellH
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(chartW, y)
        ctx.stroke()
      }
      for (let c = 0; c < COLS; c += 10) {
        const x = c * cellW - offsetPx
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, h)
        ctx.stroke()
      }

      // ── Draw price line (ends before DoM) ──
      const visibleHistory = state.priceHistory.slice(-(COLS + 1))
      if (visibleHistory.length > 1) {
        ctx.beginPath()
        ctx.strokeStyle = 'rgba(201, 168, 76, 0.5)'
        ctx.lineWidth = 1.5
        ctx.shadowColor = 'rgba(201, 168, 76, 0.25)'
        ctx.shadowBlur = 6

        for (let i = 0; i < visibleHistory.length; i++) {
          const x = Math.min(i * cellW - offsetPx, chartW - 10)
          const y = visibleHistory[i] * h
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
        ctx.shadowBlur = 0

        // Current price dot — anchor at chart right edge
        const dotX = Math.min((visibleHistory.length - 1) * cellW - offsetPx, chartW - 10)
        const dotY = visibleHistory[visibleHistory.length - 1] * h
        ctx.beginPath()
        ctx.arc(dotX, dotY, 4, 0, Math.PI * 2)
        ctx.fillStyle = '#c9a84c'
        ctx.fill()
        ctx.beginPath()
        ctx.arc(dotX, dotY, 7, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(201, 168, 76, 0.3)'
        ctx.lineWidth = 1.5
        ctx.stroke()

        // Horizontal price line extending to DoM
        ctx.setLineDash([3, 3])
        ctx.strokeStyle = 'rgba(201, 168, 76, 0.2)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(dotX, dotY)
        ctx.lineTo(w, dotY)
        ctx.stroke()
        ctx.setLineDash([])
      }

      // ── Y-axis price labels (at chart/DoM boundary) ──
      ctx.font = '10px "Fira Code", "Source Code Pro", "Consolas", monospace'
      ctx.textAlign = 'right'
      const priceTop = BASE_PRICE - PRICE_RANGE / 2
      for (let r = 0; r <= ROWS; r += 8) {
        const price = priceTop + (r / ROWS) * PRICE_RANGE
        const y = r * cellH
        ctx.fillStyle = 'rgba(255,255,255,0.15)'
        ctx.fillText(`$${price.toLocaleString()}`, chartW - 6, y + 3)
      }

      // ── Draw DoM ──
      drawDom(w, h, domX, domW)

      // ── Crosshair on hover (chart area only) ──
      if (state.mouse && state.mouse.x < chartW) {
        const mx = state.mouse.x
        const my = state.mouse.y

        ctx.setLineDash([4, 4])
        ctx.strokeStyle = 'rgba(201, 168, 76, 0.4)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(0, my)
        ctx.lineTo(chartW, my)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(mx, 0)
        ctx.lineTo(mx, h)
        ctx.stroke()
        ctx.setLineDash([])

        const hoverPrice = priceTop + (my / h) * PRICE_RANGE
        const label = `$${hoverPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
        ctx.font = '10px "Fira Code", "Source Code Pro", "Consolas", monospace'
        const labelW = ctx.measureText(label).width + 12
        ctx.fillStyle = 'rgba(201, 168, 76, 0.9)'
        ctx.fillRect(mx + 12, my - 10, labelW, 18)
        ctx.fillStyle = '#000'
        ctx.textAlign = 'left'
        ctx.fillText(label, mx + 18, my + 3)
      }

      animId = requestAnimationFrame(draw)
    }

    function onMouse(e) {
      const rect = canvas.getBoundingClientRect()
      stateRef.current.mouse = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    function onLeave() { stateRef.current.mouse = null }

    resize()
    animId = requestAnimationFrame(draw)

    canvas.addEventListener('mousemove', onMouse)
    canvas.addEventListener('mouseleave', onLeave)
    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(animId)
      canvas.removeEventListener('mousemove', onMouse)
      canvas.removeEventListener('mouseleave', onLeave)
      window.removeEventListener('resize', resize)
    }
  }, [getSize])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ zIndex: 0 }}
    />
  )
}
