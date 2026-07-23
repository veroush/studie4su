import { Link } from '@tanstack/react-router'

interface MobileNavProps {
  open: boolean
  onClose: () => void
  links: { to: string; label: string }[]
  session: { user: { name: string } } | null | undefined
}

export function MobileNav({ open, onClose, links, session }: MobileNavProps) {
  if (!open) return null

  return (
    <div role="dialog" aria-modal="true">
      <button type="button" onClick={onClose} aria-label="Close menu">
        ✕
      </button>

      <nav>
        {links.map((link) => (
          <Link key={link.to} to={link.to} onClick={onClose}>
            {link.label}
          </Link>
        ))}
      </nav>

      {session?.user ? (
        <Link to="/settings" onClick={onClose}>
          Instellingen
        </Link>
      ) : (
        <Link to="/login" onClick={onClose}>
          Inloggen
        </Link>
      )}
    </div>
  )
}
