import { useLanguage } from '@/lib/i18n/language-context'

interface RetakeButtonProps {
  onRetake: () => void
}

export function RetakeButton({ onRetake }: RetakeButtonProps) {
  const { t } = useLanguage()
  return (
    <div className="text-center mt-10">
      <button
        type="button"
        onClick={onRetake}
        className="rounded-lg border-2 border-[#16a34a] bg-white px-6 py-2.5 text-base font-semibold text-[#15803d] transition-colors hover:bg-[#f0fdf4]"
      >
        {t('quiz.retake')}
      </button>
    </div>
  )
}