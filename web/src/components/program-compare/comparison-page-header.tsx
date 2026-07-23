import { Link } from '@tanstack/react-router'

export function ComparisonPageHeader() {
  return (
    <header>
      <Link to="/schools">← Terug</Link>

      <h1>Vergelijk opleidingen</h1>

      {/* face illustrations go here (decorative) */}
      <div aria-hidden="true">
        <img src="/img/school_compare_face1.png" alt="" />
        <img src="/img/school_compare_face2.png" alt="" />
      </div>
    </header>
  )
}
