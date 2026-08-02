import { useEffect, useState } from 'react'

// Decorative illustration for the Favorites page.
// Simplified from v1: paintings fade in once on mount instead of
// cycling through animated painter-1..4.svg stickman frames.
export function PainterScene() {
  const [revealed, setRevealed] = useState(0)

  useEffect(() => {
    if (revealed >= 4) return
    const timer = setTimeout(() => setRevealed((n) => n + 1), 350)
    return () => clearTimeout(timer)
  }, [revealed])

  const paintings = [
    { src: '/img/painting-1.svg', style: { top: -70, left: -14, width: 150, height: 150 } },
    { src: '/img/painting-2.svg', style: { top: 6, left: -14, width: 150, height: 150 } },
    { src: '/img/painting-3.svg', style: { top: 10, left: -4, width: 120, height: 120 } },
    { src: '/img/painting-4.svg', style: { top: 52, left: -2, width: 130, height: 130 } },
  ]

  return (
    <div aria-hidden="true" className="relative hidden h-[190px] w-[260px] flex-shrink-0 sm:block">
      <div className="absolute left-[95px] top-2 h-[190px] w-[190px]">
        {paintings.map((p, i) => (
          <img
            key={p.src}
            src={p.src}
            alt=""
            style={{ ...p.style, position: 'absolute' }}
            className={`transition-opacity duration-700 ${i < revealed ? 'opacity-100' : 'opacity-0'}`}
          />
        ))}
      </div>
      <img src="/img/painter-1.svg" alt="" className="absolute bottom-0 left-[-25px] w-[115px]" />
    </div>
  )
}