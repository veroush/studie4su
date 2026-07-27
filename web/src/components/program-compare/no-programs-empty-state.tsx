import { Link } from '@tanstack/react-router'
import { Search } from 'lucide-react'

export function NoProgramsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center text-center min-h-[50vh] gap-3 py-10">
      <img src="/img/stickman-confused1.svg" alt="" aria-hidden="true" className="w-24 h-24 object-contain mb-2 opacity-90" />
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