import { useState } from "react"
import { Check } from "lucide-react"
import { Card, SectionTitle, Button, Select } from "../../components/common"

const notificationOptions = [
  "Workout reminders",
  "Weekly progress report",
  "Achievement updates",
]

export function SettingsPage() {
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

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
            <option>Imperial (lbs, in)</option>
          </Select>
          <Select label="Week starts on">
            <option>Monday</option>
            <option>Sunday</option>
          </Select>
          <Select label="Default workout duration">
            <option>60 minutes</option>
            <option>45 minutes</option>
            <option>75 minutes</option>
            <option>90 minutes</option>
          </Select>
          <Select label="Fitness level">
            <option>Intermediate</option>
            <option>Beginner</option>
            <option>Advanced</option>
          </Select>
        </div>
      </Card>

      <Card>
        <SectionTitle title="Notifications" />
        {notificationOptions.map((item) => (
          <label className="toggle-row" key={item}>
            <span>
              <b>{item}</b>
              <small>Receive helpful updates and reminders</small>
            </span>
            <input type="checkbox" defaultChecked />
            <i />
          </label>
        ))}
      </Card>

      <div className="form-actions">
        <Button
          onClick={handleSave}
          icon={saved ? <Check size={16} /> : undefined}
        >
          {saved ? "Saved preferences" : "Save preferences"}
        </Button>
      </div>
    </div>
  )
}
