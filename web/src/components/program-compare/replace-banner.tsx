interface ReplaceBannerProps {
  onCancel: () => void
}

// Comparison is capped at 3 programs — shown when the user tries to
// add a 4th, prompting them to pick one to replace.
export function ReplaceBanner({ onCancel }: ReplaceBannerProps) {
  return (
    <div role="status">
      <p>Je kan maximaal 3 opleidingen vergelijken. Kies een opleiding om te vervangen.</p>
      <button type="button" onClick={onCancel}>
        Annuleren
      </button>
    </div>
  )
}
