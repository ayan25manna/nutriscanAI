import { useRingCanvas } from '../hooks/useRingCanvas.js'

export default function RingChart({
  pct = 0,
  color = '#059669',
  trackColor = '#d1fae5',
  lineWidth = 13,
  size = 150,
  pulse = false,
  children,
}) {
  const ref = useRingCanvas(pct, color, trackColor, lineWidth)

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <canvas
        ref={ref}
        width={size}
        height={size}
        className={pulse ? 'ring-pulse' : ''}
        style={{ width: size, height: size, display: 'block' }}
      />
      {children && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {children}
        </div>
      )}
    </div>
  )
}
