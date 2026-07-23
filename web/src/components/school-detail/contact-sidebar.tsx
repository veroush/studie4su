import { Mail, Phone, MapPin, Globe } from 'lucide-react'
import { SocialLinksList } from './social-links-list'

interface ContactSidebarProps {
  address?: string | null
  phone?: string | null
  email?: string | null
  website?: string | null
  socialLinks?: { platform: string; url: string }[]
}

export function ContactSidebar({ address, phone, email, website, socialLinks = [] }: ContactSidebarProps) {
  return (
    <aside aria-label="Contactgegevens">
      <h2>Contact</h2>

      <ul>
        {address && (
          <li>
            <MapPin aria-hidden="true" />
            <span>{address}</span>
          </li>
        )}
        {phone && (
          <li>
            <Phone aria-hidden="true" />
            <a href={`tel:${phone}`}>{phone}</a>
          </li>
        )}
        {email && (
          <li>
            <Mail aria-hidden="true" />
            <a href={`mailto:${email}`}>{email}</a>
          </li>
        )}
        {website && (
          <li>
            <Globe aria-hidden="true" />
            <a href={website} target="_blank" rel="noreferrer">
              {website}
            </a>
          </li>
        )}
      </ul>

      {socialLinks.length > 0 && <SocialLinksList links={socialLinks} />}
    </aside>
  )
}
