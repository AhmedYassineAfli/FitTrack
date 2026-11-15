import { useState, useEffect } from "react"
import {
  Plus,
  Search,
  Dumbbell,
  Clock3,
  Flame,
  Trash2,
  Calendar,
} from "lucide-react"
import { Card, Tag, Button } from "../../components/common"
import { api, type WorkoutSessionItem } from "../../services/api"
import type { Page } from "../../types"

interface WorkoutsPageProps {
  setPage: (p: Page) => void
}

export function WorkoutsPage({ setPage }: WorkoutsPageProps) {
  const [workouts, setWorkouts] = useState<WorkoutSessionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState("")

  const loadWorkouts = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getWorkouts()
      setWorkouts(data.workouts)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors du chargement des séances")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWorkouts()
  }, [])

  const handleDelete = async (id: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette séance d'entraînement ?")) return
    try {
      await api.deleteWorkout(id)
      setWorkouts((prev) => prev.filter((item) => item.id !== id))
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erreur de suppression")
    }
  }

  const filtered = workouts.filter(
    (w) =>
      w.name.toLowerCase().includes(query.toLowerCase()) ||
      (w.type && w.type.toLowerCase().includes(query.toLowerCase()))
  )

  return (
    <div className="page-stack">
      <div className="page-actions">
        <div>
          <h1>My workouts</h1>
          <p>Build, schedule and review every training session (Sprint 2).</p>
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
            placeholder="Search workouts by name or type..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div style={{ padding: "12px", background: "#ef444420", border: "1px solid #ef4444", borderRadius: "8px", color: "#f87171" }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#a1a1aa" }}>
          Chargement de vos séances depuis la base de données...
        </div>
      ) : filtered.length === 0 ? (
        <Card className="workout-card">
          <div style={{ textAlign: "center", padding: "40px 20px", width: "100%" }}>
            <p style={{ color: "#a1a1aa", marginBottom: "16px" }}>
              {query ? "Aucune séance ne correspond à votre recherche." : "Aucune séance enregistrée pour le moment."}
            </p>
            <Button onClick={() => setPage("create-workout")} icon={<Plus size={16} />}>
              Planifier une séance
            </Button>
          </div>
        </Card>
      ) : (
        <div className="workout-grid">
          {filtered.map((workout, index) => (
            <Card className="workout-card" key={workout.id}>
              <div className="workout-cover">
                <span>{`0${index + 1}`}</span>
                <Dumbbell size={28} />
                {workout.type && <Tag>{workout.type.toUpperCase()}</Tag>}
              </div>

              <div>
                <h2>{workout.name}</h2>
                <p>{workout.notes || "Séance d'entraînement personnalisée."}</p>
              </div>

              <div className="workout-badges">
                {workout.duration && (
                  <span>
                    <Clock3 size={15} />
                    {workout.duration} min
                  </span>
                )}
                {workout.intensity && (
                  <span>
                    <Flame size={15} />
                    {workout.intensity}
                  </span>
                )}
                {workout.exerciseCount !== undefined && (
                  <span>
                    <Dumbbell size={15} />
                    {workout.exerciseCount} exercices
                  </span>
                )}
              </div>

              {workout.scheduledAt && (
                <div style={{ fontSize: "0.82rem", color: "#a1a1aa", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Calendar size={14} />
                  Planifié : {new Date(workout.scheduledAt).toLocaleDateString()}
                </div>
              )}

              <div className="card-actions" style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => handleDelete(workout.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "transparent",
                    color: "#ef4444",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                  }}
                >
                  <Trash2 size={16} />
                  Supprimer
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
