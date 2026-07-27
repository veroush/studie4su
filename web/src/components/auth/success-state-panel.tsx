interface SuccessStatePanelProps {
  title: string
  description?: string
  action?: React.ReactNode
}

export function SuccessStatePanel({ title, description, action }: SuccessStatePanelProps) {
  return (
    <div role="status" className="flex flex-col items-center gap-2 py-6 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-[#effcf3] text-[#2fa84f]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-7 w-7"
          aria-hidden="true"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </div>
      <h2 className="font-display text-xl text-[#111827]">{title}</h2>
      {description && <p className="text-[#6b7280]">{description}</p>}
      {action}
    </div>
  )
}