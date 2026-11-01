import { useState, type ReactNode } from "react"
import {
  Activity,
  Award,
  BarChart3,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  Clock3,
  Dumbbell,
  Eye,
  EyeOff,
  Flame,
  Gauge,
  LayoutDashboard,
  LogOut,
  Menu,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Settings,
  SlidersHorizontal,
  Sparkles,
  Target,
  Trash2,
  TrendingDown,
  TrendingUp,
  Trophy,
  UserRound,
  Weight,
  X,
  Zap,
} from "lucide-react"

type Page = "login" | "register" | "dashboard" | "profile" | "measurements" | "workouts" | "create-workout" | "exercises" | "statistics" | "programs" | "program-details" | "calendar" | "achievements" | "settings"

const photo =
  "https://images.unsplash.com/photo-1754475118668-64ac3f3b2559?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=85&w=1600"

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "profile", label: "My Profile", icon: CircleUserRound },
  { id: "measurements", label: "Measurements", icon: Activity },
  { id: "workouts", label: "Workouts", icon: Dumbbell },
  { id: "exercises", label: "Exercise Library", icon: Zap },
  { id: "statistics", label: "Statistics", icon: BarChart3 },
  { id: "programs", label: "Programs", icon: Target },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "achievements", label: "Achievements", icon: Award },
] as const

