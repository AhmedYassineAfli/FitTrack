import { useState, useEffect } from "react"
import { Plus, Clock3, Dumbbell, CalendarDays, Trash2, CheckCircle2 } from "lucide-react"
import { Card, Tag, Button, Progress } from "../../components/common"
import { api, type ProgramItem } from "../../services/api"
import type { Page } from "../../types"

interface ProgramsPageProps {
  setPage: (p: Page) => void
}

export function ProgramsPage({ setPage }: ProgramsPageProps) {
  const [programs, setPrograms] = useState<ProgramItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // État du modal de création
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [durationWeeks, setDurationWeeks] = useState(8)
  const [frequency, setFrequency] = useState("4 séances / semaine")
  const [status, setStatus] = useState<"active" | "draft">("active")
  const [submitting, setSubmitting] = useState(false)

  const loadPrograms = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getPrograms()
      setPrograms(data.programs)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur de chargement des programmes")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPrograms()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    try {
      setSubmitting(true)
      await api.createProgram({
        name,
        description,
        durationWeeks: Number(durationWeeks),
        frequency,
        status,
        progress: 0,
      })
      setShowCreateModal(false)
      setName("")
      setDescription("")
      await loadPrograms()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erreur lors de la création")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce programme ?")) return
    try {
      await api.deleteProgram(id)
      setPrograms((prev) => prev.filter((p) => p.id !== id))
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erreur lors de la suppression")
    }
  }

  return (
    <div className="page-stack">
      <div className="page-actions">
        <div>
          <h1>My programs</h1>
          <p>Structured plans built for meaningful progress (Sprint 2).</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} icon={<Plus size={17} />}>
          Create program
        </Button>
      </div>

      {error && (
        <div style={{ padding: "12px", background: "#ef444420", border: "1px solid #ef4444", borderRadius: "8px", color: "#f87171" }}>
          {error}
        </div>
      )}

      {/* Modal de création rapide */}
      {showCreateModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#141416",
              border: "1px solid #27272a",
              borderRadius: "14px",
              padding: "24px",
              maxWidth: "500px",
              width: "100%",
            }}
          >
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "16px", color: "#fff" }}>
              Nouveau Programme Sportif
            </h2>
            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "#a1a1aa", marginBottom: "6px" }}>
                  Nom du programme *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ex: Prise de Masse 4 Jours"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    background: "#09090b",
                    border: "1px solid #27272a",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "#a1a1aa", marginBottom: "6px" }}>
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Objectif du programme, conseils..."
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    background: "#09090b",
                    border: "1px solid #27272a",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "#a1a1aa", marginBottom: "6px" }}>
                    Durée (semaines)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="52"
                    value={durationWeeks}
                    onChange={(e) => setDurationWeeks(Number(e.target.value))}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      background: "#09090b",
                      border: "1px solid #27272a",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "#a1a1aa", marginBottom: "6px" }}>
                    Statut
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as "active" | "draft")}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      background: "#09090b",
                      border: "1px solid #27272a",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  >
                    <option value="active">Actif</option>
                    <option value="draft">Brouillon</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "#a1a1aa", marginBottom: "6px" }}>
                  Fréquence hebdomadaire
                </label>
                <input
                  type="text"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  placeholder="ex: 4 séances / semaine"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    background: "#09090b",
                    border: "1px solid #27272a",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <Button secondary type="button" onClick={() => setShowCreateModal(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Création..." : "Enregistrer le programme"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#a1a1aa" }}>
          Chargement des programmes depuis la base de données...
        </div>
      ) : programs.length === 0 ? (
        <Card className="program-card">
          <div style={{ textAlign: "center", padding: "40px 20px", width: "100%" }}>
            <p style={{ color: "#a1a1aa", marginBottom: "16px" }}>
              Aucun programme d'entraînement créé pour le moment.
            </p>
            <Button onClick={() => setShowCreateModal(true)} icon={<Plus size={16} />}>
              Créer votre premier programme
            </Button>
          </div>
        </Card>
      ) : (
        <div className="program-grid">
          {programs.map((program, index) => (
            <Card className="program-card" key={program.id}>
              <div className="program-number">{`0${index + 1}`}</div>
              <div>
                <Tag>{program.status.toUpperCase()}</Tag>
                <h2>{program.name}</h2>
                <p>{program.description || "Aucune description renseignée."}</p>
              </div>

              <div className="program-meta">
                <span>
                  <Clock3 size={15} />
                  {program.durationWeeks ? `${program.durationWeeks} semaines` : "Non spécifié"}
                </span>
                <span>
                  <Dumbbell size={15} />
                  {program.frequency || "Libre"}
                </span>
                <span>
                  <CalendarDays size={15} />
                  {program.startDate ? `Début : ${program.startDate}` : "Pas encore démarré"}
                </span>
              </div>

              <div className="program-progress">
                <div>
                  <span>Progression globale</span>
                  <b>{`${program.progress}%`}</b>
                </div>
                <Progress value={program.progress} />
              </div>

              <div className="card-actions" style={{ display: "flex", justifyContent: "space-between" }}>
                <Button secondary onClick={() => setPage("workouts")}>
                  Voir les séances
                </Button>
                <button
                  type="button"
                  onClick={() => handleDelete(program.id)}
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
