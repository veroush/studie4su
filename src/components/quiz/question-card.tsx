import { OptionButton } from './option-button'
import { useLanguage } from '@/lib/i18n/language-context'
import type { Language } from '@/lib/i18n/language-context'

interface QuizOption {
  id: string
  text: string
  textEn: string | null
}

interface QuestionCardProps {
  question: string
  options: QuizOption[]
  lang: Language
  multiple: boolean
  selectedAnswer: string | string[] | undefined
  onToggle: (optionText: string) => void
}

export function QuestionCard({ question, options, lang, multiple, selectedAnswer, onToggle }: QuestionCardProps) {
  const { t } = useLanguage()

  return (
    <div className="bg-white rounded-2xl shadow-xl px-6 py-6 md:px-8 md:py-7 mb-4">
      <h2 className="text-xl md:text-2xl font-semibold text-[#111827] mb-1.5 leading-snug">
        {question}
      </h2>
      <p className="text-sm text-[#6b7280] mb-4">
        {multiple ? t('quiz.selectMultiple') : t('quiz.selectOne')}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {options.map((option) => {
          // Answers are stored/matched by the Dutch text (option.text) regardless of
          // display language, so selection state and onToggle always use option.text —
          // only the displayed label switches to textEn when available.
          const selected = multiple
            ? Array.isArray(selectedAnswer) && selectedAnswer.includes(option.text)
            : selectedAnswer === option.text
          const label = lang === 'en' && option.textEn ? option.textEn : option.text
          return (
            <OptionButton
              key={option.id}
              label={label}
              selected={selected}
              onClick={() => onToggle(option.text)}
            />
          )
        })}
      </div>
    </div>
  )
}