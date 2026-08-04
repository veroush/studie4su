import { Calendar, Clock } from "lucide-react"

interface OpenHouseItem {
  id: string
  title: string
  date: string
  location: string | null
  isOnline: boolean
}

interface OpenHousesMiniCardProps {
  openHouses: OpenHouseItem[]
}

// Single fallback image for all cards — v1 keyed images to hardcoded school
// IDs that no longer exist under the cuid scheme. Real per-school images
// need an imageUrl column or a manual mapping (flagged, not resolved here).
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&h=400&fit=crop"

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("nl-NL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  } catch {
    return dateStr
  }
}

export function OpenHousesMiniCard({ openHouses }: OpenHousesMiniCardProps) {
  return (
    <div className="bg-gradient-to-br from-[#16a34a] to-[#15803d] text-white rounded-2xl shadow-lg p-6">
      <h3 className="font-display text-[1.15rem] font-semibold mb-4 flex items-center gap-2">
        <Calendar size={20} />
        Open Dagen
      </h3>

      {openHouses.length === 0 ? (
        <p className="text-sm text-white/75">Geen open dagen gepland.</p>
      ) : (
        <div
          className={`grid gap-3 ${
            openHouses.length > 1 ? "grid-cols-1 min-[481px]:grid-cols-2" : "grid-cols-1"
          }`}
        >
          {openHouses.map((oh) => (
            <div
              key={oh.id}
              className="bg-white/10 backdrop-blur rounded-[10px] overflow-hidden flex flex-col group"
            >
              <div className="relative h-[72px] overflow-hidden flex-shrink-0">
                <img
                  src={FALLBACK_IMAGE}
                  alt={oh.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-[400ms] group-hover:scale-[1.08]"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-black/10 to-[#0d2b1f]/50 group-hover:from-black/35 group-hover:to-[#0d2b1f]/[.78] transition-colors duration-300">
                  {/* Visual parity only — not wired to a real registration flow yet */}
                  <button className="px-3.5 py-[7px] rounded-[7px] bg-white text-[#15803d] text-xs font-bold whitespace-nowrap opacity-0 translate-y-1.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 hover:bg-[#f3f4f6]">
                    Aanmelden voor open dag
                  </button>
                </div>
              </div>
              <div className="px-3 py-2.5">
                <div className="font-display text-sm font-semibold mb-1">
                  {formatDate(oh.date)}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-white/80">
                  <Clock size={12} />
                  {oh.isOnline ? "Online" : oh.location || "Suriname"}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
