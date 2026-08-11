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

const barColors = ['bg-red-500', 'bg-red-500', 'bg-[var(--gold)]', 'bg-emerald-500', 'bg-emerald-400']

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const { score, label } = getStrength(password)

  if (password.length === 0) return null

  return (
    <div role="status" className="mt-1.5 flex items-center gap-2 text-xs text-[var(--text-muted)]">
      <div className="flex h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full transition-all ${barColors[score]}`}
          style={{ width: `${(score / 4) * 100}%` }}
        />
      </div>
      <span>{label}</span>
    </div>
  )
}