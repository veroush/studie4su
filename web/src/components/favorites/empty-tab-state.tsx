import { Link } from '@tanstack/react-router'
import { EmptyState } from '@/components/common/empty-state'

interface EmptyTabStateProps {
  tab: 'schools' | 'programs' | 'openhouses'
}

const COPY: Record<EmptyTabStateProps['tab'], { title: string; description: string; to: string; label: string }> = {
  schools: {
    title: 'Nog geen favoriete scholen',
    description: 'Sla scholen op om ze hier snel terug te vinden.',
    to: '/schools',
    label: 'Bekijk scholen',
  },
  programs: {
    title: 'Nog geen favoriete opleidingen',
    description: 'Sla opleidingen op om ze hier snel terug te vinden.',
    to: '/schools',
    label: 'Bekijk opleidingen',
  },
  openhouses: {
    title: 'Nog geen favoriete open dagen',
    description: 'Sla open dagen op om ze hier snel terug te vinden.',
    to: '/open-houses',
    label: 'Bekijk open dagen',
  },
}

export function EmptyTabState({ tab }: EmptyTabStateProps) {
  const copy = COPY[tab]

  return (
    <EmptyState
      title={copy.title}
      description={copy.description}
      action={<Link to={copy.to}>{copy.label}</Link>}
    />
  )
}
