import { useState, useEffect } from "react"
import { Pencil, Check, AlertCircle } from "lucide-react"
import {
  Card,
  SectionTitle,
  Tag,
  Button,
  Input,
  Select,
} from "../../components/common"
import { useAuth } from "../../context/AuthContext"
import { api } from "../../services/api"

export function ProfilePage() {
  const { user, refreshUser } = useAuth()

  // États du profil modifiable
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [age, setAge] = useState<number | string>("")
  const [height, setHeight] = useState<number | string>("")
  const [fitnessGoal, setFitnessGoal] = useState("muscle_gain")
  const [experienceLevel, setExperienceLevel] = useState("intermediate")

  // États de feedback
  const [savedNotification, setSavedNotification] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Remplir les champs avec les données réelles du backend
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "")
      setLastName(user.lastName || "")
      setAge(user.age ?? "")
      setHeight(user.height ?? "")
      setFitnessGoal(user.fitnessGoal || "muscle_gain")
      setExperienceLevel(user.experienceLevel || "intermediate")
    }
  }, [user])

  const handleSave = async () => {
    setIsSaving(true)
    setErrorMessage(null)

    try {
      await api.updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        age: age ? Number(age) : null,
        height: height ? Number(height) : null,
        fitnessGoal,
        experienceLevel,
      })

      // Mettre à jour l'utilisateur dans le contexte React
      await refreshUser()

      setSavedNotification(true)
      setTimeout(() => setSavedNotification(false), 2500)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message)
      } else {
        setErrorMessage("Erreur lors de la sauvegarde du profil.")
      }
    } finally {
      setIsSaving(false)
    }
  }

  const initials = user
    ? `${user.firstName[0]?.toUpperCase() || ""}${user.lastName[0]?.toUpperCase() || ""}`
    : "YA"

  const memberSinceFormatted = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("fr-FR", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Récemment"

  return (
    <div className="content-narrow page-stack">
      <Card className="profile-hero">
        <div className="avatar xl">{initials}</div>
        <div>
          <Tag>{(experienceLevel || "intermediate").toUpperCase()} ATHLETE</Tag>
          <h1>{user?.fullName || `${firstName} ${lastName}`}</h1>
          <p>Building strength, one rep at a time.</p>
        </div>
        <Button secondary icon={<Pencil size={16} />}>
          Edit profile
        </Button>
      </Card>

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
        <SectionTitle
          title="Personal information"
          detail="Keep your profile details up to date"
        />
        <div className="form-grid">
          <Input
            label="First name"
            placeholder="Prénom"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <Input
            label="Last name"
            placeholder="Nom"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <Input
            label="Email address"
            type="email"
            value={user?.email || ""}
            disabled
          />
          <Input
            label="Age"
            placeholder="Ex: 28"
            type="number"
            value={String(age)}
            onChange={(e) => setAge(e.target.value)}
          />
          <Input
            label="Height (cm)"
            placeholder="Ex: 180"
            type="number"
            value={String(height)}
            onChange={(e) => setHeight(e.target.value)}
          />
          <Select
            label="Fitness goal"
            value={fitnessGoal}
            onChange={(e) => setFitnessGoal(e.target.value)}
          >
            <option value="muscle_gain">Muscle gain</option>
            <option value="weight_loss">Weight loss</option>
            <option value="general_fitness">General fitness</option>
          </Select>
          <Select
            label="Experience level"
            value={experienceLevel}
            onChange={(e) => setExperienceLevel(e.target.value)}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </Select>
        </div>
      </Card>

      <Card>
        <SectionTitle title="Account information" />
        <div className="account-row">
          <div>
            <b>Member since</b>
            <span>{memberSinceFormatted}</span>
          </div>
          <div>
            <b>Plan</b>
            <span>FitTrack Athlete</span>
          </div>
          <div>
            <b>Roles</b>
            <span>{user?.roles?.join(", ") || "ROLE_USER"}</span>
          </div>
        </div>
        <div className="form-actions">
          <Button secondary>Cancel</Button>
          <Button
            icon={<Check size={16} />}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving
              ? "Saving..."
              : savedNotification
              ? "Saved!"
              : "Save changes"}
          </Button>
        </div>
      </Card>
    </div>
  )
}
