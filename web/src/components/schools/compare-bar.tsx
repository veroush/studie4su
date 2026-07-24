import { Link } from "@tanstack/react-router"
import { X } from "lucide-react"

interface CompareBarItem {
  id: string
  name: string
}

interface CompareBarProps {
  items: CompareBarItem[]
  onRemove: (id: string) => void
  onClear: () => void
  compareTo: string
}

export function CompareBar({ items, onRemove, onClear, compareTo }: CompareBarProps) {
  if (items.length === 0) return null

  return (
    <div
      role="region"
      aria-label="Vergelijken"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-[#16a34a] to-[#15803d] text-white rounded-2xl shadow-2xl px-6 py-3.5 flex items-center gap-4 flex-wrap justify-center max-w-[calc(100vw-2rem)] animate-[slideUp_0.3s_ease]"
    >
      <ul className="flex items-center gap-2 flex-wrap">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center gap-1.5 bg-white/15 rounded-full pl-3 pr-1.5 py-1 text-xs font-medium"
          >
            {item.name}
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              aria-label={`Verwijder ${item.name} uit vergelijking`}
              className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
            >
              <X size={12} />
            </button>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-3">
        <Link
          to={compareTo}
          className="bg-white text-[#15803d] text-sm font-semibold px-[18px] py-2 rounded-lg hover:bg-[#f3f4f6] transition-colors whitespace-nowrap"
        >
          Vergelijk
        </Link>
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-white/70 hover:text-white transition-colors px-2 py-1 rounded"
        >
          Wis
        </button>
      </div>
    </div>
  )
}
