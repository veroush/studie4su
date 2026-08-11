import { Globe, ExternalLink } from "lucide-react"
import { useLanguage } from "@/lib/i18n/language-context"

interface ContactSidebarProps {
  website: string | null
}

export function ContactSidebar({ website }: ContactSidebarProps) {
  const { t } = useLanguage()
  if (!website) return null

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h3 className="font-display text-[1.15rem] font-semibold text-[#111827] mb-4 flex items-center gap-2">
        <Globe size={20} className="text-[#15803d]" />
        {t('schoolDetail.contactDetails')}
      </h3>
      <div>
        <div className="text-xs text-[#6b7280] mb-1">{t('schoolDetail.website')}</div>
        <a
          href={website.startsWith("http") ? website : `https://${website}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[#15803d] hover:text-[#166534] text-sm transition-colors"
        >
          <Globe size={16} />
          {website}
          <ExternalLink size={12} />
        </a>
      </div>
    </div>
  )
}