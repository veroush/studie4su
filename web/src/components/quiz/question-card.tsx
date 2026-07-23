import { OptionButton } from './option-button'

interface QuizOption {
  id: string
  label: string
}

interface QuestionCardProps {
  question: string
  options: QuizOption[]
  multiple?: boolean
  selectedIds: string[]
  onSelect: (id: string) => void
}

export function QuestionCard({ question, options, multiple = false, selectedIds, onSelect }: QuestionCardProps) {
  return (
    <div role="group" aria-label={question}>
      <h2>{question}</h2>

      <div>
        {options.map((option) => (
          <OptionButton
            key={option.id}
            label={option.label}
            selected={selectedIds.includes(option.id)}
            multiple={multiple}
            onClick={() => onSelect(option.id)}
          />
        ))}
      </div>
    </div>
  )
}
