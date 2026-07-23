import { Link } from '@tanstack/react-router'

export function Footer() {
  return (
    <footer>
      <div>
        <span>Studie4SU</span>
        <p>Vind jouw studierichting in Suriname.</p>
      </div>

      <nav>
        <Link to="/schools">Scholen</Link>
        <Link to="/quiz">Quiz</Link>
        <Link to="/open-houses">Open Dagen</Link>
        <Link to="/about">Over Ons</Link>
      </nav>

      <p>&copy; {new Date().getFullYear()} Studie4SU</p>
    </footer>
  )
}
