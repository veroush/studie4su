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
      title="Vergelijking wissen?"
      description="Wil je de vergelijking wissen zodat je opnieuw kunt beginnen?"
      confirmLabel="Ja, wis vergelijking"
      cancelLabel="Nee, bewaar"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  )
}
