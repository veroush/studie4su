interface CompareSelectBannerProps {
  count: number
  onCancel: () => void
}

// Shown while the user is picking a program to add to the comparison
// from the school detail page.
export function CompareSelectBanner({ count, onCancel }: CompareSelectBannerProps) {
  return (
    <div role="status">
      <p>Selecteer een opleiding om te vergelijken ({count}/4 geselecteerd)</p>
      <button type="button" onClick={onCancel}>
        Annuleren
      </button>
    </div>
  )
}
