interface ConfirmModalProps {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  destructive?: boolean
}

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = 'Bevestigen',
  cancelLabel = 'Annuleren',
  onConfirm,
  onCancel,
  destructive = false,
}: ConfirmModalProps) {
  if (!open) return null

  return (
    <div role="alertdialog" aria-modal="true" aria-labelledby="confirm-modal-title">
      <div>
        <h2 id="confirm-modal-title">{title}</h2>
        {description && <p>{description}</p>}

        <div>
          <button type="button" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" onClick={onConfirm} data-destructive={destructive}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
