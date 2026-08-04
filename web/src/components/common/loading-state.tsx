interface LoadingStateProps {
  message?: string
}

export function LoadingState({ message = 'Even geduld...' }: LoadingStateProps) {
  return (
    <div role="status" aria-live="polite">
      {/* stickman running/chaser animation (svg or lottie) goes here */}
      <img src="/img/running-1.svg" alt="" aria-hidden="true" />
      <p>{message}</p>
    </div>
  )
}
