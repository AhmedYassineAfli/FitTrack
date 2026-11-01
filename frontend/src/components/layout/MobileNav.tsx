import { Menu } from "lucide-react"
import { navItems } from "./navConfig"
import type { Page } from "../../types"

interface MobileNavProps {
  page: Page
  setPage: (p: Page) => void
  onOpenMenu: () => void
}

export function MobileNav({ page, setPage, onOpenMenu }: MobileNavProps) {
  const active =
    page === "create-workout"
      ? "workouts"
      : page === "program-details"
        ? "programs"
        : page

  return (
    <nav className="mobile-nav">
      {navItems.slice(0, 4).map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          className={active === id ? "active" : ""}
          onClick={() => setPage(id)}
        >
          <Icon size={19} />
          <span>{label.split(" ")[0]}</span>
        </button>
      ))}
      <button type="button" onClick={onOpenMenu}>
        <Menu size={19} />
        <span>More</span>
      </button>
    </nav>
  )
}
