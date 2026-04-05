import { useEffect, useRef } from 'react'

export function useRingCanvas(pct, color, trackColor, lineWidth = 13) {
  const ref = useRef(null)

  useEffect(() => {
    const cv = ref.current
    if (!cv) return
    const dpr = window.devicePixelRatio || 1
    const size = cv.offsetWidth
    cv.width = size * dpr
    cv.height = size * dpr
    const ctx = cv.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const cx = size / 2, cy = size / 2
    const r = size / 2 - lineWidth

    ctx.clearRect(0, 0, size, size)
    // Track
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.strokeStyle = trackColor
    ctx.lineWidth = lineWidth
    ctx.stroke()
    // Fill
    if (pct > 0) {
      ctx.beginPath()
      ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (pct / 100))
      ctx.strokeStyle = color
      ctx.lineWidth = lineWidth
      ctx.lineCap = 'round'
      ctx.stroke()
    }
  }, [pct, color, trackColor, lineWidth])

  return ref
}
