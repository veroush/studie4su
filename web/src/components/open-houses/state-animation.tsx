import { useEffect, useState } from 'react'

const CHASER_FRAMES = [
  '/img/chasing-1.svg', '/img/chasing-2.svg', '/img/chasing-3.svg',
  '/img/chasing-4.svg', '/img/chasing-5.svg', '/img/chasing-6.svg',
]
const RUNNER_FRAMES = [
  '/img/running-1.svg', '/img/running-2.svg', '/img/running-3.svg',
  '/img/running-4.svg', '/img/running-5.svg', '/img/running-6.svg',
]
const STICKMAN_FRAMES = [
  '/img/stickman-confused1.svg', '/img/stickman-confused2.svg',
  '/img/stickman-confused3.svg', '/img/stickman-confused4.svg',
]

interface StateAnimationProps {
  kind: 'loading' | 'empty'
  message: string
}

export function StateAnimation({ kind, message }: StateAnimationProps) {
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    setFrame(0)
    const interval = kind === 'loading' ? 150 : 400
    const frameCount = kind === 'loading' ? CHASER_FRAMES.length : STICKMAN_FRAMES.length
    const id = window.setInterval(() => setFrame((f) => (f + 1) % frameCount), interval)
    return () => window.clearInterval(id)
  }, [kind])

  return (
    <div className="rounded-2xl bg-white p-12 text-center shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)]">
      {kind === 'loading' ? (
        <div className="relative mx-auto mb-4 h-[160px] w-full max-w-[260px]">
          <img src={CHASER_FRAMES[frame]} alt="" className="absolute bottom-[30px] left-[30px] h-[86px] w-[86px]" />
          <img src={RUNNER_FRAMES[frame]} alt="" className="absolute bottom-[30px] left-[170px] h-[86px] w-[86px]" />
        </div>
      ) : (
        <div className="mx-auto mb-4 flex h-[150px] w-full max-w-[180px] items-center justify-center">
          <img src={STICKMAN_FRAMES[frame]} alt="" className="h-[120px] w-[120px] object-contain" />
        </div>
      )}
      <p className="text-lg text-[#6b7280]">{message}</p>
    </div>
  )
}