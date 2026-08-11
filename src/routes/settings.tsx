import { useState } from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { User, Bell, Lock } from 'lucide-react'
import { getSession } from '@/lib/get-session'
import { authClient } from '@/lib/auth-client'
import { AVATARS } from '@/lib/avatars'
import { AvatarPicker } from '@/components/settings/avatar-picker'
import { SettingsSection, Card, CardBlock, CardDivider } from '@/components/settings/settings-card'
import { SettingsSidenav } from '@/components/settings/settings-sidenav'
import { LanguageToggle } from '@/components/settings/language-toggle'
import { ToggleList } from '@/components/settings/toggle-switch'
import { PasswordChangeForm } from '@/components/settings/password-change-form'
import { DangerZoneCard } from '@/components/settings/danger-zone-card'
import { Toast } from '@/components/common/toast'
import { Navbar } from '@/components/layout/navbar'
import { useLanguage } from '@/lib/i18n/language-context'

export const Route = createFileRoute('/settings')({
  beforeLoad: async () => {
    const session = await getSession()
    if (!session?.user) {
      throw redirect({ to: '/login', search: { redirect: '/settings' } })
    }
    return { user: session.user }
  },
  component: Settings,
})

function Settings() {
  const { user } = Route.useRouteContext()
  const { t } = useLanguage()

  const SECTIONS = [
    { id: 'profile', label: t('settingsPage.sectionProfile'), icon: User },
    { id: 'notifications', label: t('settingsPage.sectionNotifications'), icon: Bell },
    { id: 'account', label: t('settingsPage.sectionAccount'), icon: Lock },
  ]

  const [avatar, setAvatar] = useState(user.avatar ?? 'graduate')
  const [image, setImage] = useState<string | null>(user.image ?? null)
  const [name, setName] = useState(user.name ?? '')
  const [notifs, setNotifs] = useState({
    emailAnnouncements: user.emailAnnouncements ?? false,
    emailResources: user.emailResources ?? false,
    emailImportant: user.emailImportant ?? true,
    platformUpdates: user.platformUpdates ?? false,
    platformAlerts: user.platformAlerts ?? true,
  })
  const [pwPending, setPwPending] = useState(false)
  const [pwFeedback, setPwFeedback] = useState<{ text: string; ok: boolean } | null>(null)

  const [toast, setToast] = useState({ message: '', visible: false })
  function showToast(message: string) {
    setToast({ message, visible: true })
  }

  async function handleAvatarSelect(id: string) {
    setAvatar(id)
    setImage(null)
    await authClient.updateUser({ avatar: id, image: null })
    showToast(t('settingsPage.photoSaved'))
  }

  async function handleImageUpload(dataUrl: string) {
    setImage(dataUrl)
    await authClient.updateUser({ image: dataUrl })
    showToast(t('settingsPage.photoSaved'))
  }

  async function handleImageRemove() {
    setImage(null)
    await authClient.updateUser({ image: null })
    showToast(t('settingsPage.photoRemoved'))
  }

  async function handleNameSave() {
    if (!name.trim()) return
    await authClient.updateUser({ name: name.trim() })
    showToast(t('settingsPage.nameSaved'))
  }

  async function handleNotifChange(id: string, checked: boolean) {
    setNotifs((prev) => ({ ...prev, [id]: checked }))
    await authClient.updateUser({ [id]: checked })
    showToast(checked ? t('settingsPage.notificationEnabled') : t('settingsPage.notificationDisabled'))
  }

  async function handlePasswordSubmit(data: { currentPassword: string; newPassword: string }) {
    setPwPending(true)
    setPwFeedback(null)
    const { error } = await authClient.changePassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    })
    setPwPending(false)
    if (error) {
      setPwFeedback({ text: error.message ?? t('settingsPage.passwordGenericError'), ok: false })
      return
    }
    setPwFeedback({ text: t('settingsPage.passwordUpdated'), ok: true })
  }

  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-128px)] px-6 py-12">
      <div className="mx-auto max-w-[1100px]">
        <div className="mb-10">
          <div className="mb-2 flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
            <a href="/" className="hover:text-[var(--gold)] transition-colors">
              Home
            </a>
            <span>›</span>
            <span>{t('settingsPage.breadcrumb')}</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-white mb-1.5">{t('settingsPage.title')}</h1>
          <p className="text-[var(--text-muted)]">{t('settingsPage.subtitle')}</p>
        </div>

        <div className="grid grid-cols-[200px_1fr] gap-8 items-start max-md:grid-cols-1">
          <SettingsSidenav sections={SECTIONS} activeId="profile" />

          <div className="flex flex-col gap-12">
            <SettingsSection
              id="profile"
              title={t('settingsPage.sectionProfile')}
              description={t('settingsPage.profileDescription')}
            >
              <Card>
                <CardBlock>
                  <label className="block text-sm font-semibold text-white mb-1">
                    {t('settingsPage.photoLabel')}
                  </label>
                  <p className="text-[0.82rem] text-[var(--text-muted)] mb-0">
                    {t('settingsPage.photoDescription')}
                  </p>
                  <AvatarPicker
                    options={AVATARS}
                    selected={avatar}
                    onSelect={handleAvatarSelect}
                    image={image}
                    onImageUpload={handleImageUpload}
                    onImageRemove={handleImageRemove}
                  />
                </CardBlock>
                <CardDivider />
                <CardBlock>
                  <label className="block text-sm font-semibold text-white mb-1" htmlFor="display-name">
                    {t('settingsPage.nameLabel')}
                  </label>
                  <p className="text-[0.82rem] text-[var(--text-muted)] mb-4">
                    {t('settingsPage.nameDescription')}
                  </p>
                  <div className="flex gap-2.5 max-sm:flex-col">
                    <input
                      id="display-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t('settingsPage.namePlaceholder')}
                      className="flex-1 rounded-[10px] border border-white/[0.12] bg-white/[0.06] px-3.5 py-2.5 text-sm text-white outline-none focus:border-[rgba(232,184,75,0.6)] focus:shadow-[0_0_0_3px_rgba(232,184,75,0.12)]"
                    />
                    <button
                      type="button"
                      onClick={handleNameSave}
                      className="rounded-[10px] bg-[var(--gold)] px-5 py-2.5 text-sm font-semibold text-[var(--bg-dark)] transition-opacity hover:opacity-90 active:scale-[0.97] whitespace-nowrap max-sm:w-full"
                    >
                      {t('settingsPage.save')}
                    </button>
                  </div>
                </CardBlock>
                <CardDivider />
                <CardBlock>
                  <label className="block text-sm font-semibold text-white mb-1">
                    {t('settingsPage.languageLabel')}
                  </label>
                  <p className="text-[0.82rem] text-[var(--text-muted)] mb-4">
                    {t('settingsPage.languageDescription')}
                  </p>
                  <LanguageToggle />
                </CardBlock>
              </Card>
            </SettingsSection>

            <SettingsSection
              id="notifications"
              title={t('settingsPage.sectionNotifications')}
              description={t('settingsPage.notificationsDescription')}
            >
              <Card>
                <CardBlock>
                  <label className="block text-sm font-semibold text-white mb-3">
                    {t('settingsPage.emailNotificationsLabel')}
                  </label>
                  <ToggleList
                    onChange={handleNotifChange}
                    items={[
                      {
                        id: 'emailAnnouncements',
                        label: t('settingsPage.announcements'),
                        description: t('settingsPage.announcementsDesc'),
                        checked: notifs.emailAnnouncements,
                      },
                      {
                        id: 'emailResources',
                        label: t('settingsPage.newMaterials'),
                        description: t('settingsPage.newMaterialsDesc'),
                        checked: notifs.emailResources,
                      },
                      {
                        id: 'emailImportant',
                        label: t('settingsPage.importantUpdates'),
                        description: t('settingsPage.importantUpdatesDesc'),
                        checked: notifs.emailImportant,
                      },
                    ]}
                  />
                </CardBlock>
                <CardDivider />
                <CardBlock>
                  <label className="block text-sm font-semibold text-white mb-3">
                    {t('settingsPage.platformNotificationsLabel')}
                  </label>
                  <ToggleList
                    onChange={handleNotifChange}
                    items={[
                      {
                        id: 'platformUpdates',
                        label: t('settingsPage.updates'),
                        description: t('settingsPage.updatesDesc'),
                        checked: notifs.platformUpdates,
                      },
                      {
                        id: 'platformAlerts',
                        label: t('settingsPage.alerts'),
                        description: t('settingsPage.alertsDesc'),
                        checked: notifs.platformAlerts,
                      },
                    ]}
                  />
                </CardBlock>
              </Card>
            </SettingsSection>

            <SettingsSection
              id="account"
              title={t('settingsPage.sectionAccount')}
              description={t('settingsPage.accountDescription')}
            >
              <Card>
                <CardBlock>
                  <label className="block text-sm font-semibold text-white mb-1">
                    {t('settingsPage.changePasswordLabel')}
                  </label>
                  <div className="mt-4">
                    <PasswordChangeForm onSubmit={handlePasswordSubmit} pending={pwPending} />
                  </div>
                  {pwFeedback && (
                    <p
                      className={`mt-2 text-[0.82rem] font-medium ${
                        pwFeedback.ok ? 'text-emerald-400' : 'text-[#fc8181]'
                      }`}
                    >
                      {pwFeedback.text}
                    </p>
                  )}
                </CardBlock>
              </Card>

              <div className="h-4" />

              <DangerZoneCard />
            </SettingsSection>
          </div>
        </div>
      </div>

      <Toast
        message={toast.message}
        visible={toast.visible}
        onDismiss={() => setToast((prev) => ({ ...prev, visible: false }))}
      />
      </main>
    </>
  )
}
