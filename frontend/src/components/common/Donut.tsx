interface DonutProps {
  totalCount?: number
  totalLabel?: string
  className?: string
}

export function Donut({
  totalCount = 24,
  totalLabel = "workouts",
  className = "",
}: DonutProps) {
  return (
    <div className={`donut-wrap ${className}`}>
      <div className="donut">
        <div>
          <b>{totalCount}</b>
          <span>{totalLabel}</span>
        </div>
      </div>
      <div className="legend">
        <span>
          <i />
          Strength <b>54%</b>
        </span>
        <span>
          <i />
          Conditioning <b>27%</b>
        </span>
        <span>
          <i />
          Mobility <b>19%</b>
        </span>
      </div>
    </div>
  )
}
