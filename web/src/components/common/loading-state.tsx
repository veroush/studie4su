import { useEffect, useState } from 'react'
import { GraduateLoader } from './graduate-loader'

interface LoadingStateProps {
  message?: string
}

export function LoadingState({ message = 'Even geduld...' }: LoadingStateProps) {
  // No real progress value is available here (we're just waiting on a
  // fetch), so animate the fill back and forth to read as "in progress"
  // rather than a stalled 0% or 100%.
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let frame: number
    const start = performance.now()
    const cycleMs = 1600

    const tick = (now: number) => {
      const t = ((now - start) % cycleMs) / cycleMs
      const pct = t < 0.5 ? t * 2 : 2 - t * 2
      setProgress(pct * 100)
      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div role="status" aria-live="polite" className="flex flex-col items-center justify-center gap-3 py-10">
      <GraduateLoader progress={progress} size={120} />
      <p className="text-[#8aab96] text-sm">{message}</p>
    </div>
  )
}
