import { useEffect, useRef, useState } from 'react'

type IconType = 'coffee' | 'grad' | 'notebook' | 'pen' | 'glasses' | 'paperclip' | 'backpack' | 'calculator'

interface IconDef {
  color: 'fi-gold' | 'fi-green' | 'fi-teal'
  viewBox: string
  render: () => React.ReactNode
}

const ICONS: Record<IconType, IconDef> = {
  coffee: {
    color: 'fi-gold',
    viewBox: '0 0 28 32',
    render: () => (
      <>
        <path className="fi-steam fi-steam-1" d="M8 7 Q9.5 4.5 8 1.5" fill="none" strokeLinecap="round" />
        <path className="fi-steam fi-steam-2" d="M14 7 Q15.5 4.5 14 1.5" fill="none" strokeLinecap="round" />
        <path className="fi-steam fi-steam-3" d="M20 7 Q21.5 4.5 20 1.5" fill="none" strokeLinecap="round" />
        <path d="M23 11h2a4 4 0 0 1 0 8h-2" fill="none" />
        <path d="M3 11h20v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z" fill="none" />
      </>
    ),
  },
  grad: {
    color: 'fi-green',
    viewBox: '0 0 24 24',
    render: () => (
      <>
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" fill="none" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" fill="none" />
        <line className="fi-tassel" x1="22" y1="10" x2="22" y2="16" />
      </>
    ),
  },
  notebook: {
    color: 'fi-gold',
    viewBox: '0 0 24 24',
    render: () => (
      <>
        <rect x="3" y="3" width="6" height="18" rx="2" fill="none" />
        <line x1="3" y1="9" x2="9" y2="9" />
        <line x1="3" y1="15" x2="9" y2="15" />
        <rect
          className="fi-nb-page"
          x="9"
          y="3"
          width="12"
          height="18"
          rx="2"
          fill="rgba(232,184,75,0)"
          stroke="currentColor"
        />
      </>
    ),
  },
  pen: {
    color: 'fi-green',
    viewBox: '0 0 40 40',
    render: () => (
      <>
        <g transform="translate(8,4) scale(0.85)">
          <path d="M12 20h9" fill="none" />
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z" fill="none" />
        </g>
        <path
          className="fi-draw-line"
          d="M7 24 Q14 31 23 35"
          stroke="#e8b84b"
          strokeWidth={1.7}
          strokeDasharray="33"
          strokeDashoffset="33"
          opacity={0}
          fill="none"
          strokeLinecap="round"
        />
      </>
    ),
  },
  glasses: {
    color: 'fi-gold',
    viewBox: '0 0 24 24',
    render: () => (
      <>
        <circle cx="6" cy="15" r="4" fill="none" />
        <circle cx="18" cy="15" r="4" fill="none" />
        <path d="M10 13a2 2 0 0 1 4 0" fill="none" />
        <path d="M2 13h4M20 13h2" fill="none" />
        <circle className="fi-eye fi-eye-l" cx="6" cy="15" r="1.4" fill="currentColor" stroke="none" opacity={0} />
        <circle className="fi-eye fi-eye-r" cx="18" cy="15" r="1.4" fill="currentColor" stroke="none" opacity={0} />
      </>
    ),
  },
  paperclip: {
    color: 'fi-teal',
    viewBox: '0 0 24 24',
    render: () => (
      <path
        className="fi-clip-path"
        d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"
        fill="none"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  backpack: {
    color: 'fi-green',
    viewBox: '0 0 24 24',
    render: () => (
      <>
        <path d="M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" fill="none" />
        <path d="M9 6V4a3 3 0 0 1 6 0v2" fill="none" />
        <line x1="4" y1="15" x2="20" y2="15" />
        <path d="M10 15v2a2 2 0 0 0 4 0v-2" fill="none" />
      </>
    ),
  },
  calculator: {
    color: 'fi-gold',
    viewBox: '0 0 24 24',
    render: () => (
      <>
        <rect x="4" y="2" width="16" height="20" rx="2" fill="none" />
        <rect x="7" y="5" width="10" height="4" rx="1" fill="none" />
        {[
          [8, 13],
          [12, 13],
          [16, 13],
          [8, 17],
          [12, 17],
          [16, 17],
        ].map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} className="fi-calc-btn" cx={cx} cy={cy} r="1.2" fill="currentColor" opacity={0.4} />
        ))}
      </>
    ),
  },
}

