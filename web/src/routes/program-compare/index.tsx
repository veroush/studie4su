import { createFileRoute, useNavigate, useBlocker } from '@tanstack/react-router'
import { useQueries } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { LoadingState } from '@/components/common/loading-state'
import { ComparisonPageHeader } from '@/components/program-compare/comparison-page-header'
import { ComparisonTable } from '@/components/program-compare/comparison-table'
import { MobileComparisonCards } from '@/components/program-compare/mobile-comparison-cards'
import { NoProgramsEmptyState } from '@/components/program-compare/no-programs-empty-state'
import { OneProgramPrompt } from '@/components/program-compare/one-program-prompt'
import { ReplaceBanner } from '@/components/program-compare/replace-banner'
import { LeaveConfirmModal } from '@/components/program-compare/leave-confirm-modal'

export const Route = createFileRoute('/program-compare/')({
  component: ProgramComparePage,
  validateSearch: (search: Record<string, unknown>): { ids?: string; replace?: string } => ({
    ids: typeof search.ids === 'string' ? search.ids : undefined,
    replace: typeof search.replace === 'string' ? search.replace : undefined,
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
const STORAGE_KEY = 'program_compare'

function toCompareProgram(p: ProgramApi): CompareProgram {
  return {
    id: p.id,
    name: p.name,
    school: p.school?.shortName ?? p.school?.name ?? '—',
    duration: p.duration,
    levelRequired: p.levelRequired,
    tuitionCost: p.tuitionCost,
    careers: p.careers,
  }
}

function readStoredIds(): string[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

function writeStoredIds(ids: string[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
}

function ProgramComparePage() {
  const { ids: idsParam, replace: replaceParam } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const [leaveTarget, setLeaveTarget] = useState<string | null>(null)

  const urlIds = (idsParam ?? '').split(',').map((id) => id.trim()).filter(Boolean)
  const replaceId = replaceParam ?? null
  const isReplacing = Boolean(replaceId && urlIds.includes(replaceId))

  // Fall back to localStorage on direct page load with no ?ids= at all,
  // matching v1's "URL wins, falls back to LS" behavior.
  useEffect(() => {
    if (idsParam !== undefined) return
    const stored = readStoredIds()
    if (stored.length > 0) {
      navigate({ search: { ids: stored.slice(0, MAX_SLOTS).join(',') }, replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Keep localStorage in sync with whatever's actually shown (only when
  // not mid-replace, since the pending id shouldn't be "confirmed" yet).
  useEffect(() => {
    if (isReplacing) return
    writeStoredIds(urlIds.slice(0, MAX_SLOTS))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsParam])

  // Block in-app navigation while 2+ programs are selected, offering the
  // shared LeaveConfirmModal instead of navigating immediately.
  const displayCount = isReplacing ? urlIds.length - 1 : urlIds.length
  useBlocker({
    shouldBlockFn: ({ next }) => {
      if (displayCount < 2) return false
      setLeaveTarget(next.fullPath)
      return true
    },
    enableBeforeUnload: false,
  })

  const fetchIds = isReplacing ? urlIds : urlIds.slice(0, MAX_SLOTS)

  const results = useQueries({
    queries: fetchIds.map((id) => ({
      queryKey: ['program', id],
      queryFn: async (): Promise<ProgramApi> => {
        const res = await fetch(`/api/programs/${id}`)
        if (!res.ok) throw new Error(`Failed to fetch program ${id}`)
        return res.json()
      },
    })),
  })

  const isLoading = fetchIds.length > 0 && results.some((r) => r.isLoading)
  const loadedById = new Map<string, ProgramApi>()
  results.forEach((r) => {
    if (r.data) loadedById.set(r.data.id, r.data)
  })

  const existingIds = isReplacing ? urlIds.filter((id) => id !== replaceId) : urlIds.slice(0, MAX_SLOTS)
  const existingPrograms = existingIds.map((id) => loadedById.get(id)).filter((p): p is ProgramApi => Boolean(p))
  const pendingProgram = isReplacing && replaceId ? loadedById.get(replaceId) ?? null : null

  const comparePrograms: CompareProgram[] = existingPrograms.map(toCompareProgram)

  function updateIds(nextIds: string[]) {
    navigate({ search: nextIds.length > 0 ? { ids: nextIds.join(',') } : {} })
  }

  function handleAddSlot() {
    // No in-app program picker exists yet — send to browse, same as v1.
    navigate({ to: '/schools' })
  }

  function handleReset() {
    writeStoredIds([])
    updateIds([])
  }

  function handleCancelReplace() {
    updateIds(existingIds)
  }

  // While a replace is pending, "remove" on an existing program means
  // "swap this one for the pending program" — ReplaceBanner itself has
  // no per-program choice control, so this reuses the table's own
  // remove affordance for that purpose instead.
  function handleRemoveOrSwap(id: string) {
    if (isReplacing && replaceId) {
      const next = existingIds.filter((existingId) => existingId !== id).concat(replaceId)
      updateIds(next)
      return
    }
    updateIds(existingIds.filter((existingId) => existingId !== id))
  }

  function handleLeaveConfirm() {
    writeStoredIds([])
    if (leaveTarget) window.location.href = leaveTarget
  }

  function handleLeaveCancel() {
    setLeaveTarget(null)
  }

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

          {urlIds.length === 0 && <NoProgramsEmptyState />}

          {urlIds.length > 0 && isLoading && <LoadingState message="Opleidingen laden..." />}

          {isReplacing && pendingProgram && (
            <ReplaceBanner onCancel={handleCancelReplace} />
          )}

          {!isLoading && comparePrograms.length === 1 && <OneProgramPrompt />}

          {!isLoading && comparePrograms.length >= 2 && (
            <>
              <div
                className="hidden md:block overflow-x-auto bg-[#122b1e] border border-white/[0.07] rounded-2xl p-2
                  [&_table]:w-full [&_table]:border-collapse
                  [&_th]:p-4 [&_th]:text-left [&_th]:align-top [&_th]:text-[#8aab96] [&_th]:text-sm [&_th]:font-medium
                  [&_td]:p-4 [&_td]:align-top [&_td]:text-sm [&_td]:text-[#faf6ee] [&_td]:border-t [&_td]:border-white/[0.06]
                  [&_tbody_tr:first-child_td]:border-t-0
                  [&_button]:inline-flex [&_button]:items-center [&_button]:gap-1 [&_button]:text-xs
                  [&_button]:text-[#e8b84b] [&_button]:mt-1.5 [&_button]:hover:text-white [&_button]:transition-colors"
              >
                <ComparisonTable
                  programs={comparePrograms.length < MAX_SLOTS ? [...comparePrograms, null] : comparePrograms}
                  onRemove={handleRemoveOrSwap}
                  onAddSlot={handleAddSlot}
                />
              </div>

              <div className="md:hidden">
                <MobileComparisonCards programs={comparePrograms} onRemove={handleRemoveOrSwap} />
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

      <LeaveConfirmModal
        open={leaveTarget !== null}
        onConfirm={handleLeaveConfirm}
        onCancel={handleLeaveCancel}
      />
    </div>
  )
}