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
    <div
      role="dialog"
      aria-modal="true"
      className="flex flex-col border-t border-white/[0.08] bg-[var(--bg-dark)] px-6 pb-4 pt-3 md:hidden"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close menu"
        className="self-end p-1.5 text-white/70 hover:text-white"
      >
        ✕
      </button>

      <nav className="flex flex-col">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            onClick={onClose}
            className="border-b border-white/[0.06] py-2.5 text-[0.95rem] font-medium text-white/80 last:border-b-0"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {session?.user ? (
        <>
          <Link to="/favorites" onClick={onClose} className="py-2.5 text-[0.95rem] font-medium text-white/80">
            Favorieten
          </Link>
          <Link to="/settings" onClick={onClose} className="py-2.5 text-[0.95rem] font-medium text-white/80">
            Instellingen
          </Link>
        </>
      ) : (
        <Link to="/login" onClick={onClose} className="py-2.5 text-[0.95rem] font-medium text-white/80">
          Inloggen
        </Link>
      )}
    </div>
  )
}