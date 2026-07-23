import { Link } from '@tanstack/react-router'
import { EmptyState } from '@/components/common/empty-state'

export function NoProgramsEmptyState() {
  return (
    <EmptyState
      title="Nog geen opleidingen geselecteerd"
      description="Kies opleidingen om ze naast elkaar te vergelijken."
      action={<Link to="/schools">Bekijk scholen</Link>}
    />
  )
}
