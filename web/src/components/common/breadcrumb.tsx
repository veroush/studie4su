import { Link } from '@tanstack/react-router'

interface BreadcrumbItem {
  label: string
  to?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb">
      <ol>
        {items.map((item, i) => (
          <li key={item.label}>
            {item.to ? <Link to={item.to}>{item.label}</Link> : <span>{item.label}</span>}
            {i < items.length - 1 && <span aria-hidden="true"> / </span>}
          </li>
        ))}
      </ol>
    </nav>
  )
}
