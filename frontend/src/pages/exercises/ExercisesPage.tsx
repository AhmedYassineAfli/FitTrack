import { useState } from "react"
import { Search, Dumbbell, ChevronRight } from "lucide-react"
import { Card, Tag } from "../../components/common"
import { exerciseLibrary } from "../../data/mockData"

const categoryFilters = [
  "All",
  "Chest",
  "Back",
  "Legs",
  "Shoulders",
  "Arms",
  "Core",
]

export function ExercisesPage() {
  const [activeFilter, setActiveFilter] = useState("All")
  const [searchTerm, setSearchTerm] = useState("")

  const filteredExercises = exerciseLibrary.filter((exercise) => {
    const matchesFilter =
      activeFilter === "All" ||
      exercise.muscle.toLowerCase().includes(activeFilter.toLowerCase()) ||
      (activeFilter === "Legs" &&
        (exercise.muscle === "Quadriceps" ||
          exercise.muscle === "Hamstrings" ||
          exercise.muscle === "Legs")) ||
      (activeFilter === "Arms" && exercise.muscle === "Biceps")

    const matchesSearch =
      exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.muscle.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesFilter && matchesSearch
  })

  return (
    <div className="page-stack">
      <div className="page-actions">
        <div>
          <h1>Exercise library</h1>
          <p>Master your movement with expert guidance.</p>
        </div>
        <Tag>{`${exerciseLibrary.length * 24}+ EXERCISES`}</Tag>
      </div>

      <div className="search wide">
        <Search size={19} />
        <input
          placeholder="Search by exercise or muscle group..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="filter-chips">
        {categoryFilters.map((category) => (
          <button
            key={category}
            type="button"
            className={activeFilter === category ? "active" : ""}
            onClick={() => setActiveFilter(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="exercise-grid">
        {filteredExercises.map((exercise, index) => (
          <Card className="exercise-card" key={exercise.name}>
            <div className={`exercise-image art-${index % 4}`}>
              <Dumbbell size={38} />
              <Tag muted>{exercise.level}</Tag>
            </div>
            <div>
              <span className="eyebrow">{exercise.muscle}</span>
              <h3>{exercise.name}</h3>
              <button type="button" className="text-btn">
                View details <ChevronRight size={15} />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
