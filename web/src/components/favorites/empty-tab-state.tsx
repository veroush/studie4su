import { Link } from '@tanstack/react-router'
import { EmptyState } from '@/components/common/empty-state'

type Tab = 'schools' | 'programs' | 'openhouses'

interface EmptyTabStateProps {
  tab: Tab
}

interface TabCopy {
  title: string
  description: string
  to: string
  label: string
  icon: string
}

const COPY: Record<Tab, TabCopy> = {
  schools: {
    title: 'Nog geen favoriete scholen',
    description: 'Sla scholen op om ze hier snel terug te vinden.',
    to: '/schools',
    label: 'Bekijk scholen',
    icon: '❤️',
  },
  programs: {
    title: 'Nog geen favoriete opleidingen',
    description: 'Sla opleidingen op om ze hier snel terug te vinden.',
    to: '/schools',
    label: 'Bekijk opleidingen',
    icon: '📚',
  },
  openhouses: {
    title: 'Nog geen favoriete open dagen',
    description: 'Sla open dagen op om ze hier snel terug te vinden.',
    to: '/open-houses',
    label: 'Bekijk open dagen',
    icon: '📅',
  },
}

export function EmptyTabState({ tab }: EmptyTabStateProps) {
  const copy = COPY[tab]

  return (
    <EmptyState
      variant="light"
      icon={copy.icon}
      title={copy.title}
      description={copy.description}
      action={
        <Link
          to={copy.to}
          className="mt-1 inline-flex items-center gap-2 rounded-lg bg-[#16a34a] px-7 py-3 text-sm font-semibold text-white no-underline transition-colors hover:bg-[#15803d]"
        >
          {copy.label}
        </Link>
      }
    />
  )
}