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
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      className="fixed inset-0 z-[600] flex items-center justify-center bg-black/60 backdrop-blur-sm p-5"
    >
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
        <h2 id="confirm-modal-title" className="font-display text-xl font-bold text-gray-900 mb-2.5">
          {title}
        </h2>
        {description && <p className="text-sm text-gray-600 mb-6 leading-relaxed">{description}</p>}

        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onConfirm}
            data-destructive={destructive}
            className={
              destructive
                ? 'py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors'
                : 'py-3 rounded-lg bg-gradient-to-r from-[#2d7a4f] to-[#1e5c3a] hover:opacity-90 text-white text-sm font-semibold transition-opacity'
            }
          >
            {confirmLabel}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="py-2.5 rounded-lg border-2 border-gray-200 text-gray-600 text-sm font-medium hover:border-[#15803d]/40 hover:text-[#15803d] transition-colors"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  )
}