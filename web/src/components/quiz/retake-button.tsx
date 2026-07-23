interface RetakeButtonProps {
  onRetake: () => void
}

export function RetakeButton({ onRetake }: RetakeButtonProps) {
  return (
    <button type="button" onClick={onRetake}>
      Opnieuw doen
    </button>
  )
}
