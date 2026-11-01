import type { ReactNode } from "react"
import { TrendingDown } from "lucide-react"
import { Card } from "./Card"

interface KpiCardProps {
  icon: ReactNode
  label: string
  value: string
  unit?: string
  trend: string
  trendIcon?: ReactNode
  className?: string
}

export function KpiCard({
  icon,
  label,
  value,
  unit,
  trend,
  trendIcon,
  className = "",
}: KpiCardProps) {
  return (
    <Card className={`kpi ${className}`}>
      <div className="kpi-top">
        <span className="kpi-icon">{icon}</span>
        <span className="trend">
          {trendIcon ?? <TrendingDown size={13} />}
          {trend}
        </span>
      </div>
      <p>{label}</p>
      <h3>
        {value} {unit ? <small>{unit}</small> : null}
      </h3>
    </Card>
  )
}
