import { Link } from '@tanstack/react-router'
import { useLanguage } from '@/lib/i18n/language-context'

export function QuizBanner() {
  const { t } = useLanguage()
  return (
    <section>
      <div>
        <h2>{t('quizBanner.heading')}</h2>
        <p>{t('quizBanner.desc')}</p>
      </div>
      <Link to="/quiz">{t('quizBanner.cta')}</Link>
    </section>
  )
}
