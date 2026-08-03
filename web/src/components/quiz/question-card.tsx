import { OptionButton } from './option-button'

interface QuizOption {
  id: string
  text: string
  textEn: string | null
}

interface QuestionCardProps {
  question: string
  options: QuizOption[]
  multiple: boolean
  selectedAnswer: string | string[] | undefined
  onToggle: (optionText: string) => void
}

export function QuestionCard({ question, options, multiple, selectedAnswer, onToggle }: QuestionCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-xl px-6 py-6 md:px-8 md:py-7 mb-4">
      <h2 className="text-xl md:text-2xl font-semibold text-[#111827] mb-1.5 leading-snug">
        {question}
      </h2>
      <p className="text-sm text-[#6b7280] mb-4">
        {multiple ? 'Selecteer alle die van toepassing zijn' : 'Selecteer één optie'}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {options.map((option) => {
          const selected = multiple
            ? Array.isArray(selectedAnswer) && selectedAnswer.includes(option.text)
            : selectedAnswer === option.text
          return (
            <OptionButton
              key={option.id}
              label={option.text}
              selected={selected}
              onClick={() => onToggle(option.text)}
            />
          )
        })}
      </div>
    </div>
  )
}