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
      className="text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors"
    >
      {visible ? (
        <EyeOff className="h-[18px] w-[18px]" aria-hidden="true" />
      ) : (
        <Eye className="h-[18px] w-[18px]" aria-hidden="true" />
      )}
    </button>
  )
}