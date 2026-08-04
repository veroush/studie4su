import { useEffect, useRef, useState } from 'react'

// Ported 1:1 from v1 quiz.js — HEADER_ANIMATIONS
export const HEADER_ANIMATIONS = {
  confused: [
    '/img/stickman-confused1.svg',
    '/img/stickman-confused2.svg',
    '/img/stickman-confused3.svg',
    '/img/stickman-confused4.svg',
  ],
  exploring: [
    '/img/stickman-exploring1.svg',
    '/img/stickman-exploring2.svg',
    '/img/stickman-exploring3.svg',
    '/img/stickman-exploring4.svg',
  ],
  following: [
    '/img/stickman-following1.svg',
    '/img/stickman-following2.svg',
    '/img/stickman-following3.svg',
    '/img/stickman-following4.svg',
    '/img/stickman-following5.svg',
    '/img/stickman-following6.svg',
  ],
  celebrating: [
    '/img/stickman-celebrating1.svg',
    '/img/stickman-celebrating2.svg',
    '/img/stickman-celebrating3.svg',
    '/img/stickman-celebrating4.svg',
    '/img/stickman-celebrating5.svg',
    '/img/stickman-celebrating6.svg',
    '/img/stickman-celebrating7.svg',
    '/img/stickman-celebrating8.svg',
  ],
} as const

export type StickmanKey = keyof typeof HEADER_ANIMATIONS
export type StickmanPosition = 'left' | 'right'

// Ported 1:1 from v1 quiz.js — QUIZ_ANIMATION_STEPS
// Anything past index 7 falls back to step[0], same as v1's `|| QUIZ_ANIMATION_STEPS[0]`.
export const QUIZ_ANIMATION_STEPS: { key: StickmanKey; position: StickmanPosition }[] = [
  { key: 'confused', position: 'right' },
  { key: 'confused', position: 'right' },
  { key: 'exploring', position: 'left' },
  { key: 'exploring', position: 'left' },
  { key: 'exploring', position: 'left' },
  { key: 'following', position: 'right' },
  { key: 'following', position: 'right' },
  { key: 'following', position: 'right' },
]

export function getQuizAnimationStep(questionIndex: number) {
  return QUIZ_ANIMATION_STEPS[questionIndex] ?? QUIZ_ANIMATION_STEPS[0]
}

// Warms the browser image cache so frames don't flicker on first play — ported from v1's preloadAnimationFrames()
export function preloadAnimationFrames() {
  Object.values(HEADER_ANIMATIONS)
    .flat()
    .forEach((src) => {
      const image = new Image()
      image.src = src
    })
}

// React port of v1's LoopingFrameAnimator class.
// Timer starts once on mount and never restarts — play() only swaps which
// frame array is being cycled through and resets the index, exactly mirroring
// v1's `if (this.timer) return` behavior (no hitch/restart on sequence swap).
export function useLoopingFrameAnimator(fps = 8) {
  const framesRef = useRef<readonly string[]>([])
  const indexRef = useRef(0)
  const [src, setSrc] = useState<string | undefined>(undefined)

  function play(frames: readonly string[]) {
    if (!Array.isArray(frames) || frames.length === 0) return
    const switchedSequence = framesRef.current !== frames
    framesRef.current = frames
    if (switchedSequence) indexRef.current = 0
    setSrc(frames[indexRef.current])
  }

  useEffect(() => {
    const ms = Math.round(1000 / fps)
    const id = window.setInterval(() => {
      const frames = framesRef.current
      if (!frames.length) return
      indexRef.current = (indexRef.current + 1) % frames.length
      setSrc(frames[indexRef.current])
    }, ms)
    return () => window.clearInterval(id)
  }, [fps])

  return { src, play }
}