import { Plus } from 'lucide-react'

interface EmptySlotCardProps {
  onClick: () => void
}

export function EmptySlotCard({ onClick }: EmptySlotCardProps) {
  return (
    <button type="button" onClick={onClick}>
      <Plus aria-hidden="true" />
      <span>Opleiding toevoegen</span>
    </button>
  )
}
