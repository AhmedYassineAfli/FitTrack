import { useState, useEffect } from "react"
import { Check, AlertCircle } from "lucide-react"
import { Card, SectionTitle, Button, Select } from "../../components/common"
import { useAuth } from "../../context/AuthContext"
import { api } from "../../services/api"

export function SettingsPage() {
  const { user, refreshUser } = useAuth()
  const [saved, setSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [measurementSystem, setMeasurementSystem] = useState("metric")
  const [weekStartsOn, setWeekStartsOn] = useState("monday")
  const [defaultWorkoutDuration, setDefaultWorkoutDuration] = useState("60")
  const [workoutReminders, setWorkoutReminders] = useState(true)
  const [weeklyProgressReport, setWeeklyProgressReport] = useState(true)
  const [achievementUpdates, setAchievementUpdates] = useState(true)

  useEffect(() => {
    if (user) {
      const prefs = (user as unknown as { preferences?: Record<string, unknown> }).preferences || {}
      if (prefs.measurementSystem) setMeasurementSystem(String(prefs.measurementSystem))
      if (prefs.weekStartsOn) setWeekStartsOn(String(prefs.weekStartsOn))
      if (prefs.defaultWorkoutDuration) setDefaultWorkoutDuration(String(prefs.defaultWorkoutDuration))
      const notifs = (prefs.notifications as Record<string, boolean>) || {}
      if (typeof notifs.workoutReminders === "boolean") setWorkoutReminders(notifs.workoutReminders)
      if (typeof notifs.weeklyProgressReport === "boolean") setWeeklyProgressReport(notifs.weeklyProgressReport)
      if (typeof notifs.achievementUpdates === "boolean") setAchievementUpdates(notifs.achievementUpdates)
    }
  }, [user])

  const handleSave = async () => {
    setIsSaving(true)
    setErrorMessage(null)

    try {
      await api.updatePreferences({
        measurementSystem,
        weekStartsOn,
        defaultWorkoutDuration: Number(defaultWorkoutDuration),
        notifications: {
          workoutReminders,
          weeklyProgressReport,
          achievementUpdates,
        },
      })
      await refreshUser()
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message)
      } else {
        setErrorMessage("Erreur lors de la sauvegarde des préférences.")
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="content-narrow page-stack">
      <div>
        <h1>Settings</h1>
        <p>Manage preferences for your FitTrack experience.</p>
      </div>

      {errorMessage && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 14px",
            borderRadius: "8px",
            backgroundColor: "rgba(239, 68, 68, 0.15)",
            border: "1px solid rgba(239, 68, 68, 0.4)",
            color: "#ef4444",
            fontSize: "14px",
          }}
        >
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      <Card>
        <SectionTitle title="Training preferences" />
        <div className="form-grid">
          <Select
            label="Measurement system"
            value={measurementSystem}
            onChange={(e) => setMeasurementSystem(e.target.value)}
          >
            <option value="metric">Metric (kg, cm)</option>
            <option value="imperial">Imperial (lbs, in)</option>
          </Select>
          <Select
            label="Week starts on"
            value={weekStartsOn}
            onChange={(e) => setWeekStartsOn(e.target.value)}
          >
            <option value="monday">Monday</option>
            <option value="sunday">Sunday</option>
          </Select>
          <Select
            label="Default workout duration"
            value={defaultWorkoutDuration}
            onChange={(e) => setDefaultWorkoutDuration(e.target.value)}
          >
            <option value="45">45 minutes</option>
            <option value="60">60 minutes</option>
            <option value="75">75 minutes</option>
            <option value="90">90 minutes</option>
          </Select>
        </div>
      </Card>

      <Card>
        <SectionTitle title="Notifications" />
        <label className="toggle-row">
          <span>
            <b>Workout reminders</b>
            <small>Receive helpful updates and reminders</small>
          </span>
          <input
            type="checkbox"
            checked={workoutReminders}
            onChange={(e) => setWorkoutReminders(e.target.checked)}
          />
          <i />
        </label>
        <label className="toggle-row">
          <span>
            <b>Weekly progress report</b>
            <small>Receive weekly performance summary</small>
          </span>
          <input
            type="checkbox"
            checked={weeklyProgressReport}
            onChange={(e) => setWeeklyProgressReport(e.target.checked)}
          />
          <i />
        </label>
        <label className="toggle-row">
          <span>
            <b>Achievement updates</b>
            <small>Get notified when unlocking new badges</small>
          </span>
          <input
            type="checkbox"
            checked={achievementUpdates}
            onChange={(e) => setAchievementUpdates(e.target.checked)}
          />
          <i />
        </label>
      </Card>

      <div className="form-actions">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          icon={saved ? <Check size={16} /> : undefined}
        >
          {isSaving
            ? "Saving..."
            : saved
            ? "Saved preferences"
            : "Save preferences"}
        </Button>
      </div>
    </div>
  )
}
