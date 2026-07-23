interface ProgressBarProps {
  current: number
  total: number
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  return (
    <div role="progressbar" aria-valuenow={current} aria-valuemin={1} aria-valuemax={total}>
      <div style={{ width: `${(current / total) * 100}%` }} />
      <span>
        Vraag {current} van {total}
      </span>
    </div>
  )
}
