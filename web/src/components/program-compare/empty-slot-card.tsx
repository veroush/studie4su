import { GraduationCap, Search } from 'lucide-react'

interface EmptySlotCardProps {
  onClick: () => void
}

export function EmptySlotCard({ onClick }: EmptySlotCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex min-h-[260px] w-full items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 transition-colors hover:border-[#15803d]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803d]/50"
    >
      <div className="flex flex-col items-center gap-2.5 px-6 py-8 text-center">
        <div className="mb-1.5 flex h-[68px] w-[68px] items-center justify-center rounded-[14px] bg-gradient-to-br from-[#16a34a] to-[#15803d] shadow-lg">
          <GraduationCap size={36} strokeWidth={1.5} className="text-white" />
        </div>
        <h3 className="font-display text-lg font-bold text-gray-800">
          Voeg nog een opleiding toe
        </h3>
        <p className="max-w-[220px] text-sm leading-relaxed text-gray-500">
          Bezoek een opleiding en klik &quot;Vergelijk opleiding&quot; om toe te voegen.
        </p>
        <span className="mt-2 inline-flex items-center gap-2 rounded-[10px] bg-gradient-to-r from-[#16a34a] to-[#15803d] px-[22px] py-[11px] text-sm font-semibold text-white shadow-md transition-opacity group-hover:opacity-90">
          <Search size={16} />
          Bekijk opleidingen
        </span>
      </div>
    </button>
  )
}