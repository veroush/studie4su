import { useEffect } from 'react'

interface ToastProps {
  message: string
  visible: boolean
  onDismiss: () => void
  durationMs?: number
}

export function Toast({ message, visible, onDismiss, durationMs = 3000 }: ToastProps) {
  useEffect(() => {
    if (!visible) return
    const timer = setTimeout(onDismiss, durationMs)
    return () => clearTimeout(timer)
  }, [visible, durationMs, onDismiss])

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-7 left-1/2 z-[10000] -translate-x-1/2 rounded-full border border-[rgba(232,184,75,0.3)] bg-[#1a4a32] px-6 py-3 text-sm font-medium text-white shadow-[0_8px_24px_rgba(0,0,0,0.3)] whitespace-nowrap transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5 pointer-events-none'
      }`}
    >
      {message}
    </div>
  )
}