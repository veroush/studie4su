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
import { GraduateLoader } from '@/components/common/graduate-loader'
import { useEffect, useRef, useState } from 'react'

import { createIsomorphicFn } from '@tanstack/react-start'
import { FloatingIconsBackground } from '@/components/home/floating-icons-background'
import { useLanguage } from '@/lib/i18n/language-context'

const fetchSchools = createIsomorphicFn()
  .server(async () => {
    const { getSchoolsList } = await import('@/server/routes/schools')
    return getSchoolsList()
  })
  .client(async () => {
    const res = await fetch('/api/schools')
    if (!res.ok) throw new Error('Failed to fetch schools')
    return res.json()
  })

const fetchOpenHouses = createIsomorphicFn()
  .server(async () => {
    const { getOpenHousesList } = await import('@/server/routes/open-houses')
    return getOpenHousesList()
  })
  .client(async () => {
    const res = await fetch('/api/openhouses')
    if (!res.ok) throw new Error('Failed to fetch open houses')
    return res.json()
  })

export const Route = createFileRoute('/')({ component: Home })

// Same 3 pinned schools as v1's homepage, with the same Unsplash images.
const FEATURED_SCHOOL_IDS = ['school_adekus', 'school_ptc', 'school_fhr']
interface School {
  id: string
  name: string
  shortName: string | null
  type: string
  location: string | null
  imageUrl: string | null
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
  const { t } = useLanguage()
  const { data: schools, isLoading: schoolsLoading, isError: schoolsError } = useQuery({
    queryKey: ['schools'],
    queryFn: () => fetchSchools() as Promise<School[]>,
  })

  const { data: openHouses, isLoading: eventsLoading, isError: eventsError } = useQuery({
    queryKey: ['openhouses'],
    queryFn: () => fetchOpenHouses() as Promise<OpenHouse[]>,
  })

  const totalPrograms = schools?.reduce((sum, s) => sum + s._count.programs, 0) ?? 0

  const featuredSchools = FEATURED_SCHOOL_IDS
    .map((id) => schools?.find((s) => s.id === id))
    .filter((s): s is School => Boolean(s))

  const upcomingEvents = (openHouses ?? [])
    .filter((oh) => new Date(oh.date) >= new Date(new Date().setHours(0, 0, 0, 0)))
    .slice(0, 4)

  // One-time full-page splash screen:
  //  - 0 -> 10%: quick fixed intro so it always feels immediately alive
  //  - 10 -> 90%: creeps up while we wait on the real page data (schools +
  //    open houses queries) — never finishes on its own
  //  - once that data is actually ready: snaps the rest of the way to 100%
  //  - holds at 100% for 1s, then fades out and reveals the page
  // Shown once per session (tracked in sessionStorage).
  const dataReady = !schoolsLoading && !eventsLoading
  const dataReadyRef = useRef(dataReady)
  dataReadyRef.current = dataReady

  const [splashMounted, setSplashMounted] = useState(true)
  const [splashFading, setSplashFading] = useState(false)
  const [splashProgress, setSplashProgress] = useState(0)