const ICON_TYPES = Object.keys(ICONS) as IconType[]

interface Layer {
  id: string
  num: number
  count: number
  durMin: number
  durMax: number
  szMin: number
  szMax: number
  kf: string
  interactive: boolean
}

const LAYERS: Layer[] = [
  { id: 'fi-l1', num: 1, count: 14, durMin: 50, durMax: 65, szMin: 14, szMax: 18, kf: 'fi-drift-l1', interactive: false },
  { id: 'fi-l2', num: 2, count: 14, durMin: 35, durMax: 50, szMin: 20, szMax: 28, kf: 'fi-drift-l2', interactive: false },
  { id: 'fi-l3', num: 3, count: 14, durMin: 22, durMax: 34, szMin: 28, szMax: 38, kf: 'fi-drift-l3', interactive: false },
  { id: 'fi-l4', num: 4, count: 16, durMin: 15, durMax: 25, szMin: 40, szMax: 52, kf: 'fi-drift-l4', interactive: true },
]

const ANIM_MS: Record<IconType, number> = {
  coffee: 1200,
  grad: 950,
  notebook: 2600,
  pen: 1900,
  glasses: 1700,
  paperclip: 900,
  backpack: 700,
  calculator: 600,
}

interface IconInstance {
  key: string
  layerNum: number
  type: IconType
  interactive: boolean
  xPct: number
  dur: number
  delay: number
  rot: number
  sz: number
  sw: number
  kf: string
}

function rand(min: number, max: number) {
  return min + Math.random() * (max - min)
}
function randInt(min: number, max: number) {
  return Math.floor(rand(min, max + 1))
}

function distributedX(count: number): number[] {
  const positions: number[] = []
  const step = 94 / count
  for (let i = 0; i < count; i++) {
    const base = 2 + i * step + step * 0.5
    const jitter = step * 0.28
    positions.push(Math.max(2, Math.min(96, base + rand(-jitter, jitter))))
  }
  for (let i = positions.length - 1; i > 0; i--) {
    const j = randInt(0, i)
    ;[positions[i], positions[j]] = [positions[j], positions[i]]
  }
  return positions
}

function buildLayerIcons(layer: Layer, isMobile: boolean): IconInstance[] {
  const count = isMobile ? Math.ceil(layer.count * 0.55) : layer.count
  const xSlots = distributedX(count)
  const icons: IconInstance[] = []

  for (let i = 0; i < count; i++) {
    const type = ICON_TYPES[i % ICON_TYPES.length]
    const sz = rand(layer.szMin, layer.szMax)
    const sw = 1.1 + ((sz - layer.szMin) / (layer.szMax - layer.szMin)) * 0.5

    icons.push({
      key: `${layer.id}-${i}`,
      layerNum: layer.num,
      type,
      interactive: layer.interactive,
      xPct: xSlots[i],
      dur: Number(rand(layer.durMin, layer.durMax).toFixed(1)),
      delay: Number((-rand(0, layer.durMax)).toFixed(1)),
      rot: Number(rand(-4.5, 4.5).toFixed(2)),
      sz,
      sw,
      kf: layer.kf,
    })
  }
  return icons
}

