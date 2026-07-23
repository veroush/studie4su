interface QuizNavRowProps {
  onPrev: () => void
  onNext: () => void
  canGoPrev: boolean
  canGoNext: boolean
  isLast?: boolean
}

export function QuizNavRow({ onPrev, onNext, canGoPrev, canGoNext, isLast = false }: QuizNavRowProps) {
  return (
    <div>
      <button type="button" onClick={onPrev} disabled={!canGoPrev}>
        Vorige
      </button>
      <button type="button" onClick={onNext} disabled={!canGoNext}>
        {isLast ? 'Bekijk resultaten' : 'Volgende'}
      </button>
    </div>
  )
}
