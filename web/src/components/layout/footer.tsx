import { Link } from '@tanstack/react-router'

export function Footer() {
  return (
    <footer className="bg-[#0d2b1f] text-white/55 text-center py-7 px-6 text-sm border-t border-[#e8b84b]/15">
      <p>
        © {new Date().getFullYear()}{' '}
        <Link to="/" className="text-[#e8b84b] hover:underline">Studie4SU</Link>
        {' '}— Studiekeuze voor Surinaamse studenten •{' '}
        <Link to="/about" className="text-[#e8b84b] hover:underline">Over ons</Link>
      </p>
    </footer>
  )
}