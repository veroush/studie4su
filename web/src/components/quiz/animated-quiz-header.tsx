interface AnimatedQuizHeaderProps {
  title: string
  stickmanSide?: 'left' | 'right'
}

export function AnimatedQuizHeader({ title, stickmanSide = 'left' }: AnimatedQuizHeaderProps) {
  return (
    <header data-stickman-side={stickmanSide}>
      {stickmanSide === 'left' && (
        <img src="/img/running-1.svg" alt="" aria-hidden="true" />
      )}

      <h1>{title}</h1>

      {stickmanSide === 'right' && (
        <img src="/img/running-1.svg" alt="" aria-hidden="true" />
      )}
    </header>
  )
}
