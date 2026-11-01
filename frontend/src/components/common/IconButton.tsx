import type { ReactNode } from "react"

interface IconButtonProps {
  children: ReactNode
  label: string
  onClick?: () => void
  className?: string
  type?: "button" | "submit" | "reset"
  disabled?: boolean
}

export function IconButton({
  children,
  label,
  onClick,
  className = "",
  type = "button",
  disabled = false,
}: IconButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`icon-btn ${className}`}
      aria-label={label}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
