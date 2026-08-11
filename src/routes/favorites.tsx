import { useState } from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { useQuery, useQueries } from '@tanstack/react-query'
import { getSession } from '@/lib/get-session'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { TabNav } from '@/components/favorites/tab-nav'
import { FavCard } from '@/components/favorites/fav-card'
import { FavCardEvent } from '@/components/favorites/fav-card-event'
import { EmptyTabState } from '@/components/favorites/empty-tab-state'
import { SavedBadge } from '@/components/favorites/saved-badge'
import { PainterScene } from '@/components/favorites/painter-scene'
import { LoadingState } from '@/components/common/loading-state'
import { useLanguage } from '@/lib/i18n/language-context'

export const Route = createFileRoute('/favorites')({
  beforeLoad: async () => {
    const session = await getSession()
    if (!session?.user) {
      throw redirect({ to: '/login', search: { redirect: '/favorites' } })
    }
  },
  component: Favorites,
})

type Tab = 'schools' | 'programs' | 'openhouses'

interface FavoritesIds {
  schools: string[]
  programs: string[]
  openhouses: string[]
}

interface SchoolItem {
  id: string
  name: string
  location?: string | null
  type?: string | null
}

interface ProgramItem {
  id: string
  name: string
  cluster?: string | null
  school?: { name: string } | null
}

interface OpenHouseItem {
  id: string
  title: string
  date: string
  isOnline: boolean
  location?: string | null
}

async function fetchJson<T>(url: string): Promise<T | null> {
  const res = await fetch(url)
  if (!res.ok) return null
  return res.json()
}

function Favorites() {
  const { t } = useLanguage()
  const [tab, setTab] = useState<Tab>('schools')

  const { data: ids, isLoading: idsLoading } = useQuery({
    queryKey: ['favorites', 'me'],
    queryFn: () => fetchJson<FavoritesIds>('/api/favorites/me'),
  })

  const [removed, setRemoved] = useState<Set<string>>(new Set())
  const markRemoved = (id: string) => setRemoved((prev) => new Set(prev).add(id))

  const schoolIds = (ids?.schools ?? []).filter((id) => !removed.has(id))
  const programIds = (ids?.programs ?? []).filter((id) => !removed.has(id))
  const openhouseIds = (ids?.openhouses ?? []).filter((id) => !removed.has(id))

  const schoolQueries = useQueries({
    queries: schoolIds.map((id) => ({
      queryKey: ['school', id],
      queryFn: () => fetchJson<SchoolItem>(`/api/schools/${id}`),
      enabled: Boolean(ids),
    })),
  })
  const programQueries = useQueries({
    queries: programIds.map((id) => ({
      queryKey: ['program', id],
      queryFn: () => fetchJson<ProgramItem>(`/api/programs/${id}`),
      enabled: Boolean(ids),
    })),
  })
  const openhouseQueries = useQueries({
    queries: openhouseIds.map((id) => ({
      queryKey: ['openhouse', id],
      queryFn: () => fetchJson<OpenHouseItem>(`/api/openhouses/${id}`),
      enabled: Boolean(ids),
    })),
  })

  const schools = schoolQueries.map((q) => q.data).filter((s): s is SchoolItem => Boolean(s))
  const programs = programQueries.map((q) => q.data).filter((p): p is ProgramItem => Boolean(p))
  const openhouses = openhouseQueries
    .map((q) => q.data)
    .filter((o): o is OpenHouseItem => Boolean(o))

  const counts = {
    schools: schoolIds.length,
    programs: programIds.length,
    openhouses: openhouseIds.length,
  }
  const total = counts.schools + counts.programs + counts.openhouses

  const detailsLoading =
    (tab === 'schools' && schoolQueries.some((q) => q.isLoading)) ||
    (tab === 'programs' && programQueries.some((q) => q.isLoading)) ||
    (tab === 'openhouses' && openhouseQueries.some((q) => q.isLoading))

  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-128px)] bg-gradient-to-br from-[#f9fafb] to-[rgba(240,253,244,0.5)] px-6 py-12">
        <div className="mx-auto max-w-[1200px]">
          <div className="mb-2 flex items-center gap-1.5 text-xs text-[#6b7280]">
            <a href="/" className="transition-colors hover:text-[#15803d]">Home</a>
            <span>›</span>
            <span>{t('favorites.breadcrumb')}</span>
          </div>

          <div className="mb-9 flex items-start justify-between gap-8 max-[960px]:flex-col">
            <div>
              <h1 className="font-display mb-3 text-3xl font-bold text-[#111827] sm:text-4xl">
                {t('favorites.titlePrefix')} <span className="text-[#15803d]">{t('favorites.titleHighlight')}</span>
              </h1>
              <p className="text-lg text-[#4b5563]">
                {t('favorites.subtitle')}
              </p>
              {!idsLoading && <SavedBadge count={total} />}
            </div>
            <PainterScene />
          </div>

          <div className="mb-8">
            <TabNav value={tab} onChange={setTab} counts={counts} />
          </div>

          {idsLoading && <LoadingState message={t('favorites.loading')} />}

          {!idsLoading && tab === 'schools' && (
            <>
              {counts.schools === 0 && <EmptyTabState tab="schools" />}
              {counts.schools > 0 && detailsLoading && <LoadingState message={t('favorites.loadingSchools')} />}
              {counts.schools > 0 && !detailsLoading && (
                schools.length === 0 ? (
                  <EmptyTabState tab="schools" />
                ) : (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {schools.map((school) => (
                      <FavCard
                        key={school.id}
                        variant="school"
                        item={{ id: school.id, name: school.name, subtitle: school.location, badge: school.type }}
                        onRemoved={() => markRemoved(school.id)}
                      />
                    ))}
                  </div>
                )
              )}
            </>
          )}

          {!idsLoading && tab === 'programs' && (
            <>
              {counts.programs === 0 && <EmptyTabState tab="programs" />}
              {counts.programs > 0 && detailsLoading && <LoadingState message={t('favorites.loadingPrograms')} />}
              {counts.programs > 0 && !detailsLoading && (
                programs.length === 0 ? (
                  <EmptyTabState tab="programs" />
                ) : (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {programs.map((program) => (
                      <FavCard
                        key={program.id}
                        variant="program"
                        item={{
                          id: program.id,
                          name: program.name,
                          subtitle: program.school?.name,
                          badge: program.cluster,
                        }}
                        onRemoved={() => markRemoved(program.id)}
                      />
                    ))}
                  </div>
                )
              )}
            </>
          )}

          {!idsLoading && tab === 'openhouses' && (
            <>
              {counts.openhouses === 0 && <EmptyTabState tab="openhouses" />}
              {counts.openhouses > 0 && detailsLoading && <LoadingState message={t('favorites.loadingOpenHouses')} />}
              {counts.openhouses > 0 && !detailsLoading && (
                openhouses.length === 0 ? (
                  <EmptyTabState tab="openhouses" />
                ) : (
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {openhouses.map((event) => (
                      <FavCardEvent
                        key={event.id}
                        event={event}
                        onRemoved={() => markRemoved(event.id)}
                      />
                    ))}
                  </div>
                )
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}