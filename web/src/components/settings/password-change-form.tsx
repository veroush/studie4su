import { useState } from 'react'
import { PasswordVisibilityToggle } from '@/components/auth/password-visibility-toggle'
import { PasswordStrengthMeter } from '@/components/auth/password-strength-meter'

interface PasswordChangeFormProps {
  onSubmit: (data: { currentPassword: string; newPassword: string }) => void
  pending?: boolean
}

export function PasswordChangeForm({ onSubmit, pending = false }: PasswordChangeFormProps) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [visible, setVisible] = useState(false)

  const mismatch = confirmPassword.length > 0 && newPassword !== confirmPassword

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (mismatch) return
    onSubmit({ currentPassword, newPassword })
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        <span>Huidig wachtwoord</span>
        <input
          type={visible ? 'text' : 'password'}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
      </label>

      <label>
        <span>Nieuw wachtwoord</span>
        <input
          type={visible ? 'text' : 'password'}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoComplete="new-password"
          required
        />
      </label>
      <PasswordStrengthMeter password={newPassword} />

      <label>
        <span>Bevestig nieuw wachtwoord</span>
        <input
          type={visible ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          required
        />
      </label>
      {mismatch && <p role="alert">Wachtwoorden komen niet overeen.</p>}

      <PasswordVisibilityToggle visible={visible} onToggle={() => setVisible(!visible)} />

      <button type="submit" disabled={pending}>
        Wachtwoord wijzigen
      </button>
    </form>
  )
}
