import type { ReactNode } from "react"

interface TagProps {
  children: ReactNode
  muted?: boolean
  className?: string
}

export function Tag({ children, muted = false, className = "" }: TagProps) {
  return (
    <span className={`tag ${muted ? "muted" : ""} ${className}`}>
      {children}
    </span>
  )
}
