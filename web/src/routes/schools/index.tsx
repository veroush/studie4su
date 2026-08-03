import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { PageTitleSection } from "@/components/schools/page-title-section"
import { SearchBar } from "@/components/schools/search-bar"
import { SchoolFilters } from "@/components/schools/school-filters"
import { SchoolCard } from "@/components/schools/school-card"
import { useChaserRunnerAnimation, useConfusedStickmanAnimation } from "@/hooks/use-state-animation"

export const Route = createFileRoute("/schools/")({ component: SchoolsPage })

interface School {
  id: string
  name: string
  shortName: string | null
  type: string
  location: string | null
  _count: { programs: number }
}

// Ported directly from v1 schools.js (NL only - the language toggle
// exists visually in the navbar but does not actually switch text yet).
const DESCRIPTIONS: Record<string, string> = {
  school_adekus:
    "De enige universiteit van Suriname, met opleidingen in geneeskunde, rechten, technologie en meer.",
  school_natin:
    "Technisch HBO-instituut met sterke focus op ICT, engineering en natuurwetenschappen.",
  school_iol:
    "Lerarenopleidingsinstituut dat toekomstige docenten voorbereidt voor het Surinaamse onderwijs.",
  school_covab:
    "Agrarisch HBO-college voor opleidingen in landbouw, biologie en milieuwetenschappen.",
  school_imeao:
    "MBO-instelling met praktijkgerichte opleidingen in economie, administratie en handel.",
  school_ptc:
    "Polytechnisch college dat studenten opleidt in technische vakken op MBO-niveau.",
  school_igsr:
    "HBO-instituut voor gezondheidszorg met verpleegkunde, paramedische en zorgopleidingen.",
}
const DEFAULT_DESCRIPTION =
  "Een erkende onderwijsinstelling in Suriname met hoogwaardige opleidingen."

function SchoolsPage() {
  const { data: schools, isLoading, isError } = useQuery({
    queryKey: ["schools"],
    queryFn: async (): Promise<School[]> => {
      const res = await fetch("/api/schools")
      if (!res.ok) throw new Error("Failed to fetch schools")
      return res.json()
    },
  })

  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState({ type: "", location: "", level: "" })
  const { chaserSrc, runnerSrc } = useChaserRunnerAnimation(isLoading)

  // Real data has no separate "level" field - v1 read the same `type`
  // field for both the Type and Niveau dropdowns, so we replicate that
  // (options are identical for both, matching v1's actual behavior).
  const typeOptions = useMemo(() => {
    const unique = Array.from(new Set((schools ?? []).map((s) => s.type).filter(Boolean)))
    return unique.sort().map((type) => ({ value: type, label: type }))
  }, [schools])

  const locationOptions = useMemo(() => {
    const unique = Array.from(
      new Set((schools ?? []).map((s) => s.location).filter((loc): loc is string => Boolean(loc))),
    )
    return unique.sort().map((loc) => ({ value: loc, label: loc }))
  }, [schools])

  const filtered = useMemo(() => {
    if (!schools) return []
    const term = search.trim().toLowerCase()
    return schools.filter((school) => {
      if (filters.type && school.type !== filters.type) return false
      if (filters.level && school.type !== filters.level) return false
      if (filters.location && school.location !== filters.location) return false
      if (term && !school.name.toLowerCase().includes(term)) return false
      return true
    })
  }, [schools, search, filters])

  const stickmanSrc = useConfusedStickmanAnimation(isError || (!isLoading && filtered.length === 0))

  return (
    <div>
      <Navbar />

      <div className="bg-gradient-to-br from-[#f9fafb] to-[#f0fdf4]/50 min-h-screen">
        <main className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <PageTitleSection
            title="Alle Scholen"
            description="Ontdek en vergelijk scholen in Suriname"
          />

          <SearchBar value={search} onChange={setSearch} />

          <SchoolFilters
            value={filters}
            onChange={setFilters}
            typeOptions={typeOptions}
            locationOptions={locationOptions}
            levelOptions={typeOptions}
          />

          {!isLoading && !isError && (
            <p className="text-sm text-[#6b7280] mb-6 animate-[fadeIn_0.3s_ease]">
              <strong className="text-[#16a34a]">{filtered.length}</strong>{" "}
              school{filtered.length === 1 ? "" : "en"} gevonden
            </p>
          )}

          {isLoading && (
            <div className="text-center py-16 text-[#6b7280]">
              <div className="relative w-full max-w-[380px] h-40 mx-auto mb-4">
                <img src={chaserSrc} alt="" className="absolute bottom-[18px] left-[30px] w-[92px] h-[92px] object-contain" />
                <img src={runnerSrc} alt="" className="absolute bottom-[18px] left-[170px] w-[92px] h-[92px] object-contain" />
              </div>
              <p className="text-[0.95rem]">Scholen laden...</p>
            </div>
          )}

          {isError && (
            <div className="text-center py-16 text-[#6b7280]">
              <img src={stickmanSrc} alt="" className="w-[100px] h-auto mx-auto mb-4" />
              <h3 className="font-display text-lg text-[#111827] mb-1">Kon scholen niet laden</h3>
              <p className="text-sm">Controleer of je server actief is.</p>
            </div>
          )}

          {!isLoading && !isError && filtered.length === 0 && (
            <div className="text-center py-16 text-[#6b7280]">
              <img src={stickmanSrc} alt="" className="w-[100px] h-auto mx-auto mb-4" />
              <p className="text-[0.95rem]">Geen scholen gevonden met deze filters</p>
            </div>
          )}

          {!isLoading && !isError && filtered.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
              {filtered.map((school) => (
                <SchoolCard
                  key={school.id}
                  variant="grid"
                  school={{
                    id: school.id,
                    name: school.name,
                    shortName: school.shortName,
                    type: school.type,
                    location: school.location,
                    programCount: school._count.programs,
                  }}
                  description={DESCRIPTIONS[school.id] ?? DEFAULT_DESCRIPTION}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      <Footer />

      </div>
  )
}
