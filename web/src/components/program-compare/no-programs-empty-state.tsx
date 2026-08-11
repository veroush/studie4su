import { Link } from '@tanstack/react-router'
import { Search } from 'lucide-react'

export function NoProgramsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center text-center min-h-[50vh] gap-3 py-10">
      <div className="relative w-full max-w-[380px] h-[160px] max-[480px]:h-[140px] mx-auto mb-2 overflow-hidden">
        <div className="absolute left-0 right-0 bottom-3 h-2 rounded-full bg-gradient-to-r from-[#16a34a]/[.08] via-[#16a34a]/[.22] to-[#16a34a]/[.08]" />
        <img
          src="/img/chasing-1.svg"
          alt=""
          aria-hidden="true"
          className="absolute bottom-[18px] left-[30px] w-[92px] h-[92px] max-[480px]:w-[76px] max-[480px]:h-[76px] max-[480px]:left-[24px] object-contain pointer-events-none"
        />
        <img
          src="/img/running-1.svg"
          alt=""
          aria-hidden="true"
          className="absolute bottom-[18px] left-[170px] w-[92px] h-[92px] max-[480px]:w-[76px] max-[480px]:h-[76px] max-[480px]:left-[140px] object-contain pointer-events-none"
        />
      </div>
      <h3 className="font-display text-2xl font-bold text-gray-900">Voeg een opleiding toe</h3>
      <p className="text-gray-600 max-w-sm">Ga naar een opleiding en klik "Vergelijk opleiding"</p>
      <Link
        to="/schools"
        className="inline-flex items-center gap-2 bg-gradient-to-r from-[#16a34a] to-[#15803d] text-white text-sm font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity shadow-lg"
      >
        <Search size={16} />
        Bekijk opleidingen
      </Link>
    </div>
  )
}