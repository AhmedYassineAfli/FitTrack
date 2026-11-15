import { useState, useEffect } from "react"
import { Search, Dumbbell, ChevronRight, Loader2 } from "lucide-react"
import { Card, Tag } from "../../components/common"
import { api } from "../../services/api"

interface ExerciseData {
  id: number
  name: string
  muscle: string
  level: "Beginner" | "Intermediate" | "Advanced"
  description: string | null
  category: { id: number; name: string } | null
}

const defaultCategoryFilters = [
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
  const [exercises, setExercises] = useState<ExerciseData[]>([])
  const [loading, setLoading] = useState(true)

  // Charger les exercices depuis l'API Symfony avec filtres
  useEffect(() => {
    let isCancelled = false
    setLoading(true)

    const fetchExercises = async () => {
      try {
        const data = await api.getExercises({
          q: searchTerm.trim() || undefined,
          category: activeFilter !== "All" ? activeFilter : undefined,
        })
        if (!isCancelled) {
          setExercises(data)
        }
      } catch (err) {
        console.error("Erreur chargement exercices:", err)
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    // Si pas de recherche texte, charger immédiatement sans délai
    if (!searchTerm.trim()) {
      fetchExercises()
      return () => {
        isCancelled = true
      }
    }

    // Si l'utilisateur est en train de taper du texte, délai de 200ms
    const timer = setTimeout(fetchExercises, 200)

    return () => {
      isCancelled = true
      clearTimeout(timer)
    }
  }, [searchTerm, activeFilter])

  return (
    <div className="page-stack">
      <div className="page-actions">
        <div>
          <h1>Exercise library</h1>
          <p>Master your movement with expert guidance from your database.</p>
        </div>
        <Tag>{`${exercises.length} EXERCISES`}</Tag>
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
        {defaultCategoryFilters.map((category) => (
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

      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "10px",
            padding: "60px 0",
            color: "#a3a3a3",
          }}
        >
          <Loader2 className="animate-spin" size={24} />
          <span>Chargement des exercices...</span>
        </div>
      ) : exercises.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 0",
            color: "#737373",
          }}
        >
          <Dumbbell size={40} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
          <p>Aucun exercice trouvé pour ces critères.</p>
        </div>
      ) : (
        <div className="exercise-grid">
          {exercises.map((exercise, index) => (
            <Card className="exercise-card" key={exercise.id}>
              <div className={`exercise-image art-${index % 4}`}>
                <Dumbbell size={38} />
                <Tag muted>{exercise.level}</Tag>
              </div>
              <div>
                <span className="eyebrow">{exercise.muscle}</span>
                <h3>{exercise.name}</h3>
                {exercise.description && (
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#a3a3a3",
                      marginTop: "4px",
                      marginBottom: "8px",
                      lineHeight: "1.4",
                    }}
                  >
                    {exercise.description}
                  </p>
                )}
                <button type="button" className="text-btn">
                  View details <ChevronRight size={15} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
