import { Heart } from 'lucide-react'

interface SavedBadgeProps {
  count: number
}

export function SavedBadge({ count }: SavedBadgeProps) {
  return (
    <span className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-[#fee2e2] px-4 py-2 text-sm font-medium text-[#991b1b]">
      <Heart size={16} className="text-[#dc2626]" fill="currentColor" aria-hidden="true" />
      {count} opgeslagen items
    </span>
  )
}