import { createFileRoute } from '@tanstack/react-router'
import { GraduationCap, Search, Calendar } from 'lucide-react'
import { Hero } from '@/components/home/hero'
import { FeatureCard } from '@/components/home/feature-card'
import { QuizBanner } from '@/components/home/quiz-banner'
import { FloatingIconsBackground } from '@/components/home/floating-icons-background'
import { SectionHeader } from '@/components/common/section-header'
import { SchoolCard } from '@/components/schools/school-card'
import { EventCard } from '@/components/open-houses/event-card'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'

export const Route = createFileRoute('/')({ component: Home })

// TODO: replace with real data via useQuery once the schools/open-houses
// endpoints are wired into the frontend — placeholder shape for now so
// the page renders and the layout can be reviewed.
const FEATURED_SCHOOLS = [
  { id: '1', name: 'Anton de Kom Universiteit', type: 'Universiteit', location: 'Paramaribo' },
]
const UPCOMING_EVENTS = [
  { id: '1', title: 'Open Dag IOL', date: new Date().toISOString(), isOnline: false, location: 'Paramaribo' },
]

function Home() {
  return (
    <div>
      <Navbar />

      <Hero
        stats={[
          { value: '20+', label: 'Scholen' },
          { value: '100+', label: 'Opleidingen' },
          { value: '2 min', label: 'Quiz' },
        ]}
      />

      <section>
        <FeatureCard
          to="/schools"
          icon={<GraduationCap />}
          title="Scholen"
          description="Blader door alle middelbare scholen en opleidingen in Suriname."
        />
        <FeatureCard
          to="/quiz"
          icon={<Search />}
          title="Studie Quiz"
          description="Beantwoord een paar vragen en ontdek welke richting bij je past."
        />
        <FeatureCard
          to="/open-houses"
          icon={<Calendar />}
          title="Open Dagen"
          description="Blijf op de hoogte van aankomende open dagen bij scholen."
        />
      </section>

      <section>
        <SectionHeader label="Ontdek" heading="Uitgelichte Scholen" />
        {FEATURED_SCHOOLS.map((school) => (
          <SchoolCard key={school.id} school={school} variant="preview" />
        ))}
      </section>

      <section>
        <SectionHeader label="Binnenkort" heading="Aankomende Open Dagen" />
        {UPCOMING_EVENTS.map((event) => (
          <EventCard key={event.id} event={event} variant="preview" />
        ))}
      </section>

      <FloatingIconsBackground />

      <QuizBanner />

      <Footer />
    </div>
  )
}
