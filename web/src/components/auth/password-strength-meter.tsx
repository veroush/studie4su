interface PasswordStrengthMeterProps {
  password: string
}

function getStrength(password: string): { score: number; label: string } {
  if (password.length === 0) return { score: 0, label: '' }

  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  const labels = ['Zwak', 'Zwak', 'Redelijk', 'Sterk', 'Zeer sterk']
  return { score, label: labels[score] }
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const { score, label } = getStrength(password)

  if (password.length === 0) return null

  return (
    <div role="status">
      <meter min={0} max={4} value={score} />
      <span>{label}</span>
    </div>
  )
}
