import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { authClient } from '@/lib/auth-client'

interface ProfileDropdownProps {
  user: {
    name: string
    email: string
    image?: string | null
  }
}

export function ProfileDropdown({ user }: ProfileDropdownProps) {
  const [open, setOpen] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const navigate = useNavigate()

  async function handleLogout() {
    await authClient.signOut()
    navigate({ to: '/login' })
  }

  return (
    <div>
      <button type="button" onClick={() => setOpen(!open)} aria-label="Open profile menu">
        {user.image ? (
          <img src={user.image} alt={user.name} />
        ) : (
          <span>{user.name.charAt(0).toUpperCase()}</span>
        )}
      </button>

      {open && (
        <div role="menu">
          <div>
            <p>{user.name}</p>
            <p>{user.email}</p>
          </div>

          <label>
            <span>Notificaties</span>
            <input
              type="checkbox"
              checked={notificationsEnabled}
              onChange={(e) => setNotificationsEnabled(e.target.checked)}
            />
          </label>

          <Link to="/settings" onClick={() => setOpen(false)}>
            Instellingen
          </Link>

          <button type="button" onClick={handleLogout}>
            Uitloggen
          </button>
        </div>
      )}
    </div>
  )
}
