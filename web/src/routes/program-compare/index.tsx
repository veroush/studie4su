import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQueries } from '@tanstack/react-query'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { LoadingState } from '@/components/common/loading-state'
import { EmptyState } from '@/components/common/empty-state'
import { ComparisonPageHeader } from '@/components/program-compare/comparison-page-header'
import { ComparisonTable } from '@/components/program-compare/comparison-table'

export const Route = createFileRoute('/program-compare/')({
  component: ProgramComparePage,
  validateSearch: (search: Record<string, unknown>): { ids?: string } => ({
    ids: typeof search.ids === 'string' ? search.ids : undefined,
  }),
})

interface ProgramApi {
  id: string
  name: string
  description: string | null
  cluster: string
  duration: string | null
  levelRequired: string | null
  tuitionCost: string | null
  careers: string | null
  school: { id: string; name: string; shortName: string | null } | null
}

interface CompareProgram {
  id: string
  name: string
  school: string
  duration?: string | null
  levelRequired?: string | null
  tuitionCost?: string | null
  careers?: string | null
}

const MAX_SLOTS = 3

function ProgramComparePage() {
  const { ids: idsParam } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })

  const ids = (idsParam ?? '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, MAX_SLOTS)

  const results = useQueries({
    queries: ids.map((id) => ({
      queryKey: ['program', id],
      queryFn: async (): Promise<ProgramApi> => {
        const res = await fetch(`/api/programs/${id}`)
        if (!res.ok) throw new Error(`Failed to fetch program ${id}`)
        return res.json()
      },
    })),
  })

  const isLoading = ids.length > 0 && results.some((r) => r.isLoading)
  const loadedPrograms = results.map((r) => r.data).filter((p): p is ProgramApi => Boolean(p))

  function updateIds(nextIds: string[]) {
    navigate({ search: { ids: nextIds.length > 0 ? nextIds.join(',') : undefined } })
  }

  function handleRemove(id: string) {
    updateIds(ids.filter((existingId) => existingId !== id))
  }

  function handleAddSlot() {
    // No program picker/search exists yet — send them to browse schools
    // as the closest existing entry point into program pages.
    navigate({ to: '/schools' })
  }

  function handleReset() {
    updateIds([])
  }

  const comparePrograms: CompareProgram[] = loadedPrograms.map((p) => ({
    id: p.id,
    name: p.name,
    school: p.school?.shortName ?? p.school?.name ?? '—',
    duration: p.duration,
    levelRequired: p.levelRequired,
    tuitionCost: p.tuitionCost,
    careers: p.careers,
  }))

  // Always leave one open slot (up to the 3-program cap) so the table's
  // built-in EmptySlotCard invites adding the next program.
  const slotCount =
    comparePrograms.length === 0 ? 0 : Math.min(MAX_SLOTS, Math.max(2, comparePrograms.length + 1))
  const slots: (CompareProgram | null)[] = Array.from(
    { length: slotCount },
    (_, i) => comparePrograms[i] ?? null,
  )

  return (
    <div>
      <Navbar />

      <section className="py-16">
        <div className="max-w-[1100px] mx-auto px-6">
          <div
            className="text-center mb-10
              [&_a:first-child]:inline-flex [&_a:first-child]:items-center [&_a:first-child]:gap-1.5
              [&_a:first-child]:text-sm [&_a:first-child]:text-[#8aab96] [&_a:first-child]:hover:text-[#e8b84b]
              [&_a:first-child]:mb-4 [&_a:first-child]:transition-colors
              [&_h1]:font-display [&_h1]:text-4xl [&_h1]:md:text-5xl [&_h1]:font-bold [&_h1]:text-[#faf6ee] [&_h1]:mt-2
              [&_[aria-hidden]]:hidden"
          >
            <ComparisonPageHeader />
          </div>

          {ids.length === 0 && (
            <EmptyState
              title="Voeg een opleiding toe"
              description='Ga naar een opleiding en klik "Vergelijk opleiding" om te beginnen.'
            />
          )}

          {ids.length > 0 && isLoading && <LoadingState message="Opleidingen laden..." />}

          {ids.length > 0 && !isLoading && loadedPrograms.length === 0 && (
            <EmptyState
              title="Kon opleidingen niet laden"
              description="Controleer of je server actief is."
            />
          )}

          {!isLoading && loadedPrograms.length > 0 && (
            <>
              <div
                className="overflow-x-auto bg-[#122b1e] border border-white/[0.07] rounded-2xl p-2
                  [&_table]:w-full [&_table]:border-collapse
                  [&_th]:p-4 [&_th]:text-left [&_th]:align-top [&_th]:text-[#8aab96] [&_th]:text-sm [&_th]:font-medium
                  [&_td]:p-4 [&_td]:align-top [&_td]:text-sm [&_td]:text-[#faf6ee] [&_td]:border-t [&_td]:border-white/[0.06]
                  [&_tbody_tr:first-child_td]:border-t-0
                  [&_button]:inline-flex [&_button]:items-center [&_button]:gap-1 [&_button]:text-xs
                  [&_button]:text-[#e8b84b] [&_button]:mt-1.5 [&_button]:hover:text-white [&_button]:transition-colors"
              >
                <ComparisonTable programs={slots} onRemove={handleRemove} onAddSlot={handleAddSlot} />
              </div>

              <div className="text-center mt-8">
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-lg border-2 border-white/10 bg-transparent px-6 py-2.5 text-sm font-medium text-[#8aab96] hover:border-[#e8b84b]/40 hover:text-[#e8b84b] transition-colors"
                >
                  Vergelijking wissen
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}