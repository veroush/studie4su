// One-off backfill: adds the English translations for the About page
// (hero paragraphs + team bios) into the existing AdminSettings row,
// without touching anything an admin may have already typed into the
// English fields via /admin/settings.
//
// Run once from inside the web/ folder:
//   node scripts/backfill-about-en.mjs

import { config } from 'dotenv'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

config({ path: '.env.local' })

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})
const prisma = new PrismaClient({ adapter })

const HERO_EN = {
  p1En:
    "Choosing the right school or field of study can be confusing. Information is often scattered across different websites and social media pages, or is simply hard to find. As students ourselves, we've experienced firsthand how hard it can be to get a clear overview of the study options available in Suriname.",
  p2En:
    "That's why we built Studie4SU — a platform that makes exploring schools and fields of study easier. Our website brings information together in one place, so students can easily search schools in Suriname, browse their options, and even take a study-choice quiz to discover which field suits them best.",
  p3En:
    "What started as a school project quickly grew into a shared goal: building something that could genuinely help future students. By combining design, development, and database management, we built a platform together that helps students make better-informed choices about their education.",
  p4En:
    "Studie4SU isn't just a website — it's our way of helping students take the first step toward their future.",
}

// Matched by name against whatever team members already exist in the DB.
// Any member not listed here (e.g. one an admin added manually) is left
// as-is — its bioEn will just fall back to the Dutch bio on the site.
const TEAM_BIO_EN = {
  'Valentino Amatsaleh':
    "Valentino was responsible for designing the website's visual experience. He built the user interface, animations, and interactive elements that make the platform engaging and easy to use. By focusing on usability and a modern design, he made sure students can navigate the site smoothly and easily discover the available schools and fields of study.",
  'Veroushka Ramjiawan':
    "Veroushka worked on the website's core functionality. By building both backend and frontend components, she helped connect the user interface to the system behind the website. Her work makes sure search features, quizzes, and other parts of the site work smoothly and show users the right information.",
  'Raksha Doerga':
    'Raksha designed and structured the database that powers the platform. He gathered and organized information about various schools and fields of study so it could be searched and displayed efficiently. Thanks to his work, users can quickly and easily find reliable information about educational options in Suriname.',
  'Amerie Gardt':
    "Amerie played a key role in organizing and guiding the project's development. As project manager, she was responsible for planning tasks, setting goals, and keeping the team on schedule throughout development. By coordinating the workflow and tracking progress, she made sure every part of the project was finished on time and the team worked efficiently toward the end result.",
}

async function main() {
  const settings = await prisma.adminSettings.findFirst()

  if (!settings || !settings.aboutUs) {
    console.log('No AdminSettings row (or no aboutUs field) found — nothing to backfill.')
    console.log('Load the site once so it seeds default settings, then re-run this script.')
    return
  }

  const aboutUs = settings.aboutUs
  let heroChanged = 0
  let teamChanged = 0

  aboutUs.hero = aboutUs.hero || {}
  for (const [key, value] of Object.entries(HERO_EN)) {
    if (!aboutUs.hero[key]) {
      aboutUs.hero[key] = value
      heroChanged++
    }
  }

  aboutUs.team = (aboutUs.team || []).map((member) => {
    if (!member.bioEn && TEAM_BIO_EN[member.name]) {
      teamChanged++
      return { ...member, bioEn: TEAM_BIO_EN[member.name] }
    }
    return member
  })

  if (heroChanged === 0 && teamChanged === 0) {
    console.log('Nothing to do — English fields are already filled in.')
    return
  }

  await prisma.adminSettings.update({
    where: { id: settings.id },
    data: { aboutUs },
  })

  console.log(`Backfilled ${heroChanged} hero paragraph(s) and ${teamChanged} team bio(s).`)
  console.log('Reload the About page and toggle to EN to check it.')
}

main()
  .catch((err) => {
    console.error('Backfill failed:', err)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
