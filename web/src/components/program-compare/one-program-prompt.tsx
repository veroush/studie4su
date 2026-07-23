import { Link } from '@tanstack/react-router'

// Shown when only one program is selected — nudges the user to add
// at least one more before a comparison can be shown.
export function OneProgramPrompt() {
  return (
    <div role="status">
      <p>Selecteer nog minstens één opleiding om te vergelijken.</p>
      <Link to="/schools">Bekijk scholen</Link>
    </div>
  )
}
