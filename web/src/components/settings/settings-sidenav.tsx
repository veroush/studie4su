interface SettingsSection {
  id: string
  label: string
}

interface SettingsSidenavProps {
  sections: SettingsSection[]
  activeId: string
}

// TODO: wire up scroll-spy (IntersectionObserver) once sections are
// laid out on the page — currently just highlights `activeId`.
export function SettingsSidenav({ sections, activeId }: SettingsSidenavProps) {
  return (
    <nav aria-label="Instellingen navigatie">
      <ul>
        {sections.map((section) => (
          <li key={section.id}>
            <a href={`#${section.id}`} aria-current={section.id === activeId ? 'true' : undefined}>
              {section.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
