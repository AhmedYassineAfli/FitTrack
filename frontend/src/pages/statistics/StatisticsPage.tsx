import { useState } from "react"
import { TrendingUp, Weight, CalendarDays, Trophy } from "lucide-react"
import {
  Card,
  SectionTitle,
  Tag,
  Progress,
  LineChart,
  Bars,
  Donut,
  KpiCard,
} from "../../components/common"

const timeRanges = ["Weekly", "Monthly", "Yearly"]

const performanceComparisons = [
  { label: "Strength", value: "+18%", score: 54 },
  { label: "Endurance", value: "+12%", score: 36 },
  { label: "Consistency", value: "+24%", score: 72 },
  { label: "Recovery", value: "+7%", score: 21 },
]

export function StatisticsPage() {
  const [range, setRange] = useState("Monthly")

  return (
    <div className="page-stack">
      <div className="page-actions">
        <div>
          <h1>Performance analytics</h1>
          <p>Turn your training data into measurable progress.</p>
        </div>
        <div className="segmented">
          {timeRanges.map((option) => (
            <button
              key={option}
              type="button"
              className={range === option ? "active" : ""}
              onClick={() => setRange(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="kpi-grid stats">
        <KpiCard
          icon={<TrendingUp size={20} />}
          label="Max weight progression"
          value="+12.5"
          unit="kg"
          trend="+8.4%"
          trendIcon={<TrendingUp size={13} />}
        />
        <KpiCard
          icon={<Weight size={20} />}
          label="Training volume"
          value="72.4k"
          unit="kg"
          trend="+14%"
          trendIcon={<TrendingUp size={13} />}
        />
        <KpiCard
          icon={<CalendarDays size={20} />}
          label="Workout frequency"
          value="4.6"
          unit="/ wk"
          trend="+0.8"
          trendIcon={<TrendingUp size={13} />}
        />
        <KpiCard
          icon={<Trophy size={20} />}
          label="Personal records"
          value="7"
          unit="PRs"
          trend="+3 new"
          trendIcon={<TrendingUp size={13} />}
        />
      </div>

      <div className="analytics-grid">
        <Card className="span-2">
          <SectionTitle
            title="Weight evolution"
            detail="Body weight · kg"
            action={<Tag>-5.4 KG</Tag>}
          />
          <LineChart />
        </Card>

        <Card>
          <SectionTitle
            title="Workout distribution"
            detail="By training type"
          />
          <Donut />
        </Card>

        <Card className="span-2">
          <SectionTitle
            title="Training volume"
            detail="Weekly load · thousands of kg"
          />
          <Bars large />
        </Card>

        <Card>
          <SectionTitle
            title="Performance comparison"
            detail="vs. previous period"
          />
          <div className="comparison">
            {performanceComparisons.map((item) => (
              <div key={item.label}>
                <span>{item.label}</span>
                <b>{item.value}</b>
                <Progress value={item.score} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