  useEffect(() => {
    // In production this only plays once per browser session. In dev we
    // skip that check entirely so it's easy to keep testing on reload.
    if (!import.meta.env.DEV && sessionStorage.getItem('studie4su-splash-shown')) {
      setSplashMounted(false)
      return
    }

    let frame: number
    let finishing = false
    let finishStart = 0
    let finishFromPct = 10
    const start = performance.now()
    const introDuration = 350
    const creepDuration = 4500
    const finishDuration = 350
    const holdDuration = 1000

    const tick = (now: number) => {
      if (!finishing) {
        const elapsed = now - start
        let pct: number
        if (elapsed < introDuration) {
          pct = (elapsed / introDuration) * 10
        } else {
          const t = Math.min((elapsed - introDuration) / creepDuration, 1)
          const eased = 1 - (1 - t) ** 3
          pct = 10 + eased * 80
        }
        setSplashProgress(pct)

        if (dataReadyRef.current) {
          finishing = true
          finishStart = now
          finishFromPct = pct
        }

        frame = requestAnimationFrame(tick)
        return
      }

      const t = Math.min((now - finishStart) / finishDuration, 1)
      setSplashProgress(finishFromPct + (100 - finishFromPct) * t)

      if (t < 1) {
        frame = requestAnimationFrame(tick)
      } else {
        sessionStorage.setItem('studie4su-splash-shown', '1')
        setTimeout(() => {
          setSplashFading(true)
          setTimeout(() => setSplashMounted(false), 400)
        }, holdDuration)
      }
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div>
      {splashMounted && (
        <div
          className={`fixed inset-0 z-[100] bg-[#0D2B1F] text-[#f0ebe0] flex items-center justify-center transition-opacity duration-400 ${
            splashFading ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <GraduateLoader progress={splashProgress} size={360} showLabel={false} />
        </div>
      )}

      <FloatingIconsBackground />

      <div className="relative z-10">
      <Navbar />

      <Hero
        stats={[
          { value: schools ? `${schools.length}+` : '—', label: t('home.statSchools') },
          { value: schools ? `${totalPrograms}` : '—', label: t('home.statPrograms') },
          { value: '2 min', label: t('home.statQuiz') },
        ]}
      />

      <section className="bg-white/[0.02] py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-12">
            <SectionHeader label={t('home.offerLabel')} heading={t('home.offerHeading')} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              to="/schools"
              icon={<GraduationCap size={20} />}
              title={t('home.feature1Title')}
              description={t('home.feature1Desc')}
              imageUrl="https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=600&h=300&fit=crop"
              accent="green"
            />
            <FeatureCard
              to="/quiz"
              icon={<Search size={20} />}
              title={t('home.feature2Title')}
              description={t('home.feature2Desc')}
              imageUrl="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=300&fit=crop"
              accent="gold"
            />
            <FeatureCard
              to="/open-houses"
              icon={<Calendar size={20} />}
              title={t('home.feature3Title')}
              description={t('home.feature3Desc')}
              imageUrl="https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600&h=300&fit=crop"
              accent="teal"
            />
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-9">
            <SectionHeader label={t('home.featuredSchoolsLabel')} heading={t('home.featuredSchoolsHeading')} />
            <a href="/schools" className="text-sm text-[#e8b84b] border-b border-[#e8b84b]/30 pb-0.5 hover:border-[#e8b84b] whitespace-nowrap">
              {t('home.allSchools')}
            </a>
          </div>

          {schoolsLoading && <LoadingState message={t('common.loadingSchools')} />}
          {schoolsError && <EmptyState title={t('common.couldNotLoadSchools')} description={t('common.tryAgainLater')} />}
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
                    imageUrl: school.imageUrl,
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
            <SectionHeader label={t('home.upcomingEventsLabel')} heading={t('home.upcomingEventsHeading')} />
            <a href="/open-houses" className="text-sm text-[#e8b84b] border-b border-[#e8b84b]/30 pb-0.5 hover:border-[#e8b84b] whitespace-nowrap">
              {t('home.allEvents')}
            </a>
          </div>

          {eventsLoading && <LoadingState message={t('common.loadingEvents')} />}
          {eventsError && <EmptyState title={t('common.couldNotLoadEvents')} description={t('common.tryAgainLater')} />}
          {!eventsLoading && !eventsError && upcomingEvents.length === 0 && (
            <EmptyState title={t('common.noUpcomingEvents')} />
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
              {t('home.quizCtaBadge')}
            </span>
            <SectionHeader label="" heading={t('home.quizCtaHeading')} />
            <p className="text-[#8aab96] max-w-[480px] mx-auto mt-3 mb-8">
              {t('home.quizCtaDesc')}
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