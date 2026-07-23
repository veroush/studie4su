import { Link } from '@tanstack/react-router'

interface HeroStat {
  value: string
  label: string
}

interface HeroProps {
  stats: HeroStat[]
}

export function Hero({ stats }: HeroProps) {
  return (
    <section>
      <span>Jouw toekomst begint hier</span>

      <h1>
        Vind jouw studierichting
        <br />
        in Suriname
      </h1>

      <p>
        Ontdek alle scholen, opleidingen en open dagen in Suriname. Weet je nog niet
        wat je wil studeren? Doe onze gratis quiz en vind je match in 2 minuten.
      </p>

      <div>
        <Link to="/quiz">Doe de Studie Quiz</Link>
        <Link to="/schools">Verken Scholen</Link>
      </div>

      <dl>
        {stats.map((stat) => (
          <div key={stat.label}>
            <dt>{stat.label}</dt>
            <dd>{stat.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
