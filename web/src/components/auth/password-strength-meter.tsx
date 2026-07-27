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

const barColors = ['bg-[#dc2626]', 'bg-[#dc2626]', 'bg-[#e5b800]', 'bg-[#2fa84f]', 'bg-[#1f7a38]']

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const { score, label } = getStrength(password)

  if (password.length === 0) return null

  return (
    <div role="status" className="mt-1.5 flex items-center gap-2 text-xs text-[#6b7280]">
      <div className="flex h-1.5 flex-1 overflow-hidden rounded-full bg-[#e5e7eb]">
        <div
          className={`h-full rounded-full transition-all ${barColors[score]}`}
          style={{ width: `${(score / 4) * 100}%` }}
        />
      </div>
      <span>{label}</span>
    </div>
  )
}