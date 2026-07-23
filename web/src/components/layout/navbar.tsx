import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { authClient } from '@/lib/auth-client'
import { ProfileDropdown } from './profile-dropdown'
import { MobileNav } from './mobile-nav'

const NAV_LINKS = [
  { to: '/schools', label: 'Scholen' },
  { to: '/quiz', label: 'Quiz' },
  { to: '/open-houses', label: 'Open Dagen' },
  { to: '/about', label: 'Over Ons' },
]

export function Navbar() {
  const { data: session } = authClient.useSession()
  const [lang, setLang] = useState<'nl' | 'en'>('nl')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <header>
      <div>
        <Link to="/">
          <span>Studie4SU</span>
        </Link>

        <nav>
          {NAV_LINKS.map((link) => (
            <Link key={link.to} to={link.to}>
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setLang(lang === 'nl' ? 'en' : 'nl')}
          aria-label="Toggle language"
        >
          {lang.toUpperCase()}
        </button>

        {session?.user ? (
          <ProfileDropdown user={session.user} />
        ) : (
          <Link to="/login">Inloggen</Link>
        )}

        <button
          type="button"
          onClick={() => setMobileNavOpen(true)}
          aria-label="Open menu"
        >
          {/* hamburger icon goes here */}
          ☰
        </button>
      </div>

      <MobileNav
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        links={NAV_LINKS}
        session={session}
      />
    </header>
  )
}
