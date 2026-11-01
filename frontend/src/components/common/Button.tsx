import type { ReactNode } from "react"

interface ButtonProps {
  children: ReactNode
  secondary?: boolean
  icon?: ReactNode
  onClick?: () => void
  className?: string
  type?: "button" | "submit" | "reset"
  disabled?: boolean
}

export function Button({
  children,
  secondary = false,
  icon,
  onClick,
  className = "",
  type = "button",
  disabled = false,
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`btn ${secondary ? "btn-secondary" : ""} ${className}`}
      onClick={onClick}
    >
      {icon}
      {children}
    </button>
  )
}
