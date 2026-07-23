import { Facebook, Instagram, Twitter, Youtube, Link as LinkIcon } from 'lucide-react'

interface SocialLink {
  platform: string
  url: string
}

interface SocialLinksListProps {
  links: SocialLink[]
}

const ICONS: Record<string, React.ComponentType<{ 'aria-hidden'?: boolean }>> = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  youtube: Youtube,
}

export function SocialLinksList({ links }: SocialLinksListProps) {
  return (
    <ul aria-label="Sociale media">
      {links.map((link) => {
        const Icon = ICONS[link.platform.toLowerCase()] ?? LinkIcon
        return (
          <li key={link.platform}>
            <a href={link.url} target="_blank" rel="noreferrer" aria-label={link.platform}>
              <Icon aria-hidden />
            </a>
          </li>
        )
      })}
    </ul>
  )
}
