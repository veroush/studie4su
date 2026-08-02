import { useEffect } from 'react'
import { Link } from '@tanstack/react-router'

interface ToastProps {
  message: string
  visible: boolean
  onDismiss: () => void
  durationMs?: number
  variant?: 'default' | 'favorite'
  linkTo?: string
  linkLabel?: string
}

export function Toast({
  message,
  visible,
  onDismiss,
  durationMs = 3000,
  variant = 'default',
  linkTo,
  linkLabel,
}: ToastProps) {
  useEffect(() => {
    if (!visible) return
    const timer = setTimeout(onDismiss, durationMs)
    return () => clearTimeout(timer)
  }, [visible, durationMs, onDismiss])

  if (variant === 'favorite') {
    return (
      <div
        role="status"
        aria-live="polite"
        className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-2 whitespace-nowrap rounded-xl bg-[#1a1a2e] px-5 py-3 text-[0.9rem] font-medium text-white shadow-[0_8px_24px_rgba(0,0,0,0.25)] transition-all duration-[250ms] max-w-[calc(100vw-3rem)] ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
        }`}
      >
        <span>{message}</span>
        {linkTo && (
          <Link
            to={linkTo}
            className="border-b border-[rgba(74,222,128,0.35)] font-semibold text-[#4ade80] no-underline transition-colors duration-150 hover:border-[#4ade80]"
          >
            {linkLabel ?? 'Bekijk favorieten →'}
          </Link>
        )}
      </div>
    )
  }

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