interface AuthLayoutProps {
  quote?: {
    text: string
    book: string
    author: string
  }
  children: React.ReactNode
}

// No Navbar/Footer on auth pages per the component spec.
export function AuthLayout({ quote, children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#effaf2] via-white to-[#f5fff7]">
      <div className="mx-auto flex max-w-[1100px] items-center justify-center gap-12 px-5 py-10 lg:justify-between">
        {quote && (
          <section className="hidden lg:block flex-1 max-w-[460px]">
            <p className="font-display text-[clamp(1.5rem,4vw,2.2rem)] italic mb-4 text-[#111827]">
              {quote.text}
            </p>
            <p className="my-1 text-[#4b5563]">{quote.book}</p>
            <p className="my-1 text-[#4b5563]">{quote.author}</p>
          </section>
        )}

        <div className="w-full max-w-[430px]">{children}</div>
      </div>
    </div>
  )
}