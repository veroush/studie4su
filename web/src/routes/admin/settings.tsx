import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import '@/styles/admin-settings.css'

export const Route = createFileRoute('/admin/settings')({
  component: RouteComponent,
})

interface TeamMember {
  name: string
  role: string
  image: string
  bio: string
}

interface AboutUsHero {
  p1: string
  p2: string
  p3: string
  p4: string
}

interface AboutUs {
  hero: AboutUsHero
  team: TeamMember[]
}

interface Settings {
  language: { available: string[]; default: string }
  platform: { name: string; contactEmail: string; supportEmail: string; tagline: string }
  features: {
    enableFavorites: boolean
    enableComparison: boolean
    enableQuiz: boolean
    enableOpenHouse: boolean
  }
  notifications: { email: boolean; dailySummary: boolean }
  data: { retentionPeriod: string }
  aboutUs: AboutUs
}

interface ToastItem {
  id: number
  type: 'success' | 'error'
  message: string
}

const EMPTY_TEAM_MEMBER: TeamMember = { name: '', role: '', image: '', bio: '' }

const DEFAULT_SETTINGS: Settings = {
  language: { available: ['dutch', 'english'], default: 'dutch' },
  platform: { name: 'Studiekeuzegids Suriname', contactEmail: '', supportEmail: '', tagline: '' },
  features: { enableFavorites: true, enableComparison: true, enableQuiz: true, enableOpenHouse: true },
  notifications: { email: false, dailySummary: false },
  data: { retentionPeriod: '90' },
  aboutUs: {
    hero: {
      p1: "Het kiezen van de juiste school of studierichting kan verwarrend zijn. Informatie is vaak verspreid over verschillende websites, social-mediapagina's of is simpelweg moeilijk te vinden. Als studenten hebben wij zelf ervaren hoe lastig het kan zijn om een duidelijk overzicht te krijgen van de opleidingsmogelijkheden in Suriname.",
      p2: 'Daarom hebben wij Studie4SU ontwikkeld — een platform dat het verkennen van scholen en studierichtingen eenvoudiger maakt. Onze website brengt informatie samen op één plek, waardoor studenten gemakkelijk scholen in Suriname kunnen zoeken, hun opties kunnen bekijken en zelfs een studiekeuzequiz kunnen doen om te ontdekken welke richting het beste bij hen past.',
      p3: 'Wat begon als een schoolproject groeide al snel uit tot een gezamenlijk doel: iets bouwen dat echt nuttig kan zijn voor toekomstige studenten. Door design, ontwikkeling en databasebeheer te combineren, hebben wij samen een platform gecreëerd dat studenten helpt beter geïnformeerde keuzes te maken over hun opleiding.',
      p4: 'Studie4SU is niet zomaar een website — het is onze manier om studenten te helpen de eerste stap richting hun toekomst te zetten.',
    },
    team: [
      {
        name: 'Valentino Amatsaleh',
        role: 'UI Designer • Animator • Frontend Developer',
        image: 'Valentino.svg',
        bio: 'Valentino was verantwoordelijk voor het ontwerpen van de visuele ervaring van de website. Hij ontwikkelde de gebruikersinterface, animaties en interactieve elementen die het platform aantrekkelijk en gebruiksvriendelijk maken. Door te focussen op gebruiksgemak en een modern ontwerp zorgde hij ervoor dat studenten soepel door de website kunnen navigeren en eenvoudig de beschikbare scholen en studierichtingen kunnen ontdekken.',
      },
      {
        name: 'Veroushka Ramjiawan',
        role: 'Backend Developer • Frontend Developer',
        image: 'Veroushka.svg',
        bio: 'Veroushka werkte aan de kernfunctionaliteiten van de website. Door zowel backend- als frontend-onderdelen te ontwikkelen, hielp zij de gebruikersinterface te verbinden met het systeem achter de website. Haar werk zorgt ervoor dat zoekfuncties, quizzes en andere onderdelen soepel werken en de juiste informatie aan gebruikers tonen.',
      },
      {
        name: 'Raksha Doerga',
        role: 'Database Designer • Backend Developer',
        image: 'Raksha.svg',
        bio: 'Raksha ontwierp en structureerde de database die het platform aandrijft. Hij verzamelde en organiseerde informatie over verschillende scholen en studierichtingen, zodat deze efficiënt kan worden doorzocht en weergegeven. Dankzij zijn werk kunnen gebruikers snel en gemakkelijk betrouwbare informatie vinden over onderwijsopties in Suriname.',
      },
      {
        name: 'Amerie Gardt',
        role: 'Project Manager',
        image: 'Amerie.svg',
        bio: 'Amerie speelde een belangrijke rol in het organiseren en begeleiden van de ontwikkeling van het project. Als projectmanager was zij verantwoordelijk voor het plannen van taken, het opstellen van doelen en het ervoor zorgen dat het team gedurende het ontwikkelingsproces op schema bleef. Door de workflow te coördineren en de voortgang te bewaken, zorgde zij ervoor dat elk onderdeel van het project op tijd werd afgerond en dat het team efficiënt naar het eindresultaat toewerkte.',
      },
    ],
  },
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function RouteComponent() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [emailErrors, setEmailErrors] = useState<{ contact?: string; support?: string }>({})
  const [toasts, setToasts] = useState<ToastItem[]>([])

  function showToast(message: string, type: 'success' | 'error' = 'success') {
    const id = Date.now()
    setToasts((t) => [...t, { id, type, message }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000)
  }

  async function loadSettings() {
    try {
      const res = await fetch('/api/admin/settings')
      if (!res.ok) throw new Error('Failed to load')
      const data = await res.json()
      setSettings({
        language: data.language ?? DEFAULT_SETTINGS.language,
        platform: data.platform ?? DEFAULT_SETTINGS.platform,
        features: data.features ?? DEFAULT_SETTINGS.features,
        notifications: data.notifications ?? DEFAULT_SETTINGS.notifications,
        data: data.data ?? DEFAULT_SETTINGS.data,
        aboutUs:
          data.aboutUs && data.aboutUs.hero && data.aboutUs.team
            ? data.aboutUs
            : DEFAULT_SETTINGS.aboutUs,
      })
      setLoadError(false)
    } catch (err) {
      setLoadError(true)
      console.error('[admin/settings] load error:', err)
    }
  }

  useEffect(() => {
    loadSettings()
  }, [])

  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        saveSettings()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings])

  function markDirty() {
    setIsDirty(true)
  }

  function updateField<K extends keyof Settings>(section: K, patch: Partial<Settings[K]>) {
    setSettings((s) => (s ? { ...s, [section]: { ...s[section], ...patch } } : s))
    markDirty()
  }

  function toggleLanguage(lang: 'dutch' | 'english') {
    if (!settings) return
    const has = settings.language.available.includes(lang)
    const available = has
      ? settings.language.available.filter((l) => l !== lang)
      : [...settings.language.available, lang]
    updateField('language', { available })
  }

  function updateHero(field: keyof AboutUsHero, value: string) {
    setSettings((s) =>
      s ? { ...s, aboutUs: { ...s.aboutUs, hero: { ...s.aboutUs.hero, [field]: value } } } : s,
    )
    markDirty()
  }

  function updateTeamMember(idx: number, field: keyof TeamMember, value: string) {
    setSettings((s) => {
      if (!s) return s
      const team = s.aboutUs.team.map((m, i) => (i === idx ? { ...m, [field]: value } : m))
      return { ...s, aboutUs: { ...s.aboutUs, team } }
    })
    markDirty()
  }

  function addTeamMember() {
    setSettings((s) =>
      s ? { ...s, aboutUs: { ...s.aboutUs, team: [...s.aboutUs.team, { ...EMPTY_TEAM_MEMBER }] } } : s,
    )
    markDirty()
  }

  function removeTeamMember(idx: number) {
    if (!confirm('Remove this team member from the About Us page?')) return
    setSettings((s) => {
      if (!s) return s
      const team = s.aboutUs.team.filter((_, i) => i !== idx)
      return { ...s, aboutUs: { ...s.aboutUs, team } }
    })
    markDirty()
  }

  function validateEmail(field: 'contact' | 'support', value: string) {
    const valid = !value.trim() || EMAIL_RE.test(value.trim())
    setEmailErrors((e) => ({ ...e, [field]: valid ? undefined : 'Please enter a valid email address.' }))
    return valid
  }

  function validate(): boolean {
    if (!settings) return false
    const a = validateEmail('contact', settings.platform.contactEmail)
    const b = validateEmail('support', settings.platform.supportEmail)
    if (settings.language.available.length === 0) {
      showToast('At least one language must be enabled.', 'error')
      return false
    }
    return a && b
  }

  async function saveSettings() {
    if (!settings || !validate()) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Save failed')
      setIsDirty(false)
      showToast('Settings saved successfully.', 'success')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save settings', 'error')
      console.error('[admin/settings] save error:', err)
    } finally {
      setSaving(false)
    }
  }

  function resetToDefaults() {
    if (!confirm('Reset all settings to their default values? Any unsaved changes will be lost.')) return
    setSettings(DEFAULT_SETTINGS)
    setEmailErrors({})
    setIsDirty(true)
    showToast('Settings reset to defaults. Click Save to persist.', 'success')
  }

  if (settings === null) {
    return (
      <div className="page-header">
        <div>
          <h2 className="page-heading">System Settings</h2>
          <p className="page-subheading">
            {loadError ? 'Failed to load settings. Is the server running?' : 'Loading...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="settings-container">
        <div className="settings-page-header">
          <h2 className="settings-page-heading">System Settings</h2>
          {isDirty && <span className="settings-unsaved-badge">Unsaved changes</span>}
        </div>

        {/* 1. Language Management */}
        <section className="settings-card" aria-labelledby="lang-heading">
          <h3 className="settings-card-title" id="lang-heading">Language Management</h3>
          <div className="settings-card-body">
            <div className="settings-field-group">
              <span className="settings-field-label">Available Languages</span>
              <div className="settings-checkbox-list" role="group" aria-label="Available languages">
                <label className="settings-lang-check">
                  <input
                    type="checkbox"
                    className="settings-check-input"
                    checked={settings.language.available.includes('dutch')}
                    onChange={() => toggleLanguage('dutch')}
                  />
                  <span className="settings-check-label">Dutch (Nederlands)</span>
                </label>
                <label className="settings-lang-check">
                  <input
                    type="checkbox"
                    className="settings-check-input"
                    checked={settings.language.available.includes('english')}
                    onChange={() => toggleLanguage('english')}
                  />
                  <span className="settings-check-label">English</span>
                </label>
              </div>
            </div>

            <div className="settings-form-field">
              <label className="settings-label" htmlFor="default-lang">Default Language</label>
              <select
                className="settings-select"
                id="default-lang"
                value={settings.language.default}
                onChange={(e) => updateField('language', { default: e.target.value })}
              >
                <option value="dutch">Dutch (Nederlands)</option>
                <option value="english">English</option>
              </select>
            </div>
          </div>
        </section>

        {/* 2. Platform Configuration */}
        <section className="settings-card" aria-labelledby="platform-heading">
          <h3 className="settings-card-title" id="platform-heading">Platform Configuration</h3>
          <div className="settings-card-body">
            <div className="settings-form-field">
              <label className="settings-label" htmlFor="platform-name">Platform Name</label>
              <input
                type="text"
                className="settings-input"
                id="platform-name"
                placeholder="Studiekeuzegids Suriname"
                value={settings.platform.name}
                onChange={(e) => updateField('platform', { name: e.target.value })}
              />
            </div>

            <div className="settings-form-field">
              <label className="settings-label" htmlFor="contact-email">Contact Email</label>
              <input
                type="email"
                className={`settings-input${emailErrors.contact ? ' is-invalid' : ''}`}
                id="contact-email"
                placeholder="contact@studie4su.sr"
                value={settings.platform.contactEmail}
                onChange={(e) => updateField('platform', { contactEmail: e.target.value })}
                onBlur={(e) => validateEmail('contact', e.target.value)}
              />
              {emailErrors.contact && <span className="settings-field-error">{emailErrors.contact}</span>}
            </div>

            <div className="settings-form-field">
              <label className="settings-label" htmlFor="support-email">Support Email</label>
              <input
                type="email"
                className={`settings-input${emailErrors.support ? ' is-invalid' : ''}`}
                id="support-email"
                placeholder="support@studie4su.sr"
                value={settings.platform.supportEmail}
                onChange={(e) => updateField('platform', { supportEmail: e.target.value })}
                onBlur={(e) => validateEmail('support', e.target.value)}
              />
              {emailErrors.support && <span className="settings-field-error">{emailErrors.support}</span>}
            </div>

            <div className="settings-form-field">
              <label className="settings-label" htmlFor="platform-tagline">Platform Tagline</label>
              <textarea
                className="settings-textarea"
                id="platform-tagline"
                rows={2}
                placeholder="Studiekeuze voor Surinaamse studenten"
                value={settings.platform.tagline}
                onChange={(e) => updateField('platform', { tagline: e.target.value })}
              />
            </div>
          </div>
        </section>

        {/* 3. About Us Content */}
        <section className="settings-card" aria-labelledby="aboutus-heading">
          <h3 className="settings-card-title" id="aboutus-heading">About Us Content</h3>
          <div className="settings-card-body">
            <div className="settings-field-group">
              <span className="settings-field-label">Hero Paragraphs</span>
              <p className="settings-field-hint">Shown on the public About page.</p>
              {(['p1', 'p2', 'p3', 'p4'] as const).map((key, i) => (
                <div className="settings-form-field" key={key}>
                  <label className="settings-label" htmlFor={`hero-${key}`}>Paragraph {i + 1}</label>
                  <textarea
                    className="settings-textarea"
                    id={`hero-${key}`}
                    rows={3}
                    value={settings.aboutUs.hero[key]}
                    onChange={(e) => updateHero(key, e.target.value)}
                  />
                </div>
              ))}
            </div>

            <div className="settings-field-group">
              <span className="settings-field-label">Team Members</span>
              <div className="settings-team-list">
                {settings.aboutUs.team.map((member, idx) => (
                  <div className="settings-team-member" key={idx}>
                    <div className="settings-team-member-header">
                      <span className="settings-team-member-title">Team Member {idx + 1}</span>
                      <button
                        type="button"
                        className="settings-team-remove-btn"
                        onClick={() => removeTeamMember(idx)}
                        aria-label={`Remove team member ${idx + 1}`}
                      >
                        Remove
                      </button>
                    </div>
                    <div className="settings-team-grid">
                      <div className="settings-form-field">
                        <label className="settings-label" htmlFor={`team-name-${idx}`}>Name</label>
                        <input
                          type="text"
                          className="settings-input"
                          id={`team-name-${idx}`}
                          value={member.name}
                          onChange={(e) => updateTeamMember(idx, 'name', e.target.value)}
                        />
                      </div>
                      <div className="settings-form-field">
                        <label className="settings-label" htmlFor={`team-role-${idx}`}>Role</label>
                        <input
                          type="text"
                          className="settings-input"
                          id={`team-role-${idx}`}
                          value={member.role}
                          onChange={(e) => updateTeamMember(idx, 'role', e.target.value)}
                        />
                      </div>
                      <div className="settings-form-field settings-form-field-full">
                        <label className="settings-label" htmlFor={`team-image-${idx}`}>Image filename</label>
                        <input
                          type="text"
                          className="settings-input"
                          id={`team-image-${idx}`}
                          placeholder="e.g. Valentino.svg"
                          value={member.image}
                          onChange={(e) => updateTeamMember(idx, 'image', e.target.value)}
                        />
                      </div>
                      <div className="settings-form-field settings-form-field-full">
                        <label className="settings-label" htmlFor={`team-bio-${idx}`}>Bio</label>
                        <textarea
                          className="settings-textarea"
                          id={`team-bio-${idx}`}
                          rows={3}
                          value={member.bio}
                          onChange={(e) => updateTeamMember(idx, 'bio', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="settings-btn-secondary settings-add-member-btn"
                onClick={addTeamMember}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Team Member
              </button>
            </div>
          </div>
        </section>

        {/* 4. User Features */}
        <section className="settings-card" aria-labelledby="features-heading">
          <h3 className="settings-card-title" id="features-heading">User Features</h3>
          <div className="settings-card-body">
            <label className="settings-toggle">
              <input
                type="checkbox"
                className="settings-toggle-input"
                checked={settings.features.enableFavorites}
                onChange={(e) => updateField('features', { enableFavorites: e.target.checked })}
              />
              <div className="settings-toggle-content">
                <div className="settings-toggle-title">Enable School Favorites</div>
                <div className="settings-toggle-desc">Allow users to save and bookmark schools they're interested in</div>
              </div>
            </label>

            <label className="settings-toggle">
              <input
                type="checkbox"
                className="settings-toggle-input"
                checked={settings.features.enableComparison}
                onChange={(e) => updateField('features', { enableComparison: e.target.checked })}
              />
              <div className="settings-toggle-content">
                <div className="settings-toggle-title">Enable Program Comparison</div>
                <div className="settings-toggle-desc">Allow users to compare programs and schools side by side</div>
              </div>
            </label>

            <label className="settings-toggle">
              <input
                type="checkbox"
                className="settings-toggle-input"
                checked={settings.features.enableQuiz}
                onChange={(e) => updateField('features', { enableQuiz: e.target.checked })}
              />
              <div className="settings-toggle-content">
                <div className="settings-toggle-title">Enable Study Quiz</div>
                <div className="settings-toggle-desc">Show the quiz that matches students with study clusters</div>
              </div>
            </label>

            <label className="settings-toggle">
              <input
                type="checkbox"
                className="settings-toggle-input"
                checked={settings.features.enableOpenHouse}
                onChange={(e) => updateField('features', { enableOpenHouse: e.target.checked })}
              />
              <div className="settings-toggle-content">
                <div className="settings-toggle-title">Open House Registrations</div>
                <div className="settings-toggle-desc">Allow users to register and save open house events</div>
              </div>
            </label>
          </div>
        </section>

        {/* 5. Notifications */}
        <section className="settings-card" aria-labelledby="notif-heading">
          <h3 className="settings-card-title" id="notif-heading">Notifications</h3>
          <div className="settings-card-body">
            <label className="settings-toggle">
              <input
                type="checkbox"
                className="settings-toggle-input"
                checked={settings.notifications.email}
                onChange={(e) => updateField('notifications', { email: e.target.checked })}
              />
              <div className="settings-toggle-content">
                <div className="settings-toggle-title">Email Notifications</div>
                <div className="settings-toggle-desc">Send email alerts for new user registrations and quiz completions</div>
              </div>
            </label>

            <label className="settings-toggle">
              <input
                type="checkbox"
                className="settings-toggle-input"
                checked={settings.notifications.dailySummary}
                onChange={(e) => updateField('notifications', { dailySummary: e.target.checked })}
              />
              <div className="settings-toggle-content">
                <div className="settings-toggle-title">Daily Activity Summary</div>
                <div className="settings-toggle-desc">Receive a daily digest of platform activity at 08:00 AM</div>
              </div>
            </label>
          </div>
        </section>

        {/* 6. Data & Privacy */}
        <section className="settings-card" aria-labelledby="privacy-heading">
          <h3 className="settings-card-title" id="privacy-heading">Data &amp; Privacy</h3>
          <div className="settings-card-body">
            <div className="settings-privacy-notice" role="note">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="settings-privacy-icon">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <p className="settings-privacy-text">
                All user data is anonymized and aggregated. No personally identifiable information is stored. Quiz results are saved without user identification.
              </p>
            </div>

            <div className="settings-form-field">
              <label className="settings-label" htmlFor="data-retention">Data Retention Period</label>
              <select
                className="settings-select"
                id="data-retention"
                value={settings.data.retentionPeriod}
                onChange={(e) => updateField('data', { retentionPeriod: e.target.value })}
              >
                <option value="30">30 days</option>
                <option value="60">60 days</option>
                <option value="90">90 days</option>
                <option value="180">180 days</option>
                <option value="365">1 year</option>
                <option value="0">Keep indefinitely</option>
              </select>
              <span className="settings-field-hint">How long quiz result data is kept before automatic deletion.</span>
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="settings-actions">
          <button
            type="button"
            className={`settings-btn-primary${saving ? ' loading' : ''}`}
            onClick={saveSettings}
            disabled={saving}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {saving ? 'Saving…' : 'Save Settings'}
          </button>
          <button type="button" className="settings-btn-secondary" onClick={resetToDefaults}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-4.45" />
            </svg>
            Reset to Defaults
          </button>
        </div>
      </div>

      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span className="toast-icon-wrap">{t.type === 'success' ? '✅' : '❌'}</span>
            <span className="toast-msg">{t.message}</span>
            <button
              type="button"
              className="toast-close-btn"
              onClick={() => setToasts((ts) => ts.filter((x) => x.id !== t.id))}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </>
  )
}