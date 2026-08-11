import { OUTLINE_PATHS, COLOR_PATHS } from './graduate-smiley-paths'

interface GraduateLoaderProps {
  /** 0–100 */
  progress: number
  size?: number
  /** Show the "N%" label under the artwork. Default true. */
  showLabel?: boolean
}

// Bounding box of the traced artwork inside the 210x297 page, with a little padding.
// Computed from the actual path geometry (x: 26.3–184.0, y: 77.1–218.8).
const BOX = { x: 21, y: 72, width: 168, height: 152 }
const VIEW_BOX = `${BOX.x} ${BOX.y} ${BOX.width} ${BOX.height}`

export function GraduateLoader({ progress, size = 160, showLabel = true }: GraduateLoaderProps) {
  const clamped = Math.max(0, Math.min(100, progress))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <svg
        viewBox={VIEW_BOX}
        width={size}
        height={size}
        role="img"
        aria-label={`Loading, ${Math.round(clamped)} percent`}
      >
        <defs>
          <clipPath id="graduate-loader-clip" clipPathUnits="userSpaceOnUse">
            {/* Fills bottom-up: y/height driven by progress. Bounds match VIEW_BOX. */}
            <rect
              x={BOX.x}
              y={BOX.y + BOX.height * (1 - clamped / 100)}
              width={BOX.width}
              height={BOX.height * (clamped / 100)}
            />
          </clipPath>
        </defs>

        {/* Dimmed base — always visible */}
        <g opacity={0.15}>
          {COLOR_PATHS.map((p, i) => (
            <path key={`dim-${i}`} d={p.d} fill="#000000" />
          ))}
        </g>

        {/* Full-color fill — revealed by the clip as progress rises */}
        <g clipPath="url(#graduate-loader-clip)">
          {COLOR_PATHS.map((p, i) => (
            <path key={`color-${i}`} d={p.d} fill={p.fill} />
          ))}
        </g>

        {/* Outlines — always on top, always fully visible */}
        <g fill="none" stroke="#000000" strokeWidth={0.5}>
          {OUTLINE_PATHS.map((d, i) => (
            <path key={`outline-${i}`} d={d} />
          ))}
        </g>
      </svg>

      {showLabel && <span style={{ fontSize: 14, fontWeight: 500 }}>{Math.round(clamped)}%</span>}
    </div>
  )
}