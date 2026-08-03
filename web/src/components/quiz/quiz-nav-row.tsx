interface QuizNavRowProps {
  onPrev: () => void
  onNext: () => void
  canGoPrev: boolean
  canGoNext: boolean
  isLast: boolean
  isPending: boolean
}

export function QuizNavRow({ onPrev, onNext, canGoPrev, canGoNext, isLast, isPending }: QuizNavRowProps) {
  return (
    <div className="flex justify-between gap-4 mt-3">
      <button
        type="button"
        onClick={onPrev}
        disabled={!canGoPrev}
        className="flex items-center gap-2 rounded-lg border-2 border-[#d1d5db] bg-white px-5 py-2.5 text-sm font-medium text-[#374151] transition-colors disabled:opacity-50 disabled:cursor-not-allowed enabled:hover:bg-[#f9fafb]"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Vorige
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={!canGoNext}
        className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#16a34a] to-[#15803d] px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed enabled:hover:from-[#15803d] enabled:hover:to-[#166534]"
      >
        {isLast ? (isPending ? 'Bezig...' : 'Bekijk Resultaten') : 'Volgende'}
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  )
}