const pageTitles: Record<string, string> = {
  dashboard: "Performance overview",
  profile: "My profile",
  measurements: "Body measurements",
  workouts: "My workouts",
  "create-workout": "Create workout",
  exercises: "Exercise library",
  statistics: "Performance analytics",
  programs: "Training programs",
  "program-details": "Program details",
  calendar: "Training calendar",
  achievements: "Achievements",
  settings: "Settings",
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="brand">
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

function Button({
  children,
  secondary = false,
  icon,
  onClick,
  className = "",
  type = "button",
}: {
  children: ReactNode
  secondary?: boolean
  icon?: ReactNode
  onClick?: () => void
  className?: string
  type?: "button" | "submit"
}) {
  return (
    <button
      type={type}
      className={`btn ${secondary ? "btn-secondary" : ""} ${className}`}
      onClick={onClick}
    >
      {icon}
      {children}
    </button>
  )
}

function IconButton({
  children,
  label,
  onClick,
  className = "",
}: {
  children: ReactNode
  label: string
  onClick?: () => void
  className?: string
}) {
  return (
    <button
      className={`icon-btn ${className}`}
      aria-label={label}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

function Input({
  label,
  placeholder,
  type = "text",
  suffix,
}: {
  label: string
  placeholder?: string
  type?: string
  suffix?: ReactNode
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <div className="input-wrap">
        <input type={type} placeholder={placeholder} />
        {suffix}
      </div>
    </label>
  )
}

function Select({ label, children }: { label: string children: ReactNode }) {
  return (
    <label className="field">
      <span>{label}</span>
      <div className="input-wrap">
        <select>{children}</select>
        <ChevronDown size={16} />
      </div>
    </label>
  )
}

function Card({
  children,
  className = "",
}: {
  children: ReactNode
  className?: string
}) {
  return <section className={`card ${className}`}>{children}</section>
}

function SectionTitle({
  title,
  detail,
  action,
}: {
  title: string
  detail?: string
  action?: ReactNode
}) {
  return (
    <div className="section-title">
      <div>
        <h2>{title}</h2>
        {detail && <p>{detail}</p>}
      </div>
      {action}
    </div>
  )
}

function Tag({
  children,
  muted = false,
}: {
  children: ReactNode
  muted?: boolean
}) {
  return <span className={`tag ${muted ? "muted" : ""}`}>{children}</span>
}

function Progress({ value }: { value: number }) {
  return (
    <div className="progress">
      <i style={{ width: `${value}%` }} />
    </div>
  )
}

function LineChart({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`line-chart ${compact ? "compact" : ""}`}>
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
            <stop offset="0" stopColor="#87FF00" stopOpacity=".22" />
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
        {[
          ["0", "45"],
          ["140", "76"],
          ["290", "96"],
          ["430", "118"],
          ["600", "139"],
        ].map(([x, y]) => (
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

function Bars({ large = false }: { large?: boolean }) {
  const values = large
    ? [48, 70, 56, 88, 64, 95, 78, 62, 90, 72, 98, 84]
    : [62, 82, 45, 92, 76, 38, 68]
  return (
    <div className="bars">
      {values.map((v, i) => (
        <div className="bar-col" key={i}>
          <i style={{ height: `${v}%` }} />
          <span>
            {large ? `${i + 1}` : ["M", "T", "W", "T", "F", "S", "S"][i]}
          </span>
        </div>
      ))}
    </div>
  )
}

function KpiCard({
  icon,
  label,
  value,
  unit,
  trend,
}: {
  icon: ReactNode
  label: string
  value: string
  unit?: string
  trend: string
}) {
  return (
    <Card className="kpi">
      <div className="kpi-top">
        <span className="kpi-icon">{icon}</span>
        <span className="trend">
          <TrendingDown size={13} />
          {trend}
        </span>
      </div>
      <p>{label}</p>
      <h3>
        {value} <small>{unit}</small>
      </h3>
    </Card>
  )
}

function Dashboard() {
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
          <Button className="full">Start workout</Button>
        </Card>
        <Card>
          <SectionTitle title="Weekly volume" detail="18,450 kg total" />
          <Bars />
        </Card>
        <Card>
          <SectionTitle
            title="Recent workouts"
            action={<button className="text-btn">View all</button>}
          />
          <div className="list">
            {[
              ["Lower body power", "Yesterday", "58 min"],
              ["Pull strength", "Jun 13", "64 min"],
              ["Conditioning", "Jun 11", "42 min"],
            ].map(([a, b, c]) => (
              <div className="list-row" key={a}>
                <span className="list-icon">
                  <Dumbbell size={17} />
                </span>
                <div>
                  <b>{a}</b>
                  <small>{b}</small>
                </div>
                <strong>{c}</strong>
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

function Profile() {
  return (
    <div className="content-narrow page-stack">
      <Card className="profile-hero">
        <div className="avatar xl">AM</div>
        <div>
          <Tag>INTERMEDIATE ATHLETE</Tag>
          <h1>Alex Morgan</h1>
          <p>Building strength, one rep at a time.</p>
        </div>
        <Button secondary icon={<Pencil size={16} />}>
          Edit profile
        </Button>
      </Card>
      <Card>
        <SectionTitle
          title="Personal information"
          detail="Keep your profile details up to date"
        />
        <div className="form-grid">
          <Input label="Full name" placeholder="Alex Morgan" />
          <Input
            label="Email address"
            type="email"
            placeholder="alex@fittrack.app"
          />
          <Input label="Age" placeholder="28" />
          <Input label="Height" placeholder="180 cm" />
          <Select label="Fitness goal">
            <option>Muscle gain</option>
            <option>Weight loss</option>
            <option>General fitness</option>
          </Select>
          <Select label="Experience level">
            <option>Intermediate</option>
            <option>Beginner</option>
            <option>Advanced</option>
          </Select>
        </div>
      </Card>
      <Card>
        <SectionTitle title="Account information" />
        <div className="account-row">
          <div>
            <b>Member since</b>
            <span>September 12, 2023</span>
          </div>
          <div>
            <b>Plan</b>
            <span>FitTrack Pro</span>
          </div>
          <div>
            <b>Profile visibility</b>
            <span>Private</span>
          </div>
        </div>
        <div className="form-actions">
          <Button secondary>Cancel</Button>
          <Button icon={<Check size={16} />}>Save changes</Button>
        </div>
      </Card>
    </div>
  )
}

function Measurements() {
  return (
    <div className="page-stack">
      <div className="page-actions">
        <div>
          <h1>Body measurements</h1>
          <p>Track changes and understand your body composition.</p>
        </div>
        <Button icon={<Plus size={17} />}>Add measurement</Button>
      </div>
      <div className="summary-grid">
        <Card className="summary-stat">
          <span>Current BMI</span>
          <b>22.9</b>
          <Tag>OPTIMAL RANGE</Tag>
        </Card>
        <Card className="summary-stat">
          <span>Body fat</span>
          <b>15.8%</b>
          <small>-0.6% this month</small>
        </Card>
        <Card className="summary-stat">
          <span>Current weight</span>
          <b>
            74.2 <em>kg</em>
          </b>
          <small>-1.8 kg this month</small>
        </Card>
      </div>
      <Card>
        <SectionTitle
          title="Weight evolution"
          detail="January — June 2025"
          action={
            <Select label="">
              <option>6 months</option>
              <option>1 year</option>
            </Select>
          }
        />
        <LineChart />
      </Card>
      <Card>
        <SectionTitle title="Measurement history" />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Weight</th>
                <th>Body fat</th>
                <th>Waist</th>
                <th>Chest</th>
                <th>Arms</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {[
                [
                  "September 16, 2026",
                  "74.2 kg",
                  "15.8%",
                  "81 cm",
                  "102 cm",
                  "37 cm",
                ],
                [
                  "September 19, 2026",
                  "75.1 kg",
                  "16.4%",
                  "82 cm",
                  "101 cm",
                  "36.5 cm",
                ],
                [
                  "Apr 26, 2025",
                  "76.0 kg",
                  "17.1%",
                  "83 cm",
                  "100 cm",
                  "36 cm",
                ],
                [
                  "Mar 17, 2026",
                  "77.3 kg",
                  "17.8%",
                  "84 cm",
                  "99 cm",
                  "35.8 cm",
                ],
              ].map((r) => (
                <tr key={r[0]}>
                  {r.map((x) => (
                    <td key={x}>{x}</td>
                  ))}
                  <td>
                    <MoreHorizontal size={18} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

const workoutData = [
  ["Push strength", "Strength", "60 min", "High", "Today", "7 exercises"],
  [
    "Lower body power",
    "Strength",
    "58 min",
    "High",
    "November 15",
    "6 exercises",
  ],
  [
    "Full body conditioning",
    "Conditioning",
    "42 min",
    "Medium",
    "November 11",
    "8 exercises",
  ],
  [
    "Pull hypertrophy",
    "Hypertrophy",
    "64 min",
    "High",
    "November 9",
    "7 exercises",
  ],
  ["Mobility reset", "Mobility", "30 min", "Low", "November 8", "10 exercises"],
  [
    "Zone 2 endurance",
    "Cardio",
    "45 min",
    "Medium",
    "November 6",
    "1 exercise",
  ],
]

function Workouts({ setPage }: { setPage: (p: Page) => void }) {
  const [query, setQuery] = useState("")
  const filtered = workoutData.filter((w) =>
    w[0].toLowerCase().includes(query.toLowerCase()),
  )
  return (
    <div className="page-stack">
      <div className="page-actions">
        <div>
          <h1>My workouts</h1>
          <p>Build, schedule and review every training session.</p>
        </div>
        <Button
          onClick={() => setPage("create-workout")}
          icon={<Plus size={17} />}
        >
          Create workout
        </Button>
      </div>
      <div className="toolbar">
        <div className="search">
          <Search size={18} />
          <input
            placeholder="Search workouts..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Button secondary icon={<SlidersHorizontal size={16} />}>
          Filters
        </Button>
      </div>
      <div className="workout-grid">
        {filtered.map((w, i) => (
          <Card className="workout-card" key={w[0]}>
            <div className="workout-cover">
              <span>0{i + 1}</span>
              <Dumbbell size={28} />
              <Tag>{w[1]}</Tag>
            </div>
            <div className="workout-card-body">
              <div className="card-heading">
                <div>
                  <h3>{w[0]}</h3>
                  <p>{w[4]}</p>
                </div>
                <IconButton label="More">
                  <MoreHorizontal size={19} />
                </IconButton>
              </div>
              <div className="workout-stats">
                <span>
                  <Clock3 size={14} />
                  {w[2]}
                </span>
                <span>
                  <Flame size={14} />
                  {w[3]}
                </span>
                <span>{w[5]}</span>
              </div>
              <div className="card-actions">
                <Button secondary>View</Button>
                <IconButton label="Edit">
                  <Pencil size={16} />
                </IconButton>
                <IconButton label="Delete">
                  <Trash2 size={16} />
                </IconButton>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

function CreateWorkout({ setPage }: { setPage: (p: Page) => void }) {
  const [exercises, setExercises] = useState([1, 2])
  return (
    <div className="content-narrow page-stack">
      <div className="page-actions">
        <div>
          <button className="back" onClick={() => setPage("workouts")}>
            <ChevronLeft size={17} /> Back to workouts
          </button>
          <h1>Create workout</h1>
          <p>Design a focused session around your training objective.</p>
        </div>
      </div>
      <Card>
        <SectionTitle title="Workout details" />
        <div className="form-grid">
          <Input label="Workout name" placeholder="e.g. Upper Body Strength" />
          <Select label="Workout type">
            <option>Strength</option>
            <option>Hypertrophy</option>
            <option>Conditioning</option>
          </Select>
          <Input label="Date & time" type="datetime-local" />
          <Input label="Duration" placeholder="60 minutes" />
          <Select label="Intensity">
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </Select>
        </div>
      </Card>
      <Card>
        <SectionTitle
          title="Exercises"
          detail={`${exercises.length} exercises in this session`}
          action={
            <Button
              onClick={() => setExercises([...exercises, Date.now()])}
              secondary
              icon={<Plus size={16} />}
            >
              Add exercise
            </Button>
          }
        />
        <div className="exercise-builder">
          {exercises.map((n, i) => (
            <div className="exercise-row" key={n}>
              <div className="drag-index">0{i + 1}</div>
              <Select label="Exercise">
                <option>
                  {i ? "Incline dumbbell press" : "Barbell bench press"}
                </option>
                <option>Overhead press</option>
              </Select>
              <Input label="Sets" placeholder="4" />
              <Input label="Reps" placeholder={i ? "10" : "6"} />
              <Input label="Weight" placeholder={i ? "28 kg" : "85 kg"} />
              <Input label="Rest" placeholder="90 sec" />
              <IconButton
                label="Remove"
                onClick={() => setExercises(exercises.filter((x) => x !== n))}
              >
                <X size={18} />
              </IconButton>
            </div>
          ))}
        </div>
      </Card>
      <div className="form-actions">
        <Button secondary onClick={() => setPage("workouts")}>
          Cancel
        </Button>
        <Button onClick={() => setPage("workouts")} icon={<Check size={16} />}>
          Save workout
        </Button>
      </div>
    </div>
  )
}

const exerciseNames = [
  ["Barbell Back Squat", "Quadriceps", "Advanced"],
  ["Romanian Deadlift", "Hamstrings", "Intermediate"],
  ["Incline Dumbbell Press", "Chest", "Intermediate"],
  ["Pull Up", "Back", "Intermediate"],
  ["Cable Lateral Raise", "Shoulders", "Beginner"],
  ["Bulgarian Split Squat", "Legs", "Advanced"],
  ["Hammer Curl", "Biceps", "Beginner"],
  ["Hanging Leg Raise", "Core", "Intermediate"],
]

function Exercises() {
  const [filter, setFilter] = useState("All")
  return (
    <div className="page-stack">
      <div className="page-actions">
        <div>
          <h1>Exercise library</h1>
          <p>Master your movement with expert guidance.</p>
        </div>
        <Tag>{exerciseNames.length * 24}+ EXERCISES</Tag>
      </div>
      <div className="search wide">
        <Search size={19} />
        <input placeholder="Search by exercise or muscle group..." />
      </div>
      <div className="filter-chips">
        {["All", "Chest", "Back", "Legs", "Shoulders", "Arms", "Core"].map(
          (x) => (
            <button
              className={filter === x ? "active" : ""}
              onClick={() => setFilter(x)}
              key={x}
            >
              {x}
            </button>
          ),
        )}
      </div>
      <div className="exercise-grid">
        {exerciseNames.map((e, i) => (
          <Card className="exercise-card" key={e[0]}>
            <div className={`exercise-image art-${i % 4}`}>
              <Dumbbell size={38} />
              <Tag muted>{e[2]}</Tag>
            </div>
            <div>
              <span className="eyebrow">{e[1]}</span>
              <h3>{e[0]}</h3>
              <button className="text-btn">
                View details <ChevronRight size={15} />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

function Donut() {
  return (
    <div className="donut-wrap">
      <div className="donut">
        <div>
          <b>24</b>
          <span>workouts</span>
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

function Statistics() {
  const [range, setRange] = useState("Monthly")
  return (
    <div className="page-stack">
      <div className="page-actions">
        <div>
          <h1>Performance analytics</h1>
          <p>Turn your training data into measurable progress.</p>
        </div>
        <div className="segmented">
          {["Weekly", "Monthly", "Yearly"].map((x) => (
            <button
              className={range === x ? "active" : ""}
              onClick={() => setRange(x)}
              key={x}
            >
              {x}
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
        />
        <KpiCard
          icon={<Weight size={20} />}
          label="Training volume"
          value="72.4k"
          unit="kg"
          trend="+14%"
        />
        <KpiCard
          icon={<CalendarDays size={20} />}
          label="Workout frequency"
          value="4.6"
          unit="/ wk"
          trend="+0.8"
        />
        <KpiCard
          icon={<Trophy size={20} />}
          label="Personal records"
          value="7"
          unit="PRs"
          trend="+3 new"
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
            {[
              ["Strength", "+18%"],
              ["Endurance", "+12%"],
              ["Consistency", "+24%"],
              ["Recovery", "+7%"],
            ].map(([a, b]) => (
              <div key={a}>
                <span>{a}</span>
                <b>{b}</b>
                <Progress value={parseInt(b) * 3} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

const programs = [
  [
    "Strength Foundation",
    "Build foundational strength",
    "8 weeks",
    "4 workouts / week",
    "72%",
  ],
  [
    "Lean & Athletic",
    "Improve conditioning and mobility",
    "6 weeks",
    "5 workouts / week",
    "35%",
  ],
  [
    "Powerbuilding 101",
    "Strength meets hypertrophy",
    "12 weeks",
    "4 workouts / week",
    "0%",
  ],
]

function Programs({ setPage }: { setPage: (p: Page) => void }) {
  return (
    <div className="page-stack">
      <div className="page-actions">
        <div>
          <h1>My programs</h1>
          <p>Structured plans built for meaningful progress.</p>
        </div>
        <Button icon={<Plus size={17} />}>Create program</Button>
      </div>
      <div className="program-grid">
        {programs.map((p, i) => (
          <Card className="program-card" key={p[0]}>
            <div className="program-number">0{i + 1}</div>
            <div>
              <Tag>{i === 2 ? "DRAFT" : "ACTIVE"}</Tag>
              <h2>{p[0]}</h2>
              <p>{p[1]}</p>
            </div>
            <div className="program-meta">
              <span>
                <Clock3 size={15} />
                {p[2]}
              </span>
              <span>
                <Dumbbell size={15} />
                {p[3]}
              </span>
              <span>
                <CalendarDays size={15} />
                Started May 05
              </span>
            </div>
            <div className="program-progress">
              <div>
                <span>Program progress</span>
                <b>{p[4]}</b>
              </div>
              <Progress value={parseInt(p[4])} />
            </div>
            <div className="card-actions">
              <Button onClick={() => setPage("program-details")}>
                View details
              </Button>
              <Button secondary>Edit</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

function ProgramDetails({ setPage }: { setPage: (p: Page) => void }) {
  const days = [
    ["MON", "Upper body strength", "6 exercises · 60 min"],
    ["TUE", "Lower body power", "5 exercises · 55 min"],
    ["THU", "Upper hypertrophy", "7 exercises · 65 min"],
    ["SAT", "Full body conditioning", "8 exercises · 45 min"],
  ]
  return (
    <div className="page-stack">
      <button className="back" onClick={() => setPage("programs")}>
        <ChevronLeft size={17} /> Back to programs
      </button>
      <Card className="program-hero">
        <div>
          <Tag>ACTIVE PROGRAM</Tag>
          <h1>Strength Foundation</h1>
          <p>
            An 8-week progression built to develop confident technique and
            total-body strength.
          </p>
        </div>
        <Button secondary icon={<Pencil size={16} />}>
          Edit program
        </Button>
        <div className="program-hero-stats">
          <div>
            <span>Objective</span>
            <b>Build strength</b>
          </div>
          <div>
            <span>Duration</span>
            <b>8 weeks</b>
          </div>
          <div>
            <span>Schedule</span>
            <b>4 days / week</b>
          </div>
          <div>
            <span>Current week</span>
            <b>6 of 8</b>
          </div>
        </div>
        <Progress value={72} />
      </Card>
      <div className="details-grid">
        <Card className="span-2">
          <SectionTitle
            title="Weekly training schedule"
            detail="Week 6 · June 16—22"
          />
          <div className="schedule-list">
            {days.map((d, i) => (
              <div className="schedule-row" key={d[0]}>
                <div className="day-box">
                  <span>{d[0]}</span>
                  <b>{[16, 17, 19, 21][i]}</b>
                </div>
                <span className={`status-dot ${i < 2 ? "done" : ""}`}>
                  {i < 2 && <Check size={13} />}
                </span>
                <div>
                  <h3>{d[1]}</h3>
                  <p>{d[2]}</p>
                </div>
                <Tag muted>
                  {i < 2 ? "COMPLETED" : i === 2 ? "UP NEXT" : "PLANNED"}
                </Tag>
                <ChevronRight size={18} />
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <SectionTitle title="Progression" />
          <div className="ring">
            <div>
              <b>72%</b>
              <span>complete</span>
            </div>
          </div>
          <div className="milestones">
            <span>
              <Check size={14} />
              24 workouts completed
            </span>
            <span>
              <Check size={14} />3 personal records
            </span>
            <span>
              <Clock3 size={14} />8 sessions remaining
            </span>
          </div>
        </Card>
      </div>
    </div>
  )
}

function CalendarPage() {
  const [month, setMonth] = useState(5)
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
  ]
  const workouts: Record<number, string> = {
    2: "Lower body",
    4: "Pull strength",
    6: "Conditioning",
    9: "Push strength",
    11: "Mobility",
    13: "Pull strength",
    16: "Lower body",
    17: "Push strength",
    19: "Upper body",
    21: "Conditioning",
    24: "Lower body",
    26: "Pull strength",
  }
  return (
    <div className="page-stack">
      <div className="page-actions">
        <div>
          <h1>Training calendar</h1>
          <p>Plan your work. Protect your consistency.</p>
        </div>
        <Button icon={<Plus size={17} />}>Schedule workout</Button>
      </div>
      <div className="calendar-layout">
        <Card className="calendar-card">
          <div className="calendar-head">
            <h2>{months[month]} 2025</h2>
            <div>
              <IconButton
                label="Previous month"
                onClick={() => setMonth(Math.max(0, month - 1))}
              >
                <ChevronLeft size={18} />
              </IconButton>
              <button className="today-btn">Today</button>
              <IconButton
                label="Next month"
                onClick={() => setMonth(Math.min(6, month + 1))}
              >
                <ChevronRight size={18} />
              </IconButton>
            </div>
          </div>
          <div className="weekdays">
            {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((x) => (
              <span key={x}>{x}</span>
            ))}
          </div>
          <div className="calendar-grid">
            {Array.from({ length: 35 }, (_, i) => {
              const day = i - 5
              return (
                <div
                  className={`${day === 16 ? "today" : ""} ${
                    day < 1 ? "outside" : ""
                  }`}
                  key={i}
                >
                  <b>{day > 0 && day < 31 ? day : ""}</b>
                  {workouts[day] && (
                    <span className={day < 18 ? "completed" : ""}>
                      {workouts[day]}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
        <Card className="calendar-side">
          <SectionTitle title="Upcoming sessions" detail="This week" />
          {[
            ["TODAY", "Push strength", "18:30 · 60 min"],
            ["THU 19", "Upper body", "07:00 · 65 min"],
            ["SAT 21", "Conditioning", "09:30 · 45 min"],
          ].map((x, i) => (
            <div className="session" key={x[0]}>
              <div>
                <span>{x[0]}</span>
                <b>{x[1]}</b>
                <small>{x[2]}</small>
              </div>
              {i === 0 && <Tag>UP NEXT</Tag>}
            </div>
          ))}
          <div className="calendar-legend">
            <span>
              <i className="completed" />
              Completed
            </span>
            <span>
              <i />
              Planned
            </span>
            <span>
              <i className="missed" />
              Missed
            </span>
          </div>
        </Card>
      </div>
    </div>
  )
}

const badges = [
  ["Iron Habit", "Complete 50 workouts", "Consistency", true],
  ["Early Riser", "Train before 7 AM 10 times", "Consistency", true],
  ["Century Club", "Complete 100 workouts", "Progression", true],
  ["Heavy Hitter", "Deadlift 2× bodyweight", "Strength", false],
  ["Marathon Month", "Train 20 hours in one month", "Endurance", false],
  ["Unstoppable", "Maintain a 30-day streak", "Consistency", false],
  ["New Heights", "Set 10 personal records", "Progression", true],
  ["Volume King", "Lift 1,000,000 kg total", "Strength", false],
]

function Achievements() {
  const [category, setCategory] = useState("All")
  return (
    <div className="page-stack">
      <div className="achievement-summary">
        <div>
          <span className="eyebrow">YOUR TROPHY ROOM</span>
          <h1>4 badges earned</h1>
          <p>Every milestone tells the story of your discipline.</p>
        </div>
        <div className="big-trophy">
          <Trophy size={48} />
        </div>
        <div>
          <b>50%</b>
          <span>Overall completion</span>
          <Progress value={50} />
        </div>
      </div>
      <div className="filter-chips">
        {["All", "Consistency", "Strength", "Endurance", "Progression"].map(
          (x) => (
            <button
              className={category === x ? "active" : ""}
              onClick={() => setCategory(x)}
              key={x}
            >
              {x}
            </button>
          ),
        )}
      </div>
      <div className="badge-grid">
        {badges
          .filter((b) => category === "All" || b[2] === category)
          .map((b, i) => (
            <Card className={`badge-card ${!b[3] ? "locked" : ""}`} key={b[0]}>
              <div className="badge-emblem">
                {b[3] ? <Award size={34} /> : <Target size={34} />}
                <span>0{i + 1}</span>
              </div>
              <Tag muted>{b[2]}</Tag>
              <h3>{b[0]}</h3>
              <p>{b[1]}</p>
              <div className="unlock-state">
                {b[3] ? (
                  <>
                    <Check size={15} /> Unlocked
                  </>
                ) : (
                  <>62% complete</>
                )}
              </div>
              {!b[3] && <Progress value={62} />}
            </Card>
          ))}
      </div>
    </div>
  )
}

function SettingsPage() {
  return (
    <div className="content-narrow page-stack">
      <div>
        <h1>Settings</h1>
        <p>Manage preferences for your FitTrack experience.</p>
      </div>
      <Card>
        <SectionTitle title="Training preferences" />
        <div className="form-grid">
          <Select label="Measurement system">
            <option>Metric (kg, cm)</option>
          </Select>
          <Select label="Week starts on">
            <option>Monday</option>
          </Select>
          <Select label="Default workout duration">
            <option>60 minutes</option>
          </Select>
          <Select label="Fitness level">
            <option>Intermediate</option>
          </Select>
        </div>
      </Card>
      <Card>
        <SectionTitle title="Notifications" />
        {[
          "Workout reminders",
          "Weekly progress report",
          "Achievement updates",
        ].map((x) => (
          <label className="toggle-row" key={x}>
            <span>
              <b>{x}</b>
              <small>Receive helpful updates and reminders</small>
            </span>
            <input type="checkbox" defaultChecked />
            <i />
          </label>
        ))}
      </Card>
      <div className="form-actions">
        <Button>Save preferences</Button>
      </div>
    </div>
  )
}

function Auth({
  mode,
  setPage,
}: {
  mode: "login" | "register"
  setPage: (p: Page) => void
}) {
  const [show, setShow] = useState(false)
  const isLogin = mode === "login"
  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <Brand />
        <div className="auth-form">
          <span className="eyebrow">
            {isLogin ? "WELCOME BACK" : "START YOUR JOURNEY"}
          </span>
          <h1>{isLogin ? "Stronger starts here." : "Build your best self."}</h1>
          <p>
            {isLogin
              ? "Sign in to continue tracking your performance."
              : "Create your account and turn intention into progress."}
          </p>
          {!isLogin && <Input label="Full name" placeholder="Alex Morgan" />}
          <Input
            label="Email address"
            placeholder="you@example.com"
            type="email"
          />
          <Input
            label="Password"
            placeholder="At least 8 characters"
            type={show ? "text" : "password"}
            suffix={
              <IconButton
                label="Toggle password"
                onClick={() => setShow(!show)}
              >
                {show ? <EyeOff size={17} /> : <Eye size={17} />}
              </IconButton>
            }
          />
          {!isLogin && (
            <Input
              label="Confirm password"
              placeholder="Repeat your password"
              type="password"
            />
          )}
          {isLogin ? (
            <div className="auth-options">
              <label>
                <input type="checkbox" />
                Remember me
              </label>
              <button>Forgot password?</button>
            </div>
          ) : (
            <div className="goal-select">
              <span>Primary fitness goal</span>
              <div>
                {["Weight loss", "Muscle gain", "General fitness"].map(
                  (x, i) => (
                    <label key={x}>
                      <input
                        name="goal"
                        type="radio"
                        defaultChecked={i === 1}
                      />
                      <span>{x}</span>
                    </label>
                  ),
                )}
              </div>
            </div>
          )}
          <Button className="full" onClick={() => setPage("dashboard")}>
            {isLogin ? "Sign in" : "Create account"}
            <ChevronRight size={17} />
          </Button>
          <p className="auth-switch">
            {isLogin ? "New to FitTrack?" : "Already have an account?"}{" "}
            <button onClick={() => setPage(isLogin ? "register" : "login")}>
              {isLogin ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>
        <small className="copyright">
          © 2025 FitTrack. Built for progress.
        </small>
      </section>
      <section
        className="auth-visual"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(8,8,8,.05), rgba(8,8,8,.88)), url(${photo})`,
        }}
      >
        <div className="visual-stat">
          <Sparkles size={20} />
          <span>THIS MONTH</span>
          <b>12 workouts</b>
          <small>You're in the top 14% of athletes</small>
        </div>
        <div className="visual-quote">
          <q>
            Discipline is choosing between what you want now and what you want
            most.
          </q>
          <span>FITTRACK MINDSET</span>
        </div>
      </section>
    </main>
  )
}

function Shell({
  page,
  setPage,
  children,
}: {
  page: Page
  setPage: (p: Page) => void
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const active =
    page === "create-workout"
      ? "workouts"
      : page === "program-details"
        ? "programs"
        : page
  return (
    <div className="app-shell">
      <aside className={open ? "open" : ""}>
        <div className="sidebar-head">
          <Brand />
          <IconButton label="Close menu" onClick={() => setOpen(false)}>
            <X size={20} />
          </IconButton>
        </div>
        <nav>
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={active === id ? "active" : ""}
              onClick={() => {
                setPage(id)
                setOpen(false)
              }}
            >
              <Icon size={19} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button
            className={page === "settings" ? "active" : ""}
            onClick={() => setPage("settings")}
          >
            <Settings size={19} />
            Settings
          </button>
          <button onClick={() => setPage("login")}>
            <LogOut size={19} />
            Logout
          </button>
          <div className="mini-profile">
            <div className="avatar">AM</div>
            <div>
              <b>Alex Morgan</b>
              <span>FitTrack Pro</span>
            </div>
            <ChevronRight size={16} />
          </div>
        </div>
      </aside>
      {open && (
        <button
          className="scrim"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        />
      )}
      <div className="main-area">
        <header>
          <IconButton
            label="Open menu"
            className="menu-btn"
            onClick={() => setOpen(true)}
          >
            <Menu size={21} />
          </IconButton>
          <div>
            <span>FITTRACK /</span>
            <b>{pageTitles[page]}</b>
          </div>
          <div className="header-actions">
            <IconButton label="Notifications" className="notification">
              <Bell size={19} />
              <i />
            </IconButton>
            <div className="avatar">AM</div>
          </div>
        </header>
        <main className="main-content">{children}</main>
        <nav className="mobile-nav">
          {navItems.slice(0, 4).map(({ id, label, icon: Icon }) => (
            <button
              className={active === id ? "active" : ""}
              onClick={() => setPage(id)}
              key={id}
            >
              <Icon size={19} />
              <span>{label.split(" ")[0]}</span>
            </button>
          ))}
          <button onClick={() => setOpen(true)}>
            <Menu size={19} />
            <span>More</span>
          </button>
        </nav>
      </div>
    </div>
  )
}

export default function App() {
  const [page, setPage] = useState<Page>("dashboard")
  if (page === "login" || page === "register")
    return <Auth mode={page} setPage={setPage} />
  const content: Record<string, ReactNode> = {
    dashboard: <Dashboard />,
    profile: <Profile />,
    measurements: <Measurements />,
    workouts: <Workouts setPage={setPage} />,
    "create-workout": <CreateWorkout setPage={setPage} />,
    exercises: <Exercises />,
    statistics: <Statistics />,
    programs: <Programs setPage={setPage} />,
    "program-details": <ProgramDetails setPage={setPage} />,
    calendar: <CalendarPage />,
    achievements: <Achievements />,
    settings: <SettingsPage />,
  }
  return (
    <Shell page={page} setPage={setPage}>
      {content[page]}
    </Shell>
  )
}
