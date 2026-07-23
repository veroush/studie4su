import { ConfirmModal } from '@/components/common/confirm-modal'

interface LeaveConfirmModalProps {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
}

// Preset copy over the generic ConfirmModal — shown when navigating
// away would lose the current comparison selection.
export function LeaveConfirmModal({ open, onConfirm, onCancel }: LeaveConfirmModalProps) {
  return (
    <ConfirmModal
      open={open}
      title="Vergelijking verlaten?"
      description="Je geselecteerde opleidingen worden niet bewaard."
      confirmLabel="Verlaten"
      cancelLabel="Blijven"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  )
}
