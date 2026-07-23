import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { authClient } from '@/lib/auth-client'
import { ConfirmModal } from '@/components/common/confirm-modal'

interface DangerZoneCardProps {
  onDeleteAccount: () => Promise<void>
}

export function DangerZoneCard({ onDeleteAccount }: DangerZoneCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const navigate = useNavigate()

  async function handleLogout() {
    await authClient.signOut()
    navigate({ to: '/login' })
  }

  async function handleDelete() {
    await onDeleteAccount()
    setConfirmOpen(false)
  }

  return (
    <section>
      <h2>Gevarenzone</h2>

      <button type="button" onClick={handleLogout}>
        Uitloggen
      </button>

      <button type="button" onClick={() => setConfirmOpen(true)}>
        Account verwijderen
      </button>

      <ConfirmModal
        open={confirmOpen}
        title="Account verwijderen?"
        description="Dit kan niet ongedaan gemaakt worden. Al je gegevens worden permanent verwijderd."
        confirmLabel="Verwijderen"
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
        destructive
      />
    </section>
  )
}
