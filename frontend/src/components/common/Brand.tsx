import { Activity } from "lucide-react"

interface BrandProps {
  compact?: boolean
  className?: string
}

export function Brand({ compact = false, className = "" }: BrandProps) {
  return (
    <div className={`brand ${className}`}>
      <div className="brand-mark">
        <Activity size={21} strokeWidth={2.8} />
      </div>
      {!compact && (
        <span>
          FIT<span>TRACK</span>
        </span>
      )}
    </div>
  )
}
