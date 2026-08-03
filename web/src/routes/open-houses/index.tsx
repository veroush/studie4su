import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Toast } from '@/components/common/toast'
import { StateAnimation } from '@/components/open-houses/state-animation'
import { EventCard } from '@/components/open-houses/event-card'
import { CalendarView } from '@/components/open-houses/calendar-view'
import { FilterTabs } from '@/components/open-houses/filter-tabs'
import { authClient } from '@/lib/auth-client'

export const Route = createFileRoute('/open-houses/')({ component: OpenHousesPage })

interface OpenHouseApi {
  id: string
  title: string
  description: string | null
  date: string
  location: string | null
  isOnline: boolean
  registrationUrl: string | null
  school: string
  registered: boolean
  registrationCount: number
}

interface FavoritesIds {
  schools: string[]
  programs: string[]
  openhouses: string[]
}

function addToGoogleCalendar(event: OpenHouseApi) {
  const start = new Date(event.date)
  const end = new Date(start.getTime() + 60 * 60 * 1000)
  const toGCal = (d: Date) => d.toISOString().replace(/[-:]|\.\d{3}/g, '')

  const url =
    'https://calendar.google.com/calendar/render' +
    '?action=TEMPLATE' +
    `&text=${encodeURIComponent('Open Dag – ' + event.school)}` +
    `&dates=${toGCal(start)}/${toGCal(end)}` +
    `&details=${encodeURIComponent('Toegevoegd via Studie4SU')}` +
    `&location=${encodeURIComponent(event.location ?? '')}` +
    '&sf=true'

  window.open(url, '_blank', 'noopener,noreferrer')
}

function isUpcoming(dateIso: string) {
  const eventDate = new Date(dateIso)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return eventDate >= today
}

function OpenHousesPage() {
  const { data: session } = authClient.useSession()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const {
    data: events,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['openhouses'],
    queryFn: async (): Promise<OpenHouseApi[]> => {
      const res = await fetch('/api/openhouses')
      if (!res.ok) throw new Error('Failed to fetch open houses')
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

  const [favOverrides, setFavOverrides] = useState<Record<string, boolean>>({})
  const [toast, setToast] = useState<{ message: string; visible: boolean; linkTo?: string }>({
    message: '',
    visible: false,
  })

  function isFavorited(id: string) {
    if (id in favOverrides) return favOverrides[id]
    return favIds?.openhouses.includes(id) ?? false
  }

  function handleFavoriteToggle(id: string, favorited: boolean) {
    setFavOverrides((prev) => ({ ...prev, [id]: favorited }))
    setToast({
      message: favorited ? 'Toegevoegd aan favorieten' : 'Verwijderd uit favorieten',
      visible: true,
      linkTo: favorited ? '/favorites' : undefined,
    })
  }

  const [filter, setFilter] = useState<'all' | 'upcoming' | 'saved'>('all')
  const [view, setView] = useState<'list' | 'calendar'>('list')

  const registerMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/openhouses/${id}/register`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to register')
      return res.json()
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['openhouses'] })
      const event = events?.find((e) => e.id === id)
      if (event) addToGoogleCalendar(event)
    },
  })

  const unregisterMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/openhouses/${id}/register`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to unregister')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['openhouses'] })
    },
  })

  const filtered = useMemo(() => {
    if (!events) return []
    let list = events
    if (filter === 'upcoming') list = list.filter((e) => isUpcoming(e.date))
    if (filter === 'saved') list = list.filter((e) => isFavorited(e.id))
    return [...list].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, filter, favOverrides, favIds])

  function handleRegisterToggle(event: OpenHouseApi) {
    if (!session?.user) {
      navigate({ to: '/login', search: { redirect: '/open-houses' } })
      return
    }
    if (event.registered) {
      unregisterMutation.mutate(event.id)
    } else {
      registerMutation.mutate(event.id)
    }
  }

  return (
    <div>
      <Navbar />

      <main className="bg-gradient-to-br from-[#f0fdf4] via-white to-[rgba(220,252,231,0.3)] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[80rem]">
          <div className="mb-12 px-4 text-center sm:px-[90px]">
            <h1 className="font-display mb-3 text-4xl font-bold leading-tight text-[#111827] md:text-5xl">
              Open Dagen
            </h1>
            <p className="text-lg text-[#4b5563]">
              Bezoek scholen en maak kennis met de opleidingen
            </p>
          </div>

          {!session?.user && (
            <div className="mb-8 rounded-xl border border-[#e8b84b]/40 bg-[#fef9ec] px-5 py-3 text-center text-sm text-[#4b5563]">
              <Link
                to="/login"
                search={{ redirect: '/open-houses' }}
                className="font-semibold text-[#15803d]"
              >
                Log in
              </Link>{' '}
              om je aan te melden voor een open dag.
            </div>
          )}

          <div className="mb-8 flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)] sm:flex-row sm:items-center sm:justify-between">
            <FilterTabs value={filter} onChange={setFilter} />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setView('list')}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  view === 'list' ? 'bg-[#dcfce7] text-[#166534]' : 'bg-[#f3f4f6] text-[#4b5563] hover:bg-[#e5e7eb]'
                }`}
              >
                Lijst
              </button>
              <button
                type="button"
                onClick={() => setView('calendar')}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  view === 'calendar' ? 'bg-[#dcfce7] text-[#166534]' : 'bg-[#f3f4f6] text-[#4b5563] hover:bg-[#e5e7eb]'
                }`}
              >
                Kalender
              </button>
            </div>
          </div>

          {isLoading && <StateAnimation kind="loading" message="Open dagen laden..." />}
          {isError && <StateAnimation kind="empty" message="Kon open dagen niet laden" />}
          {!isLoading && !isError && filtered.length === 0 && (
            <StateAnimation kind="empty" message="Geen open dagen gevonden" />
          )}

          {!isLoading && !isError && filtered.length > 0 && view === 'list' && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {filtered.map((event) => (
                <EventCard
                  key={event.id}
                  variant="list"
                  event={event}
                  isFavorited={isFavorited(event.id)}
                  isRegistered={event.registered}
                  onRegisterToggle={() => handleRegisterToggle(event)}
                  onFavoriteToggle={(favorited) => handleFavoriteToggle(event.id, favorited)}
                />
              ))}
            </div>
          )}

          {!isLoading && !isError && filtered.length > 0 && view === 'calendar' && (
            <CalendarView
              events={filtered}
              isFavorited={isFavorited}
              onRegisterToggle={handleRegisterToggle}
              onFavoriteToggle={handleFavoriteToggle}
            />
          )}
        </div>
      </main>

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