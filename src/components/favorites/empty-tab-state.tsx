import { Link } from '@tanstack/react-router'
import { Heart, BookOpen, Calendar } from 'lucide-react'
import { EmptyState } from '@/components/common/empty-state'
import { useLanguage } from '@/lib/i18n/language-context'

type Tab = 'schools' | 'programs' | 'openhouses'

interface EmptyTabStateProps {
  tab: Tab
}

const ICONS: Record<Tab, React.ReactNode> = {
  schools: <Heart size={56} strokeWidth={1.5} />,
  programs: <BookOpen size={56} strokeWidth={1.5} />,
  openhouses: <Calendar size={56} strokeWidth={1.5} />,
}

const KEY_PREFIX: Record<Tab, string> = {
  schools: 'emptySchools',
  programs: 'emptyPrograms',
  openhouses: 'emptyOpenHouses',
}

export function EmptyTabState({ tab }: EmptyTabStateProps) {
  const { t } = useLanguage()
  const prefix = KEY_PREFIX[tab]

  return (
    <EmptyState
      variant="light"
      icon={ICONS[tab]}
      title={t(`favorites.${prefix}Title`)}
      description={t(`favorites.${prefix}Description`)}
      action={
        <Link
          to={tab === 'openhouses' ? '/open-houses' : '/schools'}
          className="mt-1 inline-flex items-center gap-2 rounded-lg bg-[#16a34a] px-7 py-3 text-sm font-semibold text-white no-underline transition-colors hover:bg-[#15803d]"
        >
          {t(`favorites.${prefix}Cta`)}
        </Link>
      }
    />
  )
}