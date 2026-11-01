import { useState } from "react"
import {
  Plus,
  Search,
  SlidersHorizontal,
  Dumbbell,
  MoreHorizontal,
  Clock3,
  Flame,
  Pencil,
  Trash2,
} from "lucide-react"
import { Card, Tag, Button, IconButton } from "../../components/common"
import { initialWorkouts } from "../../data/mockData"
import type { Page, WorkoutSession } from "../../types"

interface WorkoutsPageProps {
  setPage: (p: Page) => void
}

export function WorkoutsPage({ setPage }: WorkoutsPageProps) {
  const [workouts, setWorkouts] = useState<WorkoutSession[]>(initialWorkouts)
  const [query, setQuery] = useState("")

  const filtered = workouts.filter(
    (w) =>
      w.name.toLowerCase().includes(query.toLowerCase()) ||
      w.type.toLowerCase().includes(query.toLowerCase()),
  )

  const handleDelete = (id: string) => {
    setWorkouts((prev) => prev.filter((item) => item.id !== id))
  }

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
        {filtered.map((workout, index) => (
          <Card className="workout-card" key={workout.id}>
            <div className="workout-cover">
              <span>{`0${index + 1}`}</span>
              <Dumbbell size={28} />
              <Tag>{workout.type}</Tag>
            </div>
            <div className="workout-card-body">
              <div className="card-heading">
                <div>
                  <h3>{workout.name}</h3>
                  <p>{workout.date}</p>
                </div>
                <IconButton label="More">
                  <MoreHorizontal size={19} />
                </IconButton>
              </div>

              <div className="workout-stats">
                <span>
                  <Clock3 size={14} />
                  {workout.duration}
                </span>
                <span>
                  <Flame size={14} />
                  {workout.intensity}
                </span>
                <span>{workout.exercisesCount}</span>
              </div>

              <div className="card-actions">
                <Button secondary>View</Button>
                <IconButton
                  label="Edit"
                  onClick={() => setPage("create-workout")}
                >
                  <Pencil size={16} />
                </IconButton>
                <IconButton
                  label="Delete"
                  onClick={() => handleDelete(workout.id)}
                >
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
