import type { ReactNode } from "react"

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function Card({ children, className = "", onClick }: CardProps) {
  return (
    <section className={`card ${className}`} onClick={onClick}>
      {children}
    </section>
  )
}
