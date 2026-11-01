interface LineChartProps {
  compact?: boolean
  className?: string
}

export function LineChart({ compact = false, className = "" }: LineChartProps) {
  const points = [
    ["0", "45"],
    ["140", "76"],
    ["290", "96"],
    ["430", "118"],
    ["600", "139"],
  ]

  return (
    <div className={`line-chart ${compact ? "compact" : ""} ${className}`}>
      <div className="chart-y">
        <span>80</span>
        <span>76</span>
        <span>72</span>
        <span>68</span>
      </div>
      <svg
        viewBox="0 0 600 190"
        preserveAspectRatio="none"
        aria-label="Weight trend chart"
      >
        <defs>
          <linearGradient id="area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#87FF00" stopOpacity="0.22" />
            <stop offset="1" stopColor="#87FF00" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g className="gridlines">
          <path d="M0 20H600M0 70H600M0 120H600M0 170H600" />
        </g>
        <path
          className="area"
          d="M0 45 C70 55 70 80 140 76 S230 108 290 96 S365 135 430 118 S520 150 600 139 L600 190 L0 190Z"
        />
        <path
          className="chart-line"
          d="M0 45 C70 55 70 80 140 76 S230 108 290 96 S365 135 430 118 S520 150 600 139"
        />
        {points.map(([x, y]) => (
          <circle key={x} cx={x} cy={y} r="5" />
        ))}
      </svg>
      <div className="chart-x">
        <span>Jan</span>
        <span>Feb</span>
        <span>Mar</span>
        <span>Apr</span>
        <span>May</span>
        <span>Jun</span>
      </div>
    </div>
  )
}
