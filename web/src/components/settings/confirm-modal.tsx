interface ConfirmModalProps {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  destructive?: boolean
  confirmDisabled?: boolean
  children?: React.ReactNode
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
  confirmDisabled = false,
  children,
}: ConfirmModalProps) {
  if (!open) return null

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      className="fixed inset-0 z-[600] flex items-center justify-center bg-black/70 backdrop-blur-sm p-6"
    >
      <div className="bg-[var(--card-bg)] border border-white/10 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 id="confirm-modal-title" className="font-display text-xl font-bold text-white mb-2.5">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-[var(--text-muted)] mb-5 leading-relaxed">{description}</p>
        )}

        {children && <div className="mb-5 text-left">{children}</div>}

        <div className="flex flex-col gap-3 sm:flex-row-reverse">
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirmDisabled}
            data-destructive={destructive}
            className={
              destructive
                ? 'flex-1 py-2.5 rounded-lg bg-red-600/15 border border-red-600/40 hover:bg-red-600/25 hover:border-[#fc8181] text-[#fc8181] text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
                : 'flex-1 py-2.5 rounded-lg bg-[var(--gold)] hover:opacity-90 text-[var(--bg-dark)] text-sm font-semibold transition-opacity disabled:opacity-40 disabled:cursor-not-allowed'
            }
          >
            {confirmLabel}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-lg border border-white/20 text-white/75 text-sm font-medium hover:border-white/50 hover:text-white transition-colors"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  )
}