import { Flame, Weight, Gauge, Dumbbell, Clock3, Trophy } from "lucide-react"
import {
  Card,
  SectionTitle,
  Tag,
  Progress,
  LineChart,
  Bars,
  KpiCard,
  Button,
} from "../../components/common"
import type { Page } from "../../types"

interface DashboardPageProps {
  setPage?: (page: Page) => void
}

const recentWorkouts = [
  { name: "Lower body power", date: "Yesterday", duration: "58 min" },
  { name: "Pull strength", date: "Jun 13", duration: "64 min" },
  { name: "Conditioning", date: "Jun 11", duration: "42 min" },
]

export function DashboardPage({ setPage }: DashboardPageProps) {
  return (
    <div className="page-stack">
      <div className="hero-row">
        <div>
          <span className="eyebrow">MONDAY, NOVEMBER 2</span>
          <h1>Ready to move, Alex?</h1>
          <p>Your consistency is paying off. Keep the momentum going.</p>
        </div>
        <div className="streak">
          <Flame size={19} />
          <b>12 day streak</b>
          <span>Personal best</span>
        </div>
      </div>

      <div className="kpi-grid">
        <KpiCard
          icon={<Weight size={20} />}
          label="Current weight"
          value="74.2"
          unit="kg"
          trend="1.8 kg"
        />
        <KpiCard
          icon={<Gauge size={20} />}
          label="Body mass index"
          value="22.9"
          trend="Optimal"
        />
        <KpiCard
          icon={<Dumbbell size={20} />}
          label="Total workouts"
          value="128"
          trend="+8 this mo."
        />
        <KpiCard
          icon={<Clock3 size={20} />}
          label="Training hours"
          value="96.5"
          unit="hrs"
          trend="+12%"
        />
      </div>

      <div className="dashboard-grid">
        <Card className="span-2">
          <SectionTitle
            title="Weight progression"
            detail="Last 6 months"
            action={<Tag>-5.4 kg</Tag>}
          />
          <LineChart />
        </Card>

        <Card>
          <SectionTitle title="Upcoming workout" detail="Today · 18:30" />
          <div className="upcoming-art">
            <Dumbbell size={34} />
            <Tag>UPPER BODY</Tag>
          </div>
          <h3 className="workout-name">Push strength</h3>
          <div className="meta-row">
            <span>
              <Clock3 size={15} />
              60 min
            </span>
            <span>
              <Flame size={15} />
              High
            </span>
            <span>7 exercises</span>
          </div>
          <Button className="full" onClick={() => setPage?.("workouts")}>
            Start workout
          </Button>
        </Card>

        <Card>
          <SectionTitle title="Weekly volume" detail="18,450 kg total" />
          <Bars />
        </Card>

        <Card>
          <SectionTitle
            title="Recent workouts"
            action={
              <button
                type="button"
                className="text-btn"
                onClick={() => setPage?.("workouts")}
              >
                View all
              </button>
            }
          />
          <div className="list">
            {recentWorkouts.map((workout) => (
              <div className="list-row" key={workout.name}>
                <span className="list-icon">
                  <Dumbbell size={17} />
                </span>
                <div>
                  <b>{workout.name}</b>
                  <small>{workout.date}</small>
                </div>
                <strong>{workout.duration}</strong>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle title="Body metrics" detail="Latest measurements" />
          <div className="metric-pairs">
            <div>
              <span>Body fat</span>
              <b>15.8%</b>
              <small>-0.6%</small>
            </div>
            <div>
              <span>Waist</span>
              <b>81 cm</b>
              <small>-2 cm</small>
            </div>
            <div>
              <span>Chest</span>
              <b>102 cm</b>
              <small>+1 cm</small>
            </div>
            <div>
              <span>Arms</span>
              <b>37 cm</b>
              <small>+0.5 cm</small>
            </div>
          </div>
        </Card>

        <Card className="achievement-card">
          <SectionTitle title="Latest achievement" />
          <div className="achievement">
            <div className="badge">
              <Trophy size={30} />
            </div>
            <div>
              <Tag>UNLOCKED</Tag>
              <h3>Century Club</h3>
              <p>Completed 100 workouts</p>
            </div>
          </div>
          <Progress value={100} />
        </Card>
      </div>
    </div>
  )
}
