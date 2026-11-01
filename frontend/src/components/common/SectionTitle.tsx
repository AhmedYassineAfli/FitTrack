import type { ReactNode } from "react"

interface SectionTitleProps {
  title: string
  detail?: string
  action?: ReactNode
  className?: string
}

export function SectionTitle({
  title,
  detail,
  action,
  className = "",
}: SectionTitleProps) {
  return (
    <div className={`section-title ${className}`}>
      <div>
        <h2>{title}</h2>
        {detail && <p>{detail}</p>}
      </div>
      {action}
    </div>
  )
}
