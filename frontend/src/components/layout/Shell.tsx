import { useState, type ReactNode } from "react"
import { Sidebar } from "./Sidebar"
import { Header } from "./Header"
import { MobileNav } from "./MobileNav"
import type { Page } from "../../types"

interface ShellProps {
  page: Page
  setPage: (p: Page) => void
  children: ReactNode
}

export function Shell({ page, setPage, children }: ShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleCloseMenu = () => setMobileMenuOpen(false)
  const handleOpenMenu = () => setMobileMenuOpen(true)

  return (
    <div className="app-shell">
      <Sidebar
        page={page}
        setPage={setPage}
        open={mobileMenuOpen}
        onClose={handleCloseMenu}
      />

      {mobileMenuOpen && (
        <button
          type="button"
          className="scrim"
          aria-label="Close navigation"
          onClick={handleCloseMenu}
        />
      )}

      <div className="main-area">
        <Header
          page={page}
          onOpenMenu={handleOpenMenu}
          onAvatarClick={() => setPage("profile")}
        />
        <main className="main-content">{children}</main>
        <MobileNav page={page} setPage={setPage} onOpenMenu={handleOpenMenu} />
      </div>
    </div>
  )
}
