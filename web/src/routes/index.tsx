import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { GraduationCap, Search, Calendar } from 'lucide-react'
import { Hero } from '@/components/home/hero'
import { QuizBanner } from '@/components/home/quiz-banner'
import { SectionHeader } from '@/components/common/section-header'
import { SchoolCard } from '@/components/schools/school-card'
import { EventCard } from '@/components/open-houses/event-card'
import { LoadingState } from '@/components/common/loading-state'
import { EmptyState } from '@/components/common/empty-state'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { FeatureCard } from '@/components/home/feature-card'

import { FloatingIconsBackground } from '@/components/home/floating-icons-background'

export const Route = createFileRoute('/')({ component: Home })

// Same 3 pinned schools as v1's homepage, with the same Unsplash images.
const FEATURED_SCHOOL_IDS = ['school_adekus', 'school_ptc', 'school_fhr']
const FEATURED_SCHOOL_IMAGES: Record<string, string> = {
  school_adekus: 'https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=800&h=400&fit=crop',
  school_ptc: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&h=400&fit=crop',
  school_fhr: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=400&fit=crop',
}

interface School {
  id: string
  name: string
  shortName: string | null
  type: string
  location: string | null
  _count: { programs: number }
}

interface OpenHouse {
  id: string
  title: string
  date: string
  location: string | null
  isOnline: boolean
  school: string
}

function Home() {
  const { data: schools, isLoading: schoolsLoading, isError: schoolsError } = useQuery({
    queryKey: ['schools'],
    queryFn: async (): Promise<School[]> => {
      const res = await fetch('/api/schools')
      if (!res.ok) throw new Error('Failed to fetch schools')
      return res.json()
    },
  })

  const { data: openHouses, isLoading: eventsLoading, isError: eventsError } = useQuery({
    queryKey: ['openhouses'],
    queryFn: async (): Promise<OpenHouse[]> => {
      const res = await fetch('/api/openhouses')
      if (!res.ok) throw new Error('Failed to fetch open houses')
      return res.json()
    },
  })

  const totalPrograms = schools?.reduce((sum, s) => sum + s._count.programs, 0) ?? 0

  const featuredSchools = FEATURED_SCHOOL_IDS
    .map((id) => schools?.find((s) => s.id === id))
    .filter((s): s is School => Boolean(s))

  const upcomingEvents = (openHouses ?? [])
    .filter((oh) => new Date(oh.date) >= new Date(new Date().setHours(0, 0, 0, 0)))
    .slice(0, 4)

  return (
    <div>
      <FloatingIconsBackground />

      <div className="relative z-10">
      <Navbar />

      <Hero
        stats={[
          { value: schools ? `${schools.length}+` : '—', label: 'Scholen' },
          { value: schools ? `${totalPrograms}` : '—', label: 'Opleidingen' },
          { value: '2 min', label: 'Quiz' },
        ]}
      />

      <section className="bg-white/[0.02] py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-12">
            <SectionHeader label="Wat Wij Bieden" heading="Alles wat je nodig hebt" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              to="/schools"
              icon={<GraduationCap size={20} />}
              title="Scholen & Instituten"
              description="Verken AdeKUS, NATIN, IOL, COVAB, IMEAO en alle andere scholen in Suriname."
              imageUrl="https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=600&h=300&fit=crop"
              accent="green"
            />
            <FeatureCard
              to="/quiz"
              icon={<Search size={20} />}
              title="Studierichtingen"
              description="Bekijk alle beschikbare opleidingen — van Geneeskunde en Rechten tot ICT en Landbouw."
              imageUrl="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=300&fit=crop"
              accent="gold"
            />
            <FeatureCard
              to="/open-houses"
              icon={<Calendar size={20} />}
              title="Open Dagen"
              description="Bezoek scholen en ervaar opleidingen in het echt voordat je beslist."
              imageUrl="https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600&h=300&fit=crop"
              accent="teal"
            />
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-9">
            <SectionHeader label="Uitgelichte Scholen" heading="Scholen in Suriname" />
            <a href="/schools" className="text-sm text-[#e8b84b] border-b border-[#e8b84b]/30 pb-0.5 hover:border-[#e8b84b] whitespace-nowrap">
              Alle scholen →
            </a>
          </div>

          {schoolsLoading && <LoadingState message="Scholen laden..." />}
          {schoolsError && <EmptyState title="Kon scholen niet laden" description="Probeer het later opnieuw." />}
          {!schoolsLoading && !schoolsError && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredSchools.map((school) => (
                <SchoolCard
                  key={school.id}
                  variant="preview"
                  school={{
                    id: school.id,
                    name: school.name,
                    shortName: school.shortName,
                    type: school.type,
                    location: school.location,
                    imageUrl: FEATURED_SCHOOL_IMAGES[school.id],
                    programCount: school._count.programs,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-white/[0.02] py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-9">
            <SectionHeader label="Aankomende Evenementen" heading="Open Dagen" />
            <a href="/open-houses" className="text-sm text-[#e8b84b] border-b border-[#e8b84b]/30 pb-0.5 hover:border-[#e8b84b] whitespace-nowrap">
              Alle evenementen →
            </a>
          </div>

          {eventsLoading && <LoadingState message="Evenementen laden..." />}
          {eventsError && <EmptyState title="Kon evenementen niet laden" description="Probeer het later opnieuw." />}
          {!eventsLoading && !eventsError && upcomingEvents.length === 0 && (
            <EmptyState title="Geen aankomende evenementen" />
          )}
          {!eventsLoading && !eventsError && upcomingEvents.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} variant="preview" event={event} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="bg-gradient-to-br from-[#2d7a4f]/25 to-[#e8b84b]/8 border border-[#e8b84b]/20 rounded-[20px] py-16 px-14 text-center relative overflow-hidden">
            <span className="inline-flex items-center gap-1.5 bg-[#e8b84b]/15 border border-[#e8b84b]/35 text-[#e8b84b] text-[11px] font-medium tracking-[2px] uppercase px-3.5 py-1.5 rounded-full mb-5">
              ✦ Gratis & Duurt 2 Minuten
            </span>
            <SectionHeader label="" heading="Nog Niet Zeker Wat Je Wil Studeren?" />
            <p className="text-[#8aab96] max-w-[480px] mx-auto mt-3 mb-8">
              Beantwoord 10 korte vragen en wij matchen jou met het juiste programma.
            </p>
            <QuizBanner />
          </div>
        </div>
      </section>

      <Footer />
      </div>
    </div>
  )
}