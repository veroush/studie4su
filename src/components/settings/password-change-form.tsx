import { useState, type FormEvent } from 'react'
import { PasswordVisibilityToggle } from '@/components/settings/password-visibility-toggle'
import { PasswordStrengthMeter } from '@/components/settings/password-strength-meter'
import { useLanguage } from '@/lib/i18n/language-context'

interface PasswordChangeFormProps {
  onSubmit: (data: { currentPassword: string; newPassword: string }) => void
  pending?: boolean
}

const inputClass =
  'w-full rounded-[10px] border border-white/[0.12] bg-white/[0.06] px-3.5 py-2.5 text-sm text-white ' +
  'placeholder:text-white/30 outline-none transition-[border-color,box-shadow] ' +
  'focus:border-[rgba(232,184,75,0.6)] focus:shadow-[0_0_0_3px_rgba(232,184,75,0.12)]'

export function PasswordChangeForm({ onSubmit, pending = false }: PasswordChangeFormProps) {
  const { t } = useLanguage()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [visible, setVisible] = useState(false)

  const mismatch = confirmPassword.length > 0 && newPassword !== confirmPassword

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (mismatch) return
    onSubmit({ currentPassword, newPassword })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-white">{t('settingsPage.currentPassword')}</span>
        <div className="relative">
          <input
            type={visible ? 'text' : 'password'}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            required
            className={`${inputClass} pr-10`}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            <PasswordVisibilityToggle visible={visible} onToggle={() => setVisible(!visible)} />
          </span>
        </div>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-white">{t('settingsPage.newPassword')}</span>
        <input
          type={visible ? 'text' : 'password'}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoComplete="new-password"
          required
          className={inputClass}
        />
      </label>
      <PasswordStrengthMeter password={newPassword} />

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-white">{t('settingsPage.confirmPassword')}</span>
        <input
          type={visible ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          required
          className={inputClass}
        />
      </label>
      {mismatch && (
        <p role="alert" className="text-sm font-medium text-[#fc8181]">
          {t('settingsPage.passwordMismatch')}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-1.5 rounded-[10px] bg-[var(--gold)] px-5 py-2.5 text-sm font-semibold text-[var(--bg-dark)] transition-opacity hover:opacity-90 active:scale-[0.97] disabled:opacity-50"
      >
        {pending ? t('settingsPage.passwordPending') : t('settingsPage.passwordSubmit')}
      </button>
    </form>
  )
}
