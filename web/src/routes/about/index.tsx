import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { AboutHero } from '@/components/about/about-hero'
import { TeamMemberCard } from '@/components/about/team-member-card'

export const Route = createFileRoute('/about/')({ component: About })

interface TeamMember {
  name: string
  role: string
  bio: string
  image: string
}

interface AboutContent {
  hero: { p1: string; p2: string; p3: string; p4: string }
  team: TeamMember[]
}

// Same static NL copy v1 shipped with — used if AdminSettings.aboutUs
// hasn't been seeded yet, mirroring the fallback v1's about.js had.
const FALLBACK: AboutContent = {
  hero: {
    p1: 'Het kiezen van de juiste school of studierichting kan verwarrend zijn. Informatie is vaak verspreid over verschillende websites, social-mediapagina\u2019s of is simpelweg moeilijk te vinden. Als studenten hebben wij zelf ervaren hoe lastig het kan zijn om een duidelijk overzicht te krijgen van de opleidingsmogelijkheden in Suriname.',
    p2: 'Daarom hebben wij Studie4SU ontwikkeld — een platform dat het verkennen van scholen en studierichtingen eenvoudiger maakt. Onze website brengt informatie samen op één plek, waardoor studenten gemakkelijk scholen in Suriname kunnen zoeken, hun opties kunnen bekijken en zelfs een studiekeuzequiz kunnen doen om te ontdekken welke richting het beste bij hen past.',
    p3: 'Wat begon als een schoolproject groeide al snel uit tot een gezamenlijk doel: iets bouwen dat echt nuttig kan zijn voor toekomstige studenten. Door design, ontwikkeling en databasebeheer te combineren, hebben wij samen een platform gecreëerd dat studenten helpt beter geïnformeerde keuzes te maken over hun opleiding.',
    p4: 'Studie4SU is niet zomaar een website — het is onze manier om studenten te helpen de eerste stap richting hun toekomst te zetten.',
  },
  team: [
    {
      name: 'Valentino Amatsaleh',
      role: 'UI Designer • Animator • Frontend Developer',
      bio: 'Valentino was verantwoordelijk voor het ontwerpen van de visuele ervaring van de website. Hij ontwikkelde de gebruikersinterface, animaties en interactieve elementen die het platform aantrekkelijk en gebruiksvriendelijk maken. Door te focussen op gebruiksgemak en een modern ontwerp zorgde hij ervoor dat studenten soepel door de website kunnen navigeren en eenvoudig de beschikbare scholen en studierichtingen kunnen ontdekken.',
      image: 'Valentino.svg',
    },
    {
      name: 'Veroushka Ramjiawan',
      role: 'Backend Developer • Frontend Developer',
      bio: 'Veroushka werkte aan de kernfunctionaliteiten van de website. Door zowel backend- als frontend-onderdelen te ontwikkelen, hielp zij de gebruikersinterface te verbinden met het systeem achter de website. Haar werk zorgt ervoor dat zoekfuncties, quizzes en andere onderdelen soepel werken en de juiste informatie aan gebruikers tonen.',
      image: 'Veroushka.svg',
    },
    {
      name: 'Raksha Doerga',
      role: 'Database Designer • Backend Developer',
      bio: 'Raksha ontwierp en structureerde de database die het platform aandrijft. Hij verzamelde en organiseerde informatie over verschillende scholen en studierichtingen, zodat deze efficiënt kan worden doorzocht en weergegeven. Dankzij zijn werk kunnen gebruikers snel en gemakkelijk betrouwbare informatie vinden over onderwijsopties in Suriname.',
      image: 'Raksha.svg',
    },
    {
      name: 'Amerie Gardt',
      role: 'Project Manager',
      bio: 'Amerie speelde een belangrijke rol in het organiseren en begeleiden van de ontwikkeling van het project. Als projectmanager was zij verantwoordelijk voor het plannen van taken, het opstellen van doelen en het ervoor zorgen dat het team gedurende het ontwikkelingsproces op schema bleef. Door de workflow te coördineren en de voortgang te bewaken, zorgde zij ervoor dat elk onderdeel van het project op tijd werd afgerond en dat het team efficiënt naar het eindresultaat toewerkte.',
      image: 'Amerie.svg',
    },
  ],
}

function About() {
  const { data } = useQuery({
    queryKey: ['about'],
    queryFn: async (): Promise<AboutContent> => {
      const res = await fetch('/api/about')
      if (!res.ok) throw new Error('About content not found')
      return res.json()
    },
    retry: false,
  })

  const content = data ?? FALLBACK

  return (
    <div>
      <Navbar />

      <main className="bg-[radial-gradient(circle_at_top,#103326,#071610_65%)] text-[#f6f6ee]">
        <AboutHero
          label="Over Ons"
          heading="Studenten in Suriname helpen hun toekomst te vinden"
          paragraphs={[content.hero.p1, content.hero.p2, content.hero.p3, content.hero.p4]}
        />

        <section className="pb-20">
          <div className="max-w-[1200px] mx-auto px-6">
            <h2 className="font-display text-[clamp(1.5rem,3vw,2.4rem)] mb-8">
              Maak kennis met het team achter Studie4SU
            </h2>
            {content.team.map((member) => (
              <TeamMemberCard key={member.name} member={member} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}