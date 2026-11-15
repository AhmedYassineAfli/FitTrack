import { useState, useEffect } from "react"
import { Flame, Weight, Gauge, Dumbbell, Target, Plus } from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import {
  Card,
  SectionTitle,
  Tag,
  KpiCard,
  Button,
} from "../../components/common"
import { api, type MeasurementItem, type WorkoutSessionItem, type ProgramItem } from "../../services/api"
import type { Page } from "../../types"

interface DashboardPageProps {
  setPage?: (page: Page) => void
}

export function DashboardPage({ setPage }: DashboardPageProps) {
  const { user } = useAuth()
  const displayName = user?.firstName || "Athlète"

  const [latestMeasurement, setLatestMeasurement] = useState<MeasurementItem | null>(null)
  const [workouts, setWorkouts] = useState<WorkoutSessionItem[]>([])
  const [programs, setPrograms] = useState<ProgramItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true)
        const [mRes, wRes, pRes] = await Promise.all([
          api.getMeasurements().catch(() => ({ measurements: [] as MeasurementItem[], total: 0, latest: undefined })),
          api.getWorkouts().catch(() => ({ workouts: [] as WorkoutSessionItem[], total: 0 })),
          api.getPrograms().catch(() => ({ programs: [] as ProgramItem[], total: 0 })),
        ])
        setLatestMeasurement(mRes.latest || mRes.measurements[0] || null)
        setWorkouts(wRes.workouts || [])
        setPrograms(pRes.programs || [])
      } catch (err) {
        console.error("Erreur de chargement du dashboard :", err)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  const activePrograms = programs.filter((p) => p.status === "active")

  return (
    <div className="page-stack">
      <div className="hero-row">
        <div>
          <span className="eyebrow">TABLEAU DE BORD PERSONNEL</span>
          <h1>Prêt pour votre séance, {displayName} ?</h1>
          <p>Voici l'état réel de vos programmes, séances et mensurations.</p>
        </div>
        <div className="streak">
          <Flame size={19} />
          <b>{workouts.length} séances</b>
          <span>enregistrées</span>
        </div>
      </div>

      {/* KPI réels basés sur la BDD */}
      <div className="kpi-grid">
        <KpiCard
          icon={<Weight size={20} />}
          label="Poids actuel"
          value={latestMeasurement?.weight ? `${latestMeasurement.weight}` : "—"}
          unit="kg"
          trend={latestMeasurement ? `du ${latestMeasurement.date}` : "À renseigner"}
        />
        <KpiCard
          icon={<Gauge size={20} />}
          label="Indice IMC"
          value={latestMeasurement?.bmi ? `${latestMeasurement.bmi}` : "—"}
          trend={latestMeasurement?.bmi ? (latestMeasurement.bmi < 25 ? "Optimal" : "Surpoids") : "Profil requis"}
        />
        <KpiCard
          icon={<Dumbbell size={20} />}
          label="Séances planifiées"
          value={workouts.length.toString()}
          trend="Historique BDD"
        />
        <KpiCard
          icon={<Target size={20} />}
          label="Programmes actifs"
          value={activePrograms.length.toString()}
          trend={`${programs.length} au total`}
        />
      </div>

      <div className="dashboard-grid">
        {/* Dernières séances réelles */}
        <Card className="span-2">
          <SectionTitle
            title="Dernières séances d'entraînement"
            detail="Données réelles issues de MySQL"
            action={
              setPage ? (
                <Button secondary onClick={() => setPage("workouts")}>
                  Gérer les séances
                </Button>
              ) : undefined
            }
          />
          {loading ? (
            <div style={{ padding: "20px", color: "#a1a1aa" }}>Chargement...</div>
          ) : workouts.length === 0 ? (
            <div style={{ padding: "20px", color: "#a1a1aa" }}>
              Aucune séance enregistrée pour l'instant. Rendez-vous dans <b>Workouts</b> pour en créer une.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
              {workouts.slice(0, 4).map((w) => (
                <div
                  key={w.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 16px",
                    background: "#141416",
                    borderRadius: "8px",
                    border: "1px solid #27272a",
                  }}
                >
                  <div>
                    <b style={{ color: "#fff", display: "block" }}>{w.name}</b>
                    <small style={{ color: "#a1a1aa" }}>
                      {w.type ? w.type.toUpperCase() : "Musculation"} • {w.duration || 60} min
                    </small>
                  </div>
                  {w.intensity && <Tag>{w.intensity}</Tag>}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Programme actif ou action rapide */}
        <Card>
          <SectionTitle title="Vos Programmes Sportifs" />
          {activePrograms.length > 0 ? (
            <div style={{ marginTop: "14px" }}>
              <Tag>PROGRAMME EN COURS</Tag>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "10px 0 6px 0", color: "#fff" }}>
                {activePrograms[0].name}
              </h3>
              <p style={{ color: "#a1a1aa", fontSize: "0.9rem", marginBottom: "14px" }}>
                {activePrograms[0].description || "Programme personnalisé."}
              </p>
              <div style={{ fontSize: "0.85rem", color: "#22c55e", fontWeight: 600 }}>
                Progression : {activePrograms[0].progress}%
              </div>
            </div>
          ) : (
            <div style={{ marginTop: "14px", color: "#a1a1aa", fontSize: "0.9rem" }}>
              <p style={{ marginBottom: "14px" }}>Vous n'avez pas encore de programme actif.</p>
              {setPage && (
                <Button onClick={() => setPage("programs")} icon={<Plus size={16} />}>
                  Découvrir les programmes
                </Button>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
