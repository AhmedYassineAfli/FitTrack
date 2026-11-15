import { X, Settings, LogOut, ChevronRight } from "lucide-react"
import { Brand, IconButton } from "../common"
import { useAuth } from "../../context/AuthContext"
import { navItems } from "./navConfig"
import type { Page } from "../../types"

interface SidebarProps {
  page: Page
  setPage: (p: Page) => void
  open: boolean
  onClose: () => void
}

export function Sidebar({ page, setPage, open, onClose }: SidebarProps) {
  const { user, logout } = useAuth()
  const active =
    page === "create-workout"
      ? "workouts"
      : page === "program-details"
        ? "programs"
        : page

  const handleNavClick = (id: Page) => {
    setPage(id)
    onClose()
  }

  return (
    <aside className={open ? "open" : ""}>
      <div className="sidebar-head">
        <Brand />
        <IconButton label="Close menu" onClick={onClose}>
          <X size={20} />
        </IconButton>
      </div>

      <nav>
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className={active === id ? "active" : ""}
            onClick={() => handleNavClick(id)}
          >
            <Icon size={19} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <button
          type="button"
          className={page === "settings" ? "active" : ""}
          onClick={() => handleNavClick("settings")}
        >
          <Settings size={19} />
          Settings
        </button>
        <button
          type="button"
          onClick={async () => {
            await logout()
            setPage("login")
            onClose()
          }}
        >
          <LogOut size={19} />
          Logout
        </button>
        <div
          className="mini-profile cursor-pointer"
          onClick={() => handleNavClick("profile")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") handleNavClick("profile")
          }}
        >
          <div className="avatar">
            {user
              ? `${user.firstName[0]?.toUpperCase() || ""}${user.lastName[0]?.toUpperCase() || ""}`
              : "AM"}
          </div>
          <div>
            <b>{user?.fullName || "Alex Morgan"}</b>
            <span>FitTrack Athlete</span>
          </div>
          <ChevronRight size={16} />
        </div>
      </div>
    </aside>
  )
}
