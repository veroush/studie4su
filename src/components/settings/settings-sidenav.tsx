import { useEffect, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/language-context'

interface SettingsSection {
  id: string
  label: string
  icon?: LucideIcon
}

interface SettingsSidenavProps {
  sections: SettingsSection[]
  activeId: string
}

export function SettingsSidenav({ sections, activeId }: SettingsSidenavProps) {
  const { t } = useLanguage()
  const [currentId, setCurrentId] = useState(activeId)

  useEffect(() => {
    const targets = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null)

    if (targets.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setCurrentId(entry.target.id)
          }
        })
      },
      { rootMargin: '-30% 0px -60% 0px' },
    )

    targets.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [sections])

  return (
    <nav
      aria-label={t('settingsPage.navLabel')}
      className="sticky top-22 flex flex-col gap-0.5 bg-white/[0.03] border border-white/[0.07] rounded-2xl p-2 max-md:static max-md:flex-row max-md:overflow-x-auto max-md:gap-1"
    >
      <ul className="contents">
        {sections.map((section) => {
          const isActive = section.id === currentId
          const Icon = section.icon
          return (
            <li key={section.id} className="contents">
              
                <a href={`#${section.id}`}
                aria-current={isActive ? 'true' : undefined}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-[10px] text-sm font-medium whitespace-nowrap shrink-0 transition-all ${
                  isActive
                    ? 'text-[var(--gold)] bg-[rgba(232,184,75,0.15)]'
                    : 'text-[var(--text-muted)] hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                {Icon && <Icon size={16} className="flex-shrink-0" />}
                {section.label}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}