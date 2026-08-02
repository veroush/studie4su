import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { LoadingState } from '@/components/common/loading-state'
import { EmptyState } from '@/components/common/empty-state'
import { AuthGate } from '@/components/quiz/auth-gate'
import { RecommendationCard } from '@/components/quiz/recommendation-card'

import { AnimatedQuizHeader } from '@/components/quiz/animated-quiz-header'
import {
  HEADER_ANIMATIONS,
  getQuizAnimationStep,
  preloadAnimationFrames,
  useLoopingFrameAnimator,
} from '@/hooks/use-header-stickman'
import { useEffect } from 'react'

export const Route = createFileRoute('/quiz/')({ component: QuizPage })

interface QuizOption {
  id: string
  text: string
  textEn: string | null
}

interface QuizQuestionApi {
  id: string
  text: string
  textEn: string | null
  type: string
  orderIndex: number
  questionKey: string
  options: QuizOption[]
}

interface RecommendationResult {
  id: string
  title: string
  school: string
  schoolId: string
  description: string
  requiredLevel: string
  duration: string
  tuitionCost: string
  cluster: string
  match: number
  reasons: string[]
}

interface RecommendResponse {
  success: boolean
  scores: Record<string, number>
  topCluster: string
  results: RecommendationResult[]
}

