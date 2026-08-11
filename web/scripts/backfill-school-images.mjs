// One-off backfill: sets School.imageUrl for schools we have a matching
// photo for (copied into web/public/img/schools/). Matches by a
// case-insensitive substring against each school's name, and only fills
// in schools that don't already have an imageUrl set — so it's safe to
// re-run and won't clobber anything set manually via /admin/schools.
//
// Run once from inside the web/ folder:
//   node scripts/backfill-school-images.mjs

import { config } from 'dotenv'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

config({ path: '.env.local' })

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})
const prisma = new PrismaClient({ adapter })

// [matcher(s) to look for in the school name, lowercased, imageUrl to set]
const MATCHERS = [
  { keywords: ['anton de kom', 'adekus'], imageUrl: '/img/schools/adekus.png' },
  { keywords: ['polytechnic', 'ptc'], imageUrl: '/img/schools/ptc.png' },
  { keywords: ['frederik hendrik', 'lim a po', 'fhr'], imageUrl: '/img/schools/fhr.jpg' },
  { keywords: ['igsr'], imageUrl: '/img/schools/igsr.jpg' },
  { keywords: ['iol'], imageUrl: '/img/schools/iol.png' },
]

async function main() {
  const schools = await prisma.school.findMany()

  if (schools.length === 0) {
    console.log('No schools found in the database — nothing to backfill.')
    return
  }

  let updated = 0
  let alreadySet = 0
  const unmatched = []

  for (const school of schools) {
    if (school.imageUrl) {
      alreadySet++
      continue
    }

    const haystack = `${school.name} ${school.shortName ?? ''}`.toLowerCase()
    const match = MATCHERS.find((m) => m.keywords.some((kw) => haystack.includes(kw)))

    if (match) {
      await prisma.school.update({
        where: { id: school.id },
        data: { imageUrl: match.imageUrl },
      })
      console.log(`Set image for "${school.name}" -> ${match.imageUrl}`)
      updated++
    } else {
      unmatched.push(school.name)
    }
  }

  console.log(`\nDone. Updated ${updated}, already had an image: ${alreadySet}.`)
  if (unmatched.length > 0) {
    console.log(`No matching photo found for: ${unmatched.join(', ')}`)
    console.log('Add an image for these manually via /admin/schools (Image URL field).')
  }
}

main()
  .catch((err) => {
    console.error('Backfill failed:', err)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
