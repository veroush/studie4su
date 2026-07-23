import { Eye, EyeOff } from 'lucide-react'

interface PasswordVisibilityToggleProps {
  visible: boolean
  onToggle: () => void
}

export function PasswordVisibilityToggle({ visible, onToggle }: PasswordVisibilityToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={visible ? 'Verberg wachtwoord' : 'Toon wachtwoord'}
      aria-pressed={visible}
    >
      {visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
    </button>
  )
}
