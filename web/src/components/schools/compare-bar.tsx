import { Link } from '@tanstack/react-router'

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
    <div role="region" aria-label="Vergelijken">
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            {item.name}
            <button type="button" onClick={() => onRemove(item.id)} aria-label={`Verwijder ${item.name} uit vergelijking`}>
              ✕
            </button>
          </li>
        ))}
      </ul>

      <div>
        <button type="button" onClick={onClear}>
          Wissen
        </button>
        <Link to={compareTo}>Vergelijk ({items.length})</Link>
      </div>
    </div>
  )
}
