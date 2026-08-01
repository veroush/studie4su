import { createFileRoute, useNavigate, useBlocker } from '@tanstack/react-router'
import { useQueries } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
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
  const loggedSetRef = useRef<string | null>(null)

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

  useEffect(() => {
    if (comparePrograms.length < 2) return
    const ids = comparePrograms.map((p) => p.id).sort()
    const key = ids.join(',')
    if (loggedSetRef.current === key) return
    loggedSetRef.current = key
    fetch('/api/track/comparison', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ programIds: ids }),
    }).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comparePrograms])

  function updateIds(nextIds: string[]) {
    navigate({ search: nextIds.length > 0 ? { ids: nextIds.join(',') } : {} })
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

      <section className="py-16 bg-gradient-to-br from-green-50 via-white to-green-50/40">
        <div className="max-w-[1100px] mx-auto px-6">
            <ComparisonPageHeader />

          {urlIds.length === 0 && <NoProgramsEmptyState />}

          {urlIds.length > 0 && isLoading && <LoadingState message="Opleidingen laden..." />}

          {isReplacing && pendingProgram && (
            <ReplaceBanner onCancel={handleCancelReplace} />
          )}

          {!isLoading && comparePrograms.length === 1 && (
            <OneProgramPrompt program={{ name: comparePrograms[0].name, school: comparePrograms[0].school }} />
          )}

          {!isLoading && comparePrograms.length >= 2 && (
            <>
              <div className="hidden md:block overflow-x-auto bg-white rounded-2xl shadow-lg">
                <ComparisonTable
                  programs={comparePrograms}
                  onRemove={handleRemoveOrSwap}
                />
              </div>

              <div className="md:hidden">
                <MobileComparisonCards programs={comparePrograms} onRemove={handleRemoveOrSwap} />
              </div>

              <div className="text-center mt-8">
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-lg border-2 border-gray-200 bg-white px-6 py-2.5 text-sm font-medium text-gray-500 hover:border-[#15803d]/40 hover:text-[#15803d] transition-colors"
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