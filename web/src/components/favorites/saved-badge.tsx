import { Bookmark } from 'lucide-react'

interface SavedBadgeProps {
  count: number
}

export function SavedBadge({ count }: SavedBadgeProps) {
  return (
    <span>
      <Bookmark aria-hidden="true" />
      {count} opgeslagen
    </span>
  )
}
