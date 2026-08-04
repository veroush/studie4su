import { AlertTriangle } from 'lucide-react'

interface ReplaceBannerProps {
  onCancel: () => void
}

export function ReplaceBanner({ onCancel }: ReplaceBannerProps) {
  return (
    <div className="flex items-start gap-3 bg-gradient-to-r from-[#92400e] to-[#b45309] rounded-2xl p-5 mb-6 shadow-lg">
      <AlertTriangle size={20} className="text-[#fef3c7] shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <strong className="block text-white font-semibold text-sm mb-0.5">Vergelijking vol</strong>
        <p className="text-white/85 text-sm">
          Je kan maximaal 3 opleidingen vergelijken. Klik <em className="text-[#fef3c7] font-semibold not-italic">✕</em> naast een opleiding hieronder om deze te vervangen.
        </p>
      </div>
      <button
        type="button"
        onClick={onCancel}
        className="shrink-0 text-sm text-white/75 hover:text-white border border-white/30 hover:bg-white/10 rounded-lg px-3 py-1.5 transition-colors"
      >
        Annuleren
      </button>
    </div>
  )
}