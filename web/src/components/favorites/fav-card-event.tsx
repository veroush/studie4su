import { Link } from '@tanstack/react-router'
import { Calendar, MapPin } from 'lucide-react'
import { FavoriteButton } from '@/components/common/favorite-button'

interface FavCardEventProps {
  event: {
    id: string
    title: string
    date: string
    isOnline: boolean
    location?: string | null
  }
  onRemoved?: () => void
}

export function FavCardEvent({ event, onRemoved }: FavCardEventProps) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)]">
      <div className="relative flex items-center justify-end bg-gradient-to-br from-[#0e7490] to-[#0c4a6e] px-4 py-3">
        <FavoriteButton
          type="openhouse"
          itemId={event.id}
          initialFavorited
          onToggle={(favorited) => {
            if (!favorited) onRemoved?.()
          }}
        />
      </div>

      <div className="flex flex-1 items-start gap-4 p-5">
        <div className="flex h-[52px] w-[52px] flex-shrink-0 items-center justify-center rounded-xl border-2 border-[#dcfce7] bg-[#f0fdf4] text-[#15803d]">
          <Calendar size={26} />
        </div>
        <div className="flex-1">
          <Link to="/open-houses" hash={event.id} className="no-underline">
            <h3 className="font-display mb-2 text-base font-bold leading-snug text-[#111827]">{event.title}</h3>
          </Link>
          <p className="mb-1 flex items-center gap-1 text-sm text-[#6b7280]">
            <Calendar size={14} className="flex-shrink-0" /> {new Date(event.date).toLocaleDateString('nl-NL')}
          </p>
          <p className="flex items-center gap-1 text-sm text-[#6b7280]">
            <MapPin size={14} className="flex-shrink-0" /> {event.isOnline ? 'Online' : event.location || '—'}
          </p>
        </div>
      </div>
    </div>
  )
}