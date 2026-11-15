import { Menu, Bell } from "lucide-react"
import { IconButton } from "../common"
import { useAuth } from "../../context/AuthContext"
import { pageTitles } from "./navConfig"
import type { Page } from "../../types"

interface HeaderProps {
  page: Page
  onOpenMenu: () => void
  onAvatarClick?: () => void
}

export function Header({ page, onOpenMenu, onAvatarClick }: HeaderProps) {
  const { user } = useAuth()
  const title = pageTitles[page] || "Dashboard"
  const initials = user
    ? `${user.firstName[0]?.toUpperCase() || ""}${user.lastName[0]?.toUpperCase() || ""}`
    : "AM"

  return (
    <header>
      <IconButton label="Open menu" className="menu-btn" onClick={onOpenMenu}>
        <Menu size={21} />
      </IconButton>

      <div>
        <span>FITTRACK /</span>
        <b>{title}</b>
      </div>

      <div className="header-actions">
        <IconButton label="Notifications" className="notification">
          <Bell size={19} />
          <i />
        </IconButton>
        <div
          className="avatar"
          onClick={onAvatarClick}
          role="button"
          tabIndex={0}
          style={{ cursor: onAvatarClick ? "pointer" : "default" }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") onAvatarClick?.()
          }}
        >
          {initials}
        </div>
      </div>
    </header>
  )
}
