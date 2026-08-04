import { Link } from '@tanstack/react-router'
import { Building2, Search } from 'lucide-react'

interface OneProgramPromptProps {
  program: { name: string; school: string }
}

export function OneProgramPrompt({ program }: OneProgramPromptProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 bg-white rounded-2xl shadow-lg p-6 mb-8">
      <div className="flex-1 min-w-[160px]">
        <div className="font-display text-lg font-bold text-gray-900 mb-1">{program.name}</div>
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <Building2 size={14} />
          {program.school}
        </div>
      </div>

      <div className="w-10 h-10 shrink-0 rounded-full bg-[#0d2b1f] border border-[#e8b84b]/30 text-[#e8b84b] font-display text-sm font-bold flex items-center justify-center">
        VS
      </div>

      <div className="flex-1 min-w-[220px] flex items-center gap-3 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-4 py-3">
        <div className="flex flex-col gap-0.5 min-w-0">
          <strong className="text-sm text-gray-800 font-semibold">Voeg een tweede opleiding toe</strong>
          <span className="text-xs text-gray-500">Bezoek een opleiding en klik "Vergelijk opleiding".</span>
        </div>
        <Link
          to="/schools"
          className="ml-auto shrink-0 inline-flex items-center gap-1.5 bg-gradient-to-r from-[#2d7a4f] to-[#1e5c3a] text-white text-xs font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          <Search size={13} />
          Bekijk
        </Link>
      </div>
    </div>
  )
}