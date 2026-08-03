interface ProgressBarProps {
  current: number
  total: number
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = Math.round((current / total) * 100)

  return (
    <div className="mb-5">
      <div className="flex justify-between text-sm text-[#4b5563] mb-2">
        <span>
          Vraag {current} van {total}
        </span>
        <span>{pct}%</span>
      </div>
      <div className="h-3 bg-[#e5e7eb] rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#16a34a] to-[#15803d] rounded-full transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}