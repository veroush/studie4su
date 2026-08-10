import { useEffect, useRef, useState } from 'react'

/**
 * Fixed vertical line on the right edge of the viewport that fills from 0% to
 * 100% as the user scrolls from the top to the bottom of the page. Mounted
 * once in __root.tsx so it's present on every route.
 *
 * The displayed fill eases toward the real scroll percentage every frame
 * (rather than snapping to it), so it glides smoothly even when the raw
 * scroll input itself is choppy (e.g. mouse wheel scrolling in steps).
 */
export function ScrollProgress() {
  const [displayProgress, setDisplayProgress] = useState(0)
  const targetRef = useRef(0)
  const currentRef = useRef(0)
  const frameRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    function measureTarget() {
      const scrollTop = window.scrollY
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      const pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0
      targetRef.current = Math.min(100, Math.max(0, pct))
    }

    function tick() {
      const diff = targetRef.current - currentRef.current
      // Snap once close enough to avoid endlessly animating a fraction of a pixel.
      if (Math.abs(diff) < 0.05) {
        currentRef.current = targetRef.current
      } else {
        // Ease 15% of the remaining distance closer each frame.
        currentRef.current += diff * 0.15
      }
      setDisplayProgress(currentRef.current)
      frameRef.current = requestAnimationFrame(tick)
    }

    measureTarget()
    currentRef.current = targetRef.current
    frameRef.current = requestAnimationFrame(tick)

    window.addEventListener('scroll', measureTarget, { passive: true })
    window.addEventListener('resize', measureTarget)
    return () => {
      window.removeEventListener('scroll', measureTarget)
      window.removeEventListener('resize', measureTarget)
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [])

  return (
    <div
      aria-hidden="true"
      className="fixed right-0 top-0 z-[200] h-full w-[4px] bg-white/[0.06]"
    >
      <div
        className="w-full bg-[var(--gold)] shadow-[0_0_8px_rgba(232,184,75,0.6)]"
        style={{ height: `${displayProgress}%`, willChange: 'height' }}
      />
    </div>
  )
}