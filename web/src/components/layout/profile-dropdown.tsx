import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { authClient } from '@/lib/auth-client'
import { AVATARS } from '@/lib/avatars'
import { useLanguage } from '@/lib/i18n/language-context'

interface ProfileDropdownProps {
  user: {
    name: string
    email: string
    avatar?: string | null
    platformAlerts?: boolean
  }
}

export function ProfileDropdown({ user }: ProfileDropdownProps) {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const [alertsEnabled, setAlertsEnabled] = useState(user.platformAlerts ?? true)
  const navigate = useNavigate()
  const wrapRef = useRef<HTMLDivElement>(null)

  const avatarObj = AVATARS.find((a) => a.id === user.avatar) ?? AVATARS[0]

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  async function handleLogout() {
    await authClient.signOut()
    navigate({ to: '/login' })
  }

  async function handleAlertsToggle(checked: boolean) {
    setAlertsEnabled(checked)
    await authClient.updateUser({ platformAlerts: checked })
  }

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Open profile menu"
        className="flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.08] py-[5px] pl-[5px] pr-3.5 text-sm font-medium text-white transition-colors hover:border-[rgba(232,184,75,0.4)] hover:bg-white/[0.12]"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full border-[1.5px] border-[var(--gold)] bg-[rgba(232,184,75,0.2)] text-sm leading-none">
          {avatarObj.emoji}
        </span>
        <span>{user.name}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+10px)] z-[9999] w-[280px] overflow-hidden rounded-[18px] border border-white/10 bg-[#162e20] text-left shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
        >
          <div className="flex flex-col items-center bg-white/[0.03] px-5 pb-5 pt-6 text-center">
            <div className="mb-2.5 flex h-[60px] w-[60px] items-center justify-center rounded-full border-2 border-[var(--gold)] bg-[rgba(232,184,75,0.15)] text-[1.8rem]">
              {avatarObj.emoji}
            </div>
            <div className="font-display mb-0.5 text-base font-bold text-white">{user.name}</div>
            <div className="break-all text-xs text-[var(--text-muted)]">{user.email}</div>
          </div>

          <hr className="border-t border-white/[0.07]" />

          <div className="p-2">
            <div className="flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2.5">
              <span className="w-5 flex-shrink-0 text-center text-base">🔔</span>
              <span className="flex-1 text-sm text-white/85">{t('profileMenu.notifications')}</span>
              <label className="relative inline-block h-6 w-11 flex-shrink-0">
                <input
                  type="checkbox"
                  checked={alertsEnabled}
                  onChange={(e) => handleAlertsToggle(e.target.checked)}
                  className="peer h-0 w-0 opacity-0"
                />
                <span className="absolute inset-0 rounded-full bg-white/15 transition-colors before:absolute before:left-[3px] before:top-[3px] before:h-[18px] before:w-[18px] before:rounded-full before:bg-white before:shadow-[0_1px_4px_rgba(0,0,0,0.3)] before:transition-transform peer-checked:bg-[var(--gold)] peer-checked:before:translate-x-5" />
              </label>
            </div>

            <Link
              to="/favorites"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-sm text-white/85 no-underline transition-colors hover:bg-white/[0.06]"
            >
              <span className="w-5 flex-shrink-0 text-center text-base">❤️</span>
              <span className="flex-1">{t('profileMenu.favorites')}</span>
              <span className="text-[1.1rem] text-[var(--text-muted)]">›</span>
            </Link>
            
            <Link
              to="/settings"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-sm text-white/85 no-underline transition-colors hover:bg-white/[0.06]"
            >
              <span className="w-5 flex-shrink-0 text-center text-base">⚙️</span>
              <span className="flex-1">{t('profileMenu.settings')}</span>
              <span className="text-[1.1rem] text-[var(--text-muted)]">›</span>
            </Link>
          </div>

          <hr className="border-t border-white/[0.07]" />

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 px-5 py-3.5 text-sm font-medium text-[#fc8181] transition-colors hover:bg-[rgba(220,38,38,0.08)]"
          >
            <span>🚪</span> <span>{t('profileMenu.logout')}</span>
          </button>
        </div>
      )}
    </div>
  )
}