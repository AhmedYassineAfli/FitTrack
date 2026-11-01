interface BarsProps {
  large?: boolean
  className?: string
}

const dayLabels = ["M", "T", "W", "T", "F", "S", "S"]
const standardValues = [62, 82, 45, 92, 76, 38, 68]
const largeValues = [48, 70, 56, 88, 64, 95, 78, 62, 90, 72, 98, 84]

export function Bars({ large = false, className = "" }: BarsProps) {
  const values = large ? largeValues : standardValues

  return (
    <div className={`bars ${className}`}>
      {values.map((v, i) => (
        <div className="bar-col" key={i}>
          <i style={{ height: `${v}%` }} />
          <span>{large ? `${i + 1}` : dayLabels[i]}</span>
        </div>
      ))}
    </div>
  )
}
