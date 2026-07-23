import { Link } from '@tanstack/react-router'

interface SliderProgram {
  id: string
  name: string
  cluster: string
  duration?: string | null
}

interface ProgramsSliderProps {
  programs: SliderProgram[]
}

// TODO: wire up drag-to-scroll and auto-advance behavior once the
// visual design is in place — structure only for now.
export function ProgramsSlider({ programs }: ProgramsSliderProps) {
  return (
    <div role="region" aria-label="Opleidingen">
      <ul>
        {programs.map((program) => (
          <li key={program.id}>
            <Link to="/programs/$programId" params={{ programId: program.id }}>
              <span>{program.cluster}</span>
              <h3>{program.name}</h3>
              {program.duration && <p>{program.duration}</p>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
