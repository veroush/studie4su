interface AnimatedQuizHeaderProps {
  title: string
  subtitle: string
  stickmanSide?: 'left' | 'right'
  frameSrc?: string
}

export function AnimatedQuizHeader({
  title,
  subtitle,
  stickmanSide = 'right',
  frameSrc,
}: AnimatedQuizHeaderProps) {
  return (
    <div className="relative flex flex-col md:flex-row items-center justify-center gap-3 md:gap-6 md:min-h-[160px] md:px-[160px]">
      <div className="flex-[0_1_100%] min-w-0 w-full max-w-[46rem] mx-auto text-center">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-[#111827] mb-3">
          {title}
        </h1>
        <p className="text-lg text-[#4b5563]">{subtitle}</p>
      </div>

      <div
        aria-hidden="true"
        className={`relative md:absolute md:top-1/2 md:-translate-y-1/2 flex-shrink-0 flex items-center justify-center overflow-hidden rounded-2xl w-[104px] h-[104px] min-w-[104px] min-h-[104px] md:w-[200px] md:h-[200px] md:min-w-[132px] md:min-h-[132px] ${
          stickmanSide === 'left' ? 'md:left-0' : 'md:right-0'
        }`}
      >
        {frameSrc && (
          <img
            src={frameSrc}
            alt=""
            decoding="async"
            className="w-full h-full object-fill block"
          />
        )}
      </div>
    </div>
  )
}