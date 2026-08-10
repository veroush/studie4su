import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useLanguage } from '@/lib/i18n/language-context'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { LoadingState } from '@/components/common/loading-state'
import { EmptyState } from '@/components/common/empty-state'
import { AuthGate } from '@/components/quiz/auth-gate'
import { RecommendationCard } from '@/components/quiz/recommendation-card'
import { ProgressBar } from '@/components/quiz/progress-bar'
import { QuestionCard } from '@/components/quiz/question-card'
import { QuizNavRow } from '@/components/quiz/quiz-nav-row'
import { RetakeButton } from '@/components/quiz/retake-button'

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
  const { lang, t } = useLanguage()

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
        body: JSON.stringify({ answers, lang }),
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
      <div className="bg-gradient-to-br from-[#d3f5e0] via-white to-[#fdf1bf] min-h-screen">
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
    return pageShell(null)
  }

  if (isError || !questions || questions.length === 0) {
    return pageShell(
      <EmptyState
        title={t('quiz.couldNotLoad')}
        description={t('quiz.checkServer')}
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
            {t('quiz.completedBadge')}
          </span>
          <AnimatedQuizHeader
            title={t('quiz.resultsTitle')}
            subtitle={t('quiz.resultsSubtitle')}
            stickmanSide="right"
            frameSrc={resultsAnimator.src}
          />
        </header>

        {recommendMutation.isPending && (
          <LoadingState message={t('quiz.loadingResults')} />
        )}

        {submitError && (
          <EmptyState
            title={t('quiz.couldNotLoadResults')}
            description={t('quiz.retryQuiz')}
          />
        )}

        {!submitError && !recommendMutation.isPending && results && results.length === 0 && (
          <EmptyState
            title={t('quiz.noResultsTitle')}
            description={t('quiz.noResultsDesc')}
          />
        )}

        {!submitError && results && results.length > 0 && (
          <div className="flex flex-col gap-6">
            {results.map((rec, i) => (
              <RecommendationCard key={rec.id} rank={i + 1} result={rec} />
            ))}
          </div>
        )}

        <RetakeButton onRetake={retake} />
      </AuthGate>,
    )
  }

  return pageShell(
    <>
      <AnimatedQuizHeader
        title={t('quiz.title')}
        subtitle={t('quiz.subtitle')}
        stickmanSide={getQuizAnimationStep(step).position}
        frameSrc={quizAnimator.src}
      />

      <ProgressBar current={step + 1} total={total} />

      <QuestionCard
        question={lang === 'en' && q.textEn ? q.textEn : q.text}
        options={q.options}
        lang={lang}
        multiple={isMultiple}
        selectedAnswer={currentAnswer}
        onToggle={toggleOption}
      />

      <QuizNavRow
        onPrev={handlePrev}
        onNext={handleNext}
        canGoPrev={step > 0}
        canGoNext={isAnswered && !recommendMutation.isPending}
        isLast={step === total - 1}
        isPending={recommendMutation.isPending}
      />
    </>,
  )
}