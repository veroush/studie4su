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
    <header className="sticky top-0 z-[100] bg-[#0d2b1f] border-b border-[#e8b84b]/20">
      <div className="max-w-[1280px] mx-auto px-6 h-[68px] flex items-center justify-between gap-4 relative">
        <Link to="/" className="font-display text-2xl text-[#e8b84b] whitespace-nowrap">
          Studie<span className="text-white">4SU</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="px-3.5 py-2 rounded-lg text-sm font-medium text-white/75 hover:text-white hover:bg-white/8 transition-colors"
              activeProps={{ className: 'text-[#e8b84b]' }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setLang(lang === 'nl' ? 'en' : 'nl')}
            aria-label="Toggle language"
            className="border border-white/25 text-white/75 hover:border-[#e8b84b] hover:text-[#e8b84b] rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors"
          >
            {lang.toUpperCase()}
          </button>

          {session?.user ? (
            <ProfileDropdown user={session.user} />
          ) : (
            <Link
              to="/login"
              className="bg-[#e8b84b] text-[#0d2b1f] rounded-lg px-4.5 py-2 text-sm font-semibold hover:opacity-85 transition-opacity"
            >
              Inloggen
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open menu"
            className="md:hidden text-white p-1.5"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
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