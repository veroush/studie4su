import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { LogOut, Trash2 } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { ConfirmModal } from '@/components/settings/confirm-modal'
import { Card, CardBlock, CardDivider } from '@/components/settings/settings-card'
import { useLanguage } from '@/lib/i18n/language-context'

export function DangerZoneCard() {
  const { t } = useLanguage()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleLogout() {
    await authClient.signOut()
    navigate({ to: '/login' })
  }

  function openModal() {
    setPassword('')
    setError('')
    setConfirmOpen(true)
  }

  async function handleDelete() {
    setDeleting(true)
    setError('')
    const { error: deleteError } = await authClient.deleteUser({ password })
    setDeleting(false)
    if (deleteError) {
      setError(deleteError.message ?? t('settingsPage.deletePasswordError'))
      return
    }
    navigate({ to: '/' })
  }

  return (
    <Card variant="danger">
      <CardBlock>
        <label className="block text-sm font-semibold text-white mb-1">
          {t('settingsPage.logoutLabel')}
        </label>
        <p className="text-[0.82rem] text-[var(--text-muted)] mb-4">
          {t('settingsPage.logoutDescription')}
        </p>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-[10px] border border-red-600/40 px-5 py-2.5 text-sm font-semibold text-[#fc8181] transition-colors hover:bg-red-600/10 hover:border-[#fc8181]"
        >
          <LogOut size={16} /> {t('settingsPage.logoutLabel')}
        </button>
      </CardBlock>

      <CardDivider />

      <CardBlock>
        <label className="block text-sm font-semibold text-[#fc8181] mb-1">
          {t('settingsPage.deleteAccountLabel')}
        </label>
        <p className="text-[0.82rem] text-[var(--text-muted)] mb-4">
          {t('settingsPage.deleteAccountDescription')}
        </p>
        <button
          type="button"
          onClick={openModal}
          className="flex items-center gap-2 rounded-[10px] bg-red-600/15 border border-red-600/40 px-5 py-2.5 text-sm font-semibold text-[#fc8181] transition-colors hover:bg-red-600/25 hover:border-[#fc8181]"
        >
          <Trash2 size={16} /> {t('settingsPage.deleteAccountLabel')}
        </button>
      </CardBlock>

      <ConfirmModal
        open={confirmOpen}
        title={t('settingsPage.deleteConfirmTitle')}
        description={t('settingsPage.deleteConfirmDescription')}
        confirmLabel={deleting ? t('settingsPage.deleteConfirmPending') : t('settingsPage.deleteConfirmButton')}
        cancelLabel={t('settingsPage.cancel')}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
        destructive
        confirmDisabled={password.length === 0 || deleting}
      >
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-white">{t('settingsPage.passwordFieldLabel')}</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="w-full rounded-[10px] border border-white/[0.12] bg-white/[0.06] px-3.5 py-2.5 text-sm text-white outline-none focus:border-[rgba(232,184,75,0.6)] focus:shadow-[0_0_0_3px_rgba(232,184,75,0.12)]"
          />
        </label>
        {error && <p className="mt-2 text-sm font-medium text-[#fc8181]">{error}</p>}
      </ConfirmModal>
    </Card>
  )
}
