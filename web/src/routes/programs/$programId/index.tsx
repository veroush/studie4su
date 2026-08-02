import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { LoadingState } from '@/components/common/loading-state'
import { EmptyState } from '@/components/common/empty-state'
import { Toast } from '@/components/common/toast'
import { ProgramHero } from '@/components/programs/program-hero'
import { DetailCard } from '@/components/programs/detail-card'

export const Route = createFileRoute('/programs/$programId/')({ component: ProgramDetail })

const MAX_SLOTS = 3
const STORAGE_KEY = 'program_compare'

interface ProgramApi {
  id: string
  name: string
  description: string | null
  cluster: string
  duration: string | null
  levelRequired: string | null
  tuitionCost: string | null
  careers: string | null
  school: { id: string; name: string; shortName: string | null; location: string | null } | null
}

interface FavoritesIds {
  schools: string[]
  programs: string[]
  openhouses: string[]
}

function readStoredIds(): string[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

function ProgramDetail() {
  const { programId } = Route.useParams()
  const navigate = useNavigate()
  const [isComparing, setIsComparing] = useState(false)

  useEffect(() => {
    setIsComparing(readStoredIds().includes(programId))
  }, [programId])

  const { data: program, isLoading, isError } = useQuery({
    queryKey: ['program', programId],
    queryFn: async (): Promise<ProgramApi> => {
      const res = await fetch(`/api/programs/${programId}`)
      if (!res.ok) throw new Error('Failed to fetch program')
      return res.json()
    },
  })

  const { data: favIds } = useQuery({
    queryKey: ['favorites', 'me'],
    queryFn: async (): Promise<FavoritesIds | null> => {
      const res = await fetch('/api/favorites/me')
      if (!res.ok) return null
      return res.json()
    },
  })

  const [favOverride, setFavOverride] = useState<boolean | null>(null)
  const isFavorited = favOverride ?? (favIds?.programs.includes(programId) ?? false)

  const [toast, setToast] = useState<{ message: string; visible: boolean; linkTo?: string }>({
    message: '',
    visible: false,
  })

  function handleFavoriteToggle(favorited: boolean) {
    setFavOverride(favorited)
    setToast({
      message: favorited ? 'Toegevoegd aan favorieten' : 'Verwijderd uit favorieten',
      visible: true,
      linkTo: favorited ? '/favorites' : undefined,
    })
  }

  function handleToggleCompare() {
    const stored = readStoredIds()

    if (isComparing) {
      const next = stored.filter((id) => id !== programId)
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      setIsComparing(false)
      return
    }

    if (stored.length < MAX_SLOTS) {
      const next = [...stored, programId]
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      setIsComparing(true)
      navigate({ to: '/program-compare', search: { ids: next.join(',') } })
      return
    }

    // Already at 3 slots — hand off to the replace flow on the compare page
    // itself, same as ReplaceBanner expects (?ids=..existing..,newId&replace=newId).
    navigate({
      to: '/program-compare',
      search: { ids: [...stored, programId].join(','), replace: programId },
    })
  }

  return (
    <div>
      <Navbar />

      {isLoading && <LoadingState message="Opleiding laden..." />}
      {isError && <EmptyState title="Kon opleiding niet laden" description="Probeer het later opnieuw." />}

      {program && (
        <main className="bg-white min-h-screen">
          <ProgramHero
            program={{
              id: program.id,
              name: program.name,
              cluster: program.cluster,
              duration: program.duration,
              levelRequired: program.levelRequired,
              tuitionCost: program.tuitionCost,
            }}
            school={{
              id: program.school?.id ?? '',
              name: program.school?.name ?? program.school?.shortName ?? '—',
            }}
            isFavorited={isFavorited}
            onFavoriteToggle={handleFavoriteToggle}
            isComparing={isComparing}
            onToggleCompare={handleToggleCompare}
          />

          <section className="max-w-[1000px] mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            {program.description && (
              <DetailCard variant="description" title="Over deze opleiding" content={program.description} />
            )}
            {program.levelRequired && (
              <DetailCard variant="requirements" title="Toelatingseisen" content={program.levelRequired} />
            )}
            {program.careers && (
              <DetailCard
                variant="careers"
                title="Carrièremogelijkheden"
                items={program.careers.split(',').map((c) => c.trim()).filter(Boolean)}
              />
            )}
            {program.duration && (
              <DetailCard variant="schedule" title="Duur" content={program.duration} />
            )}
            {program.tuitionCost && (
              <DetailCard variant="tuition" title="Collegegeld" content={program.tuitionCost} />
            )}
            {program.school && (
              <DetailCard
                variant="school"
                title="School"
                school={{
                  id: program.school.id,
                  name: program.school.name,
                  location: program.school.location,
                }}
              />
            )}
          </section>
        </main>
      )}

      <Footer />

      <Toast
        message={toast.message}
        visible={toast.visible}
        onDismiss={() => setToast((t) => ({ ...t, visible: false }))}
        variant="favorite"
        durationMs={3500}
        linkTo={toast.linkTo}
      />
    </div>
  )
}