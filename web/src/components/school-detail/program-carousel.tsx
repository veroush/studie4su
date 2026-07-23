import { useState } from 'react'
import { Link } from '@tanstack/react-router'

interface CarouselProgram {
  id: string
  name: string
  cluster: string
}

interface ProgramCarouselProps {
  programs: CarouselProgram[]
}

// Smaller dot-nav variant of ProgramsSlider — one program visible at a
// time with pagination dots, kept separate in case both are used
// together (e.g. mobile vs desktop).
export function ProgramCarousel({ programs }: ProgramCarouselProps) {
  const [index, setIndex] = useState(0)
  const active = programs[index]

  if (!active) return null

  return (
    <div role="region" aria-label="Opleidingen">
      <Link to="/programs/$programId" params={{ programId: active.id }}>
        <span>{active.cluster}</span>
        <h3>{active.name}</h3>
      </Link>

      <div role="tablist" aria-label="Opleiding navigatie">
        {programs.map((program, i) => (
          <button
            key={program.id}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={program.name}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  )
}
