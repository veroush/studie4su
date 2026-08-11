import { useLanguage } from '@/lib/i18n/language-context'

export function LanguageToggle() {
  const { lang, setLang, t } = useLanguage()

  const options: { id: 'nl' | 'en'; label: string }[] = [
    { id: 'nl', label: t('settingsPage.languageDutch') },
    { id: 'en', label: t('settingsPage.languageEnglish') },
  ]

  return (
    <div
      role="radiogroup"
      aria-label={t('settingsPage.languageLabel')}
      className="inline-flex rounded-[10px] border border-white/[0.12] bg-white/[0.06] p-1"
    >
      {options.map((option) => {
        const isSelected = lang === option.id
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => setLang(option.id)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              isSelected
                ? 'bg-[var(--gold)] text-[var(--bg-dark)]'
                : 'text-white/70 hover:text-white'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
