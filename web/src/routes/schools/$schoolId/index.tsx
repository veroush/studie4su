import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useRef, useState } from "react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { SchoolHero } from "@/components/schools/school-hero"
import { ProgramsSlider } from "@/components/schools/programs-slider"
import { OpenHousesMiniCard } from "@/components/schools/open-houses-mini-card"
import { ContactSidebar } from "@/components/schools/contact-sidebar"
import { useChaserRunnerAnimation, useConfusedStickmanAnimation } from "@/hooks/use-state-animation"
import { useProgramCompare } from "@/hooks/use-program-compare"

export const Route = createFileRoute("/schools/$schoolId/")({
  component: SchoolDetailPage,
  validateSearch: (search: Record<string, unknown>): { compare?: string } => ({
    compare: typeof search.compare === "string" ? search.compare : undefined,
  }),
})

interface Program {
  id: string
  name: string
  description: string | null
  cluster: string
  duration: string | null
  levelRequired: string | null
  tuitionCost: string | null
  careers: string | null
}

interface SchoolDetail {
  id: string
  name: string
  shortName: string | null
  type: string
  website: string | null
  location: string | null
  programs: Program[]
}

interface OpenHouseItem {
  id: string
  title: string
  date: string
  location: string | null
  isOnline: boolean
}

function SchoolDetailPage() {
  const { schoolId } = Route.useParams()
  const { compare } = Route.useSearch()
  const { addProgram } = useProgramCompare()
  const [compareSelectMode, setCompareSelectMode] = useState(false)
  const compareTriggeredRef = useRef(false)

  const {
    data: school,
    isLoading: schoolLoading,
    isError: schoolError,
  } = useQuery({
    queryKey: ["school", schoolId],
    queryFn: async (): Promise<SchoolDetail> => {
      const res = await fetch(`/api/schools/${schoolId}`)
      if (!res.ok) throw new Error("Failed to fetch school")
      return res.json()
    },
  })

  // Deliberately a separate query from `school` above - matches v1's
  // school-detail.js, which fetches open houses independently and does
  // NOT block rendering the school if this call fails.
  const { data: openHouses } = useQuery({
    queryKey: ["openHouses", schoolId],
    queryFn: async (): Promise<OpenHouseItem[]> => {
      const res = await fetch(`/api/openhouses?schoolId=${schoolId}`)
      if (!res.ok) throw new Error("Failed to fetch open houses")
      return res.json()
    },
  })

  const { chaserSrc, runnerSrc } = useChaserRunnerAnimation(schoolLoading)
  const stickmanSrc = useConfusedStickmanAnimation(schoolError)

  function handleCompareClick() {
    if (!school || school.programs.length === 0) {
      alert("Deze school heeft nog geen opleidingen om te vergelijken.")
      return
    }
    document.getElementById("programs-section")?.scrollIntoView({ behavior: "smooth", block: "start" })
    setTimeout(() => setCompareSelectMode(true), 400)
  }

  useEffect(() => {
    if (compare !== "1" || compareTriggeredRef.current || !school) return
    compareTriggeredRef.current = true
    const t = setTimeout(handleCompareClick, 600)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compare, school])

  return (
    <div>
      <Navbar />

      {schoolLoading && (
        <div className="text-center py-16 text-[#6b7280]">
          <div className="relative w-full max-w-[380px] h-40 mx-auto mb-4">
            <img src={chaserSrc} alt="" className="absolute bottom-[18px] left-[30px] w-[92px] h-[92px] object-contain" />
            <img src={runnerSrc} alt="" className="absolute bottom-[18px] left-[170px] w-[92px] h-[92px] object-contain" />
          </div>
          <p className="text-[0.95rem]">Schoolgegevens laden...</p>
        </div>
      )}

      {schoolError && (
        <div className="text-center py-16 text-[#6b7280]">
          <img src={stickmanSrc} alt="" className="w-[100px] h-auto mx-auto mb-4" />
          <h3 className="font-display text-lg text-[#111827] mb-1">Kon school niet laden</h3>
          <p className="text-sm">Controleer of je server actief is.</p>
        </div>
      )}

      {!schoolLoading && !schoolError && school && (
        <>
          <SchoolHero
            school={{
              id: school.id,
              name: school.name,
              type: school.type,
              location: school.location,
              programCount: school.programs.length,
            }}
            onCompareClick={handleCompareClick}
          />

          <div className="bg-gradient-to-br from-[#f9fafb] to-[#f0fdf4]/50">
            <main className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
                <div className="flex flex-col gap-8">
                  <OpenHousesMiniCard openHouses={openHouses ?? []} />
                </div>
                <div className="flex flex-col gap-6">
                  <ContactSidebar website={school.website} />
                </div>
              </div>
            </main>
          </div>

          <ProgramsSlider
            programs={school.programs}
            selectMode={compareSelectMode}
            onSelectProgram={addProgram}
            onCancelSelect={() => setCompareSelectMode(false)}
          />
        </>
      )}

      <Footer />
    </div>
  )
}
