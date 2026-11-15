import { useState, useEffect } from "react"
import { Plus, Trash2, Scale, Percent, Activity } from "lucide-react"
import {
  Card,
  SectionTitle,
  Tag,
  Button,
} from "../../components/common"
import { api, type MeasurementItem } from "../../services/api"

export function MeasurementsPage() {
  const [measurements, setMeasurements] = useState<MeasurementItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Formulaire d'ajout
  const [showModal, setShowModal] = useState(false)
  const [weight, setWeight] = useState("")
  const [bodyFat, setBodyFat] = useState("")
  const [waist, setWaist] = useState("")
  const [chest, setChest] = useState("")
  const [arms, setArms] = useState("")
  const [hips, setHips] = useState("")
  const [thighs, setThighs] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const loadMeasurements = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getMeasurements()
      setMeasurements(data.measurements)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur de chargement des mesures")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMeasurements()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!weight) return

    try {
      setSubmitting(true)
      await api.createMeasurement({
        weight: Number(weight),
        bodyFat: bodyFat ? Number(bodyFat) : undefined,
        waist: waist ? Number(waist) : undefined,
        chest: chest ? Number(chest) : undefined,
        arms: arms ? Number(arms) : undefined,
        hips: hips ? Number(hips) : undefined,
        thighs: thighs ? Number(thighs) : undefined,
      })
      setShowModal(false)
      setWeight("")
      setBodyFat("")
      setWaist("")
      setChest("")
      setArms("")
      await loadMeasurements()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erreur lors de l'enregistrement")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm("Supprimer cette mesure ?")) return
    try {
      await api.deleteMeasurement(id)
      setMeasurements((prev) => prev.filter((m) => m.id !== id))
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erreur lors de la suppression")
    }
  }

  const latest = measurements[0]

  return (
    <div className="page-stack">
      <div className="page-actions">
        <div>
          <h1>Body measurements</h1>
          <p>Track changes, weight and BMI evolution (Sprint 2).</p>
        </div>
        <Button onClick={() => setShowModal(true)} icon={<Plus size={17} />}>
          Add measurement
        </Button>
      </div>

      {error && (
        <div style={{ padding: "12px", background: "#ef444420", border: "1px solid #ef4444", borderRadius: "8px", color: "#f87171" }}>
          {error}
        </div>
      )}

      {/* Modal d'ajout de mesure */}
      {showModal && (
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
              maxWidth: "480px",
              width: "100%",
            }}
          >
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "16px", color: "#fff" }}>
              Nouvelle Mesure Corporelle
            </h2>
            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "#a1a1aa", marginBottom: "6px" }}>
                    Poids (kg) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="ex: 75.5"
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
                    Masse Grasse (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={bodyFat}
                    onChange={(e) => setBodyFat(e.target.value)}
                    placeholder="ex: 15.2"
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
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "#a1a1aa", marginBottom: "6px" }}>
                    Taille (cm)
                  </label>
                  <input
                    type="number"
                    value={waist}
                    onChange={(e) => setWaist(e.target.value)}
                    placeholder="80"
                    style={{ width: "100%", padding: "8px 12px", background: "#09090b", border: "1px solid #27272a", borderRadius: "8px", color: "#fff" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "#a1a1aa", marginBottom: "6px" }}>
                    Poitrine (cm)
                  </label>
                  <input
                    type="number"
                    value={chest}
                    onChange={(e) => setChest(e.target.value)}
                    placeholder="100"
                    style={{ width: "100%", padding: "8px 12px", background: "#09090b", border: "1px solid #27272a", borderRadius: "8px", color: "#fff" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "#a1a1aa", marginBottom: "6px" }}>
                    Bras (cm)
                  </label>
                  <input
                    type="number"
                    value={arms}
                    onChange={(e) => setArms(e.target.value)}
                    placeholder="36"
                    style={{ width: "100%", padding: "8px 12px", background: "#09090b", border: "1px solid #27272a", borderRadius: "8px", color: "#fff" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <Button secondary type="button" onClick={() => setShowModal(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Enregistrement..." : "Enregistrer la mesure"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Résumé KPIs issus de la base MySQL */}
      <div className="summary-grid">
        <Card className="summary-stat">
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Activity size={16} color="#22c55e" /> IMC Calculé
          </span>
          <b>{latest?.bmi ? latest.bmi : "—"}</b>
          {latest?.bmi ? (
            <Tag>
              {latest.bmi < 18.5 ? "Sous-poids" : latest.bmi < 25 ? "Optimal" : latest.bmi < 30 ? "Surpoids" : "Obésité"}
            </Tag>
          ) : (
            <small>Renseignez votre taille dans Profil</small>
          )}
        </Card>
        <Card className="summary-stat">
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Percent size={16} color="#22c55e" /> Masse grasse
          </span>
          <b>{latest?.bodyFat ? `${latest.bodyFat}%` : "—"}</b>
          <small>{latest ? `Mesuré le ${latest.date}` : "Aucune donnée"}</small>
        </Card>
        <Card className="summary-stat">
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Scale size={16} color="#22c55e" /> Poids actuel
          </span>
          <b>
            {latest?.weight ? `${latest.weight} ` : "— "}
            {latest?.weight && <em>kg</em>}
          </b>
          <small>{latest ? `Dernière pesée : ${latest.date}` : "Aucune pesée"}</small>
        </Card>
      </div>

      <Card>
        <SectionTitle title="Historique des mesures (MySQL)" />
        {loading ? (
          <div style={{ padding: "30px", textAlign: "center", color: "#a1a1aa" }}>
            Chargement des mesures...
          </div>
        ) : measurements.length === 0 ? (
          <div style={{ padding: "30px", textAlign: "center", color: "#a1a1aa" }}>
            Aucune mesure enregistrée pour le moment.
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Poids (kg)</th>
                  <th>Masse grasse</th>
                  <th>Taille (cm)</th>
                  <th>Poitrine (cm)</th>
                  <th>Bras (cm)</th>
                  <th>IMC</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {measurements.map((record) => (
                  <tr key={record.id}>
                    <td>{record.date}</td>
                    <td>{record.weight !== null ? `${record.weight} kg` : "—"}</td>
                    <td>{record.bodyFat !== null ? `${record.bodyFat}%` : "—"}</td>
                    <td>{record.waist !== null ? `${record.waist} cm` : "—"}</td>
                    <td>{record.chest !== null ? `${record.chest} cm` : "—"}</td>
                    <td>{record.arms !== null ? `${record.arms} cm` : "—"}</td>
                    <td>{record.bmi !== null ? <b>{record.bmi}</b> : "—"}</td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleDelete(record.id)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#ef4444",
                          cursor: "pointer",
                          padding: "4px",
                        }}
                        title="Supprimer la mesure"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
