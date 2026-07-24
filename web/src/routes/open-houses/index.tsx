import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { LoadingState } from '@/components/common/loading-state'
import { EmptyState } from '@/components/common/empty-state'
import { EventCard } from '@/components/open-houses/event-card'
import { CalendarEventRow } from '@/components/open-houses/calendar-event-row'
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

const MONTHS_NL = [
  'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
  'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December',
]

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

  const [filter, setFilter] = useState<'all' | 'upcoming'>('all')
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
    const list = filter === 'upcoming' ? events.filter((e) => isUpcoming(e.date)) : events
    return [...list].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [events, filter])

  const grouped = useMemo(() => {
    const map = new Map<string, OpenHouseApi[]>()
    filtered.forEach((event) => {
      const key = event.date.slice(0, 7)
      const bucket = map.get(key) ?? []
      bucket.push(event)
      map.set(key, bucket)
    })
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [filtered])

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

      <section className="py-16">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="text-center mb-10">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-[#faf6ee] mb-3">
              Open Dagen
            </h1>
            <p className="text-[#8aab96] text-lg">
              Bezoek scholen en maak kennis met de opleidingen
            </p>
          </div>

          {!session?.user && (
            <div className="bg-[#122b1e] border border-[#e8b84b]/20 rounded-xl px-5 py-3 mb-8 text-center text-sm text-[#8aab96]">
              <Link
                to="/login"
                search={{ redirect: '/open-houses' }}
                className="text-[#e8b84b] font-semibold"
              >
                Log in
              </Link>{' '}
              om je aan te melden voor een open dag.
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#122b1e] border border-white/[0.07] rounded-2xl p-4 mb-8">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-gradient-to-r from-[#2d7a4f] to-[#1d5c38] text-white'
                    : 'bg-white/5 text-[#8aab96] hover:bg-white/10'
                }`}
              >
                Alle
              </button>
              <button
                type="button"
                onClick={() => setFilter('upcoming')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'upcoming'
                    ? 'bg-gradient-to-r from-[#2d7a4f] to-[#1d5c38] text-white'
                    : 'bg-white/5 text-[#8aab96] hover:bg-white/10'
                }`}
              >
                Aankomend
              </button>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setView('list')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  view === 'list'
                    ? 'bg-[#e8b84b]/15 text-[#e8b84b]'
                    : 'bg-white/5 text-[#8aab96] hover:bg-white/10'
                }`}
              >
                Lijst
              </button>
              <button
                type="button"
                onClick={() => setView('calendar')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  view === 'calendar'
                    ? 'bg-[#e8b84b]/15 text-[#e8b84b]'
                    : 'bg-white/5 text-[#8aab96] hover:bg-white/10'
                }`}
              >
                Kalender
              </button>
            </div>
          </div>

          {isLoading && <LoadingState message="Open dagen laden..." />}
          {isError && (
            <EmptyState
              title="Kon open dagen niet laden"
              description="Controleer of je server actief is."
            />
          )}

          {!isLoading && !isError && filtered.length === 0 && (
            <EmptyState title="Geen open dagen gevonden" />
          )}

          {!isLoading && !isError && filtered.length > 0 && view === 'list' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filtered.map((event) => (
                <EventCard
                  key={event.id}
                  variant="list"
                  event={event}
                  isRegistered={event.registered}
                  onRegisterToggle={() => handleRegisterToggle(event)}
                />
              ))}
            </div>
          )}

          {!isLoading && !isError && filtered.length > 0 && view === 'calendar' && (
            <div className="flex flex-col gap-8">
              {grouped.map(([key, monthEvents]) => {
                const [year, month] = key.split('-').map(Number)
                return (
                  <div
                    key={key}
                    className="bg-[#122b1e] border border-white/[0.07] rounded-2xl p-6"
                  >
                    <h2 className="font-display text-xl text-[#faf6ee] mb-4">
                      {MONTHS_NL[month - 1]} {year}
                    </h2>
                    <div className="flex flex-col gap-3">
                      {monthEvents.map((event) => (
                        <CalendarEventRow
                          key={event.id}
                          event={event}
                          isRegistered={event.registered}
                          onRegisterToggle={() => handleRegisterToggle(event)}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}