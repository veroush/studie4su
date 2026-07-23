interface AuthLayoutProps {
  quote?: string
  children: React.ReactNode
}

// No Navbar/Footer on auth pages per the component spec.
export function AuthLayout({ quote, children }: AuthLayoutProps) {
  return (
    <div>
      <div>
        {quote && <blockquote>{quote}</blockquote>}
      </div>

      <div>{children}</div>
    </div>
  )
}
