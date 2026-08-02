import { useEffect, useState } from 'react'

const CHASER_FRAMES = [
  '/img/chasing-1.svg', '/img/chasing-2.svg', '/img/chasing-3.svg',
  '/img/chasing-4.svg', '/img/chasing-5.svg', '/img/chasing-6.svg',
]
const RUNNER_FRAMES = [
  '/img/running-1.svg', '/img/running-2.svg', '/img/running-3.svg',
  '/img/running-4.svg', '/img/running-5.svg', '/img/running-6.svg',
]
const STICKMAN_CONFUSED_FRAMES = [
  '/img/stickman-confused1.svg', '/img/stickman-confused2.svg',
  '/img/stickman-confused3.svg', '/img/stickman-confused4.svg',
]

// Ported from v1 public/js/state-loader.js — that file starts both
// animations at frame index 1 (not 0), so we replicate that exactly.
export function useChaserRunnerAnimation(active: boolean) {
  const [frame, setFrame] = useState(1)

  useEffect(() => {
    if (!active) return
    setFrame(1)
    const id = window.setInterval(() => {
      setFrame((f) => (f + 1) % CHASER_FRAMES.length)
    }, 150)
    return () => window.clearInterval(id)
  }, [active])

  return { chaserSrc: CHASER_FRAMES[frame], runnerSrc: RUNNER_FRAMES[frame] }
}

export function useConfusedStickmanAnimation(active: boolean) {
  const [frame, setFrame] = useState(1)

  useEffect(() => {
    if (!active) return
    setFrame(1)
    const id = window.setInterval(() => {
      setFrame((f) => (f + 1) % STICKMAN_CONFUSED_FRAMES.length)
    }, 400)
    return () => window.clearInterval(id)
  }, [active])

  return STICKMAN_CONFUSED_FRAMES[frame]
}