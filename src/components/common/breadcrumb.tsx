import { Link } from '@tanstack/react-router'

interface BreadcrumbItem {
  label: string
  to?: string
  params?: Record<string, string>
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-white/65">
        {items.map((item, i) => (
          <li key={item.label} className="flex items-center gap-1.5">
            {item.to ? (
              <Link to={item.to} params={item.params} className="hover:text-white/90 transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="text-white/90">{item.label}</span>
            )}
            {i < items.length - 1 && (
              <span aria-hidden="true" className="text-white/30">/</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}