export function FloatingIconsBackground() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [layerIcons, setLayerIcons] = useState<IconInstance[] | null>(null)

  // Generate the icon field once on mount (client-only — matches v1's DOMContentLoaded init,
  // avoids any SSR/hydration mismatch since positions are randomised)
  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 640px)').matches
    const all = LAYERS.filter((layer) => !(isMobile && (layer.num === 1 || layer.num === 2))).flatMap((layer) =>
      buildLayerIcons(layer, isMobile),
    )
    setLayerIcons(all)
  }, [])

  // Click + hover interaction — document-level, coordinate-based hit-test,
  // stacking-context-agnostic, matching v1's approach exactly
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const cooldown = new WeakMap<Element, number>()
    const isReady = (wrap: Element) => {
      const until = cooldown.get(wrap)
      return until === undefined || Date.now() >= until
    }

    function hitTest(clientX: number, clientY: number): HTMLElement | null {
      const wraps = Array.from(container!.querySelectorAll<HTMLElement>('.fi-clickable'))
      const pad = 14
      for (const w of wraps) {
        const r = w.getBoundingClientRect()
        if (clientX >= r.left - pad && clientX <= r.right + pad && clientY >= r.top - pad && clientY <= r.bottom + pad) {
          return w
        }
      }
      return null
    }

    function triggerIcon(wrap: HTMLElement) {
      const type = wrap.dataset.type as IconType | undefined
      if (!type || !isReady(wrap)) return

      const cls = `fi--clicked-${type}`
      cooldown.set(wrap, Date.now() + (ANIM_MS[type] || 1000))
      wrap.classList.remove(cls)

      if (type === 'pen') {
        wrap.querySelectorAll<SVGPathElement>('.fi-draw-line').forEach((l) => {
          l.style.transition = 'none'
          l.style.strokeDashoffset = '33'
          l.style.opacity = '0'
        })
      }
      if (type === 'glasses') {
        wrap.querySelectorAll<SVGCircleElement>('.fi-eye').forEach((e) => {
          e.style.opacity = '0'
        })
      }

      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          wrap.classList.add(cls)

          if (type === 'pen') {
            wrap.querySelectorAll<SVGPathElement>('.fi-draw-line').forEach((l) => {
              requestAnimationFrame(() => {
                l.style.transition = 'stroke-dashoffset 1.4s cubic-bezier(.4,0,.2,1), opacity .2s'
                l.style.strokeDashoffset = '0'
                l.style.opacity = '1'
              })
            })
          }

          setTimeout(() => {
            wrap.classList.remove(cls)
            if (type === 'pen') {
              wrap.querySelectorAll<SVGPathElement>('.fi-draw-line').forEach((l) => {
                l.style.transition = 'none'
                l.style.strokeDashoffset = '33'
                l.style.opacity = '0'
                requestAnimationFrame(() => {
                  l.style.transition = ''
                })
              })
            }
            if (type === 'glasses') {
              setTimeout(() => {
                wrap.querySelectorAll<SVGCircleElement>('.fi-eye').forEach((e) => {
                  e.style.opacity = ''
                })
              }, 300)
            }
          }, ANIM_MS[type] || 1000)
        }),
      )
    }

    function handleClick(e: MouseEvent) {
      const hit = hitTest(e.clientX, e.clientY)
      if (hit) triggerIcon(hit)
    }

    let lastHover: HTMLElement | null = null
    function handleMouseMove(e: MouseEvent) {
      const found = hitTest(e.clientX, e.clientY)
      if (found === lastHover) return

      if (lastHover) {
        const svg = lastHover.querySelector<SVGSVGElement>('.fi-icon')
        if (svg) {
          svg.style.opacity = ''
          svg.style.filter = ''
        }
        document.body.style.cursor = ''
      }
      if (found) {
        const svg = found.querySelector<SVGSVGElement>('.fi-icon')
        if (svg) {
          svg.style.opacity = '0.40'
          svg.style.filter = 'drop-shadow(0 0 9px rgba(232,184,75,.55))'
        }
        document.body.style.cursor = 'pointer'
      }
      lastHover = found
    }

    document.addEventListener('click', handleClick)
    document.addEventListener('mousemove', handleMouseMove)
    return () => {
      document.removeEventListener('click', handleClick)
      document.removeEventListener('mousemove', handleMouseMove)
    }
  }, [layerIcons])

  return (
    <div ref={containerRef} className="fi-stage" aria-hidden="true">
      {[1, 2, 3, 4].map((num) => (
        <div key={num} className="fi-layer" data-layer={num}>
          {layerIcons
            ?.filter((icon) => icon.layerNum === num)
            .map((icon) => {
              const def = ICONS[icon.type]
              return (
                <div
                  key={icon.key}
                  className={`fi-wrap${icon.interactive ? ' fi-clickable' : ''}`}
                  data-type={icon.type}
                  style={
                    {
                      '--x': `${icon.xPct.toFixed(1)}%`,
                      '--dur': `${icon.dur}s`,
                      '--delay': `${icon.delay}s`,
                      '--rot': `${icon.rot}deg`,
                      '--sz': `${icon.sz.toFixed(0)}px`,
                      '--kf': icon.kf,
                    } as React.CSSProperties
                  }
                >
                  <svg
                    viewBox={def.viewBox}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={icon.sw.toFixed(2)}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`fi-icon ${def.color}`}
                    style={{ width: icon.sz, height: icon.sz, display: 'block' }}
                  >
                    {def.render()}
                  </svg>
                </div>
              )
            })}
        </div>
      ))}
    </div>
  )
}