function QuizPage() {
  const {
    data: questions,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['quiz-questions'],
    queryFn: async (): Promise<QuizQuestionApi[]> => {
      const res = await fetch('/api/quiz/questions')
      if (!res.ok) throw new Error('Failed to fetch quiz questions')
      return res.json()
    },
  })

  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [showResults, setShowResults] = useState(false)
  const [results, setResults] = useState<RecommendationResult[] | null>(null)
  const [submitError, setSubmitError] = useState(false)

  const quizAnimator = useLoopingFrameAnimator(8)
  const resultsAnimator = useLoopingFrameAnimator(8)

  useEffect(() => {
    preloadAnimationFrames()
  }, [])

  useEffect(() => {
    if (showResults) return
    const animStep = getQuizAnimationStep(step)
    quizAnimator.play(HEADER_ANIMATIONS[animStep.key])
  }, [step, showResults])

  useEffect(() => {
    if (showResults) resultsAnimator.play(HEADER_ANIMATIONS.celebrating)
  }, [showResults])

  const recommendMutation = useMutation({
    mutationFn: async (): Promise<RecommendResponse> => {
      const res = await fetch('/api/quiz/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, lang: 'nl' }),
      })
      if (!res.ok) throw new Error('Failed to get recommendations')
      return res.json()
    },
    onSuccess: (data) => {
      setResults(data.results)
      setShowResults(true)
      // fire-and-forget, matches v1 behavior — result already shown either way
      fetch('/api/quiz/submit-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers,
          topProgramId: data.results[0]?.id ?? '',
          scores: data.scores,
        }),
      }).catch(() => {})
    },
    onError: () => setSubmitError(true),
  })

  const pageShell = (content: React.ReactNode) => (
    <div>
      <Navbar />
      <div className="bg-gradient-to-br from-[#f9fafb] via-white to-[#fefce8]/30 min-h-screen">
        <main
          className={`mx-auto px-4 sm:px-6 pt-12 pb-24 ${
            showResults ? 'max-w-[72rem]' : 'max-w-[68rem]'
          }`}
        >
          {content}
        </main>
      </div>
      <Footer />
    </div>
  )

  if (isLoading) {
    return pageShell(<LoadingState message="Quizvragen laden..." />)
  }

  if (isError || !questions || questions.length === 0) {
    return pageShell(
      <EmptyState
        title="Kon de quiz niet laden"
        description="Controleer of je server actief is."
      />,
    )
  }

  const q = questions[step]
  const currentAnswer = answers[q.questionKey]
  const isMultiple = q.type === 'multiple'

  const isAnswered = isMultiple
    ? Array.isArray(currentAnswer) && currentAnswer.length > 0
    : typeof currentAnswer === 'string' && currentAnswer !== ''

  const total = questions.length
  const pct = Math.round(((step + 1) / total) * 100)

  function toggleOption(optionText: string) {
    setAnswers((prev) => {
      if (isMultiple) {
        const current = (prev[q.questionKey] as string[] | undefined) ?? []
        const next = current.includes(optionText)
          ? current.filter((o) => o !== optionText)
          : [...current, optionText]
        return { ...prev, [q.questionKey]: next }
      }
      return { ...prev, [q.questionKey]: optionText }
    })
  }

  function handleNext() {
    if (!isAnswered) return
    if (step < total - 1) {
      setStep((s) => s + 1)
    } else {
      setSubmitError(false)
      recommendMutation.mutate()
    }
  }

  function handlePrev() {
    if (step > 0) setStep((s) => s - 1)
  }

  function retake() {
    setStep(0)
    setAnswers({})
    setShowResults(false)
    setResults(null)
    setSubmitError(false)
  }

  if (showResults) {
    return pageShell(
      <AuthGate resumeTo="/quiz">
        <header className="text-center mb-12">
          <span className="inline-flex items-center gap-2 bg-[#dcfce7] text-[#166534] text-sm font-medium rounded-full px-4 py-2 mb-6">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#15803d"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            Quiz voltooid!
          </span>
          <AnimatedQuizHeader
            title="Jouw Gepersonaliseerde Aanbevelingen"
            subtitle="Op basis van jouw opleidingsniveau, certificaten en voorkeuren"
            stickmanSide="right"
            frameSrc={resultsAnimator.src}
          />
        </header>

        {recommendMutation.isPending && (
          <LoadingState message="Aanbevelingen worden geladen..." />
        )}

        {submitError && (
          <EmptyState
            title="Kon aanbevelingen niet laden"
            description="Probeer de quiz opnieuw."
          />
        )}

        {!submitError && !recommendMutation.isPending && results && results.length === 0 && (
          <EmptyState
            title="Geen programma's gevonden"
            description="Probeer de quiz opnieuw met andere antwoorden."
          />
        )}

        {!submitError && results && results.length > 0 && (
          <div className="flex flex-col gap-6">
            {results.map((rec, i) => (
              <RecommendationCard key={rec.id} rank={i + 1} result={rec} />
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <button
            type="button"
            onClick={retake}
            className="rounded-lg border-2 border-[#16a34a] bg-white px-6 py-2.5 text-base font-semibold text-[#15803d] transition-colors hover:bg-[#f0fdf4]"
          >
            Quiz Opnieuw Doen
          </button>
        </div>
      </AuthGate>,
    )
  }

  return pageShell(
    <>
      <AnimatedQuizHeader
        title="Studiekeuzequiz"
        subtitle="Beantwoord deze vragen om jouw ideale studie te vinden"
        stickmanSide={getQuizAnimationStep(step).position}
        frameSrc={quizAnimator.src}
      />

      <div className="mb-5">
        <div className="flex justify-between text-sm text-[#4b5563] mb-2">
          <span>
            Vraag {step + 1} van {total}
          </span>
          <span>{pct}%</span>
        </div>
        <div className="h-3 bg-[#e5e7eb] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#16a34a] to-[#15803d] rounded-full transition-[width] duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl px-6 py-6 md:px-8 md:py-7 mb-4">
        <h2 className="text-xl md:text-2xl font-semibold text-[#111827] mb-1.5 leading-snug">
          {q.text}
        </h2>
        <p className="text-sm text-[#6b7280] mb-4">
          {isMultiple ? 'Selecteer alle die van toepassing zijn' : 'Selecteer één optie'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {q.options.map((option) => {
            const selected = isMultiple
              ? Array.isArray(currentAnswer) && currentAnswer.includes(option.text)
              : currentAnswer === option.text
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => toggleOption(option.text)}
                aria-pressed={selected}
                className={`w-full text-left flex items-center gap-2.5 rounded-xl border-2 px-3.5 py-2.5 transition-colors ${
                  selected
                    ? 'border-[#16a34a] bg-[#f0fdf4]'
                    : 'border-[#e5e7eb] bg-white hover:border-[#86efac] hover:bg-[#f9fafb]'
                }`}
              >
                <span
                  className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selected ? 'border-[#16a34a] bg-[#16a34a]' : 'border-[#d1d5db]'
                  }`}
                >
                  {selected && (
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </span>
                <span className="text-sm text-[#111827]">{option.text}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex justify-between gap-4 mt-3">
        <button
          type="button"
          onClick={handlePrev}
          disabled={step === 0}
          className="flex items-center gap-2 rounded-lg border-2 border-[#d1d5db] bg-white px-5 py-2.5 text-sm font-medium text-[#374151] transition-colors disabled:opacity-50 disabled:cursor-not-allowed enabled:hover:bg-[#f9fafb]"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Vorige
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={!isAnswered || recommendMutation.isPending}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#16a34a] to-[#15803d] px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed enabled:hover:from-[#15803d] enabled:hover:to-[#166534]"
        >
          {step === total - 1
            ? recommendMutation.isPending
              ? 'Bezig...'
              : 'Bekijk Resultaten'
            : 'Volgende'}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </>,
  )
}