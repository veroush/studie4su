import { Link } from '@tanstack/react-router'
import { School as SchoolIcon, GraduationCap } from 'lucide-react'
import { FavoriteButton } from '@/components/common/favorite-button'
import { useLanguage } from '@/lib/i18n/language-context'

interface FavCardProps {
  variant: 'school' | 'program'
  item: {
    id: string
    name: string
    subtitle?: string | null
    badge?: string | null
  }
  onRemoved?: () => void
}

export function FavCard({ variant, item, onRemoved }: FavCardProps) {
  const { t } = useLanguage()
  const isSchool = variant === 'school'
  const Icon = isSchool ? SchoolIcon : GraduationCap
  const linkProps = isSchool
    ? { to: '/schools/$schoolId' as const, params: { schoolId: item.id } }
    : { to: '/programs/$programId' as const, params: { programId: item.id } }

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)]">
      <div
        className={`relative flex h-24 items-center px-5 ${
          isSchool
            ? 'bg-gradient-to-br from-[#16a34a] to-[#15803d]'
            : 'bg-gradient-to-br from-[#1d4ed8] to-[#1e40af]'
        }`}
      >
        <Icon size={34} className="text-white/85" />
        <FavoriteButton
          type={variant}
          itemId={item.id}
          initialFavorited
          onToggle={(favorited) => {
            if (!favorited) onRemoved?.()
          }}
        />
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        {item.badge && (
          <span className="w-fit rounded-full bg-[#dcfce7] px-2.5 py-1 text-xs font-semibold text-[#166534]">
            {item.badge}
          </span>
        )}
        <Link {...linkProps} className="no-underline">
          <h3 className="font-display text-base font-bold leading-snug text-[#111827]">{item.name}</h3>
        </Link>
        {item.subtitle && (
          <p className="text-sm text-[#6b7280]">{item.subtitle}</p>
        )}
        <Link
          {...linkProps}
          className="mt-auto rounded-lg bg-[#16a34a] py-2.5 text-center text-sm font-semibold text-white no-underline transition-colors hover:bg-[#15803d]"
        >
          {t('favorites.view')}
        </Link>
      </div>
    </div>
  )
}