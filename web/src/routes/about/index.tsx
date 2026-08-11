import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { AboutHero } from '@/components/about/about-hero'
import { TeamMemberCard } from '@/components/about/team-member-card'
import { useLanguage } from '@/lib/i18n/language-context'

export const Route = createFileRoute('/about/')({ component: About })

interface TeamMember {
  name: string
  role: string
  roleEn?: string
  bio: string
  bioEn?: string
  image: string
}

interface AboutContent {
  hero: {
    p1: string
    p2: string
    p3: string
    p4: string
    p1En?: string
    p2En?: string
    p3En?: string
    p4En?: string
  }
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
    p1En:
      "Choosing the right school or field of study can be confusing. Information is often scattered across different websites and social media pages, or is simply hard to find. As students ourselves, we've experienced firsthand how hard it can be to get a clear overview of the study options available in Suriname.",
    p2En:
      "That's why we built Studie4SU — a platform that makes exploring schools and fields of study easier. Our website brings information together in one place, so students can easily search schools in Suriname, browse their options, and even take a study-choice quiz to discover which field suits them best.",
    p3En:
      'What started as a school project quickly grew into a shared goal: building something that could genuinely help future students. By combining design, development, and database management, we built a platform together that helps students make better-informed choices about their education.',
    p4En:
      "Studie4SU isn't just a website — it's our way of helping students take the first step toward their future.",
  },
  team: [
    {
      name: 'Valentino Amatsaleh',
      role: 'UI Designer • Animator • Frontend Developer',
      bio: 'Valentino was verantwoordelijk voor het ontwerpen van de visuele ervaring van de website. Hij ontwikkelde de gebruikersinterface, animaties en interactieve elementen die het platform aantrekkelijk en gebruiksvriendelijk maken. Door te focussen op gebruiksgemak en een modern ontwerp zorgde hij ervoor dat studenten soepel door de website kunnen navigeren en eenvoudig de beschikbare scholen en studierichtingen kunnen ontdekken.',
      bioEn:
        "Valentino was responsible for designing the website's visual experience. He built the user interface, animations, and interactive elements that make the platform engaging and easy to use. By focusing on usability and a modern design, he made sure students can navigate the site smoothly and easily discover the available schools and fields of study.",
      image: 'Valentino.svg',
    },
    {
      name: 'Veroushka Ramjiawan',
      role: 'Backend Developer • Frontend Developer',
      bio: 'Veroushka werkte aan de kernfunctionaliteiten van de website. Door zowel backend- als frontend-onderdelen te ontwikkelen, hielp zij de gebruikersinterface te verbinden met het systeem achter de website. Haar werk zorgt ervoor dat zoekfuncties, quizzes en andere onderdelen soepel werken en de juiste informatie aan gebruikers tonen.',
      bioEn:
        "Veroushka worked on the website's core functionality. By building both backend and frontend components, she helped connect the user interface to the system behind the website. Her work makes sure search features, quizzes, and other parts of the site work smoothly and show users the right information.",
      image: 'Veroushka.svg',
    },
    {
      name: 'Raksha Doerga',
      role: 'Database Designer • Backend Developer',
      bio: 'Raksha ontwierp en structureerde de database die het platform aandrijft. Hij verzamelde en organiseerde informatie over verschillende scholen en studierichtingen, zodat deze efficiënt kan worden doorzocht en weergegeven. Dankzij zijn werk kunnen gebruikers snel en gemakkelijk betrouwbare informatie vinden over onderwijsopties in Suriname.',
      bioEn:
        'Raksha designed and structured the database that powers the platform. He gathered and organized information about various schools and fields of study so it could be searched and displayed efficiently. Thanks to his work, users can quickly and easily find reliable information about educational options in Suriname.',
      image: 'Raksha.svg',
    },
    {
      name: 'Amerie Gardt',
      role: 'Project Manager',
      bio: 'Amerie speelde een belangrijke rol in het organiseren en begeleiden van de ontwikkeling van het project. Als projectmanager was zij verantwoordelijk voor het plannen van taken, het opstellen van doelen en het ervoor zorgen dat het team gedurende het ontwikkelingsproces op schema bleef. Door de workflow te coördineren en de voortgang te bewaken, zorgde zij ervoor dat elk onderdeel van het project op tijd werd afgerond en dat het team efficiënt naar het eindresultaat toewerkte.',
      bioEn:
        "Amerie played a key role in organizing and guiding the project's development. As project manager, she was responsible for planning tasks, setting goals, and keeping the team on schedule throughout development. By coordinating the workflow and tracking progress, she made sure every part of the project was finished on time and the team worked efficiently toward the end result.",
      image: 'Amerie.svg',
    },
  ],
}

function About() {
  const { t, lang } = useLanguage()
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

  const paragraphs =
    lang === 'en'
      ? [
          content.hero.p1En ?? content.hero.p1,
          content.hero.p2En ?? content.hero.p2,
          content.hero.p3En ?? content.hero.p3,
          content.hero.p4En ?? content.hero.p4,
        ]
      : [content.hero.p1, content.hero.p2, content.hero.p3, content.hero.p4]

  return (
    <div>
      <Navbar />

      <main className="bg-[radial-gradient(circle_at_top,#103326,#071610_65%)] text-[#f6f6ee]">
        <AboutHero
          label={t('about.label')}
          heading={t('about.heading')}
          paragraphs={paragraphs}
        />

        <section className="pb-20">
          <div className="max-w-[1200px] mx-auto px-6">
            <h2 className="font-display text-[clamp(1.5rem,3vw,2.4rem)] mb-8">
              {t('about.teamHeading')}
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