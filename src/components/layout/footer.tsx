import { Link } from '@tanstack/react-router'
import { useLanguage } from '@/lib/i18n/language-context'

export function Footer() {
  const { t } = useLanguage()
  return (
    <footer className="bg-[#0d2b1f] text-white/55 text-center py-7 px-6 text-sm border-t border-[#e8b84b]/15">
      <p>
        © {new Date().getFullYear()}{' '}
        <Link to="/" className="text-[#e8b84b] hover:underline">Studie4SU</Link>
        {' '}— {t('footer.tagline')} •{' '}
        <Link to="/about" className="text-[#e8b84b] hover:underline">{t('footer.about')}</Link>
      </p>
    </footer>
  )
}
