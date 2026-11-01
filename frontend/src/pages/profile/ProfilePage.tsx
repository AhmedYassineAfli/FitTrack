import { useState } from "react"
import { Pencil, Check } from "lucide-react"
import {
  Card,
  SectionTitle,
  Tag,
  Button,
  Input,
  Select,
} from "../../components/common"
import { currentUser } from "../../data/mockData"

export function ProfilePage() {
  const [profile, setProfile] = useState(currentUser)
  const [savedNotification, setSavedNotification] = useState(false)

  const handleSave = () => {
    setSavedNotification(true)
    setTimeout(() => setSavedNotification(false), 2500)
  }

  return (
    <div className="content-narrow page-stack">
      <Card className="profile-hero">
        <div className="avatar xl">AM</div>
        <div>
          <Tag>INTERMEDIATE ATHLETE</Tag>
          <h1>{profile.name}</h1>
          <p>Building strength, one rep at a time.</p>
        </div>
        <Button secondary icon={<Pencil size={16} />}>
          Edit profile
        </Button>
      </Card>

      <Card>
        <SectionTitle
          title="Personal information"
          detail="Keep your profile details up to date"
        />
        <div className="form-grid">
          <Input
            label="Full name"
            placeholder="Alex Morgan"
            defaultValue={profile.name}
            onChange={(e) =>
              setProfile((prev) => ({ ...prev, name: e.target.value }))
            }
          />
          <Input
            label="Email address"
            type="email"
            placeholder="alex@fittrack.app"
            defaultValue={profile.email}
            onChange={(e) =>
              setProfile((prev) => ({ ...prev, email: e.target.value }))
            }
          />
          <Input
            label="Age"
            placeholder="28"
            defaultValue={profile.age}
            onChange={(e) =>
              setProfile((prev) => ({ ...prev, age: e.target.value }))
            }
          />
          <Input
            label="Height"
            placeholder="180 cm"
            defaultValue={profile.height}
            onChange={(e) =>
              setProfile((prev) => ({ ...prev, height: e.target.value }))
            }
          />
          <Select
            label="Fitness goal"
            defaultValue={profile.goal}
            onChange={(e) =>
              setProfile((prev) => ({ ...prev, goal: e.target.value }))
            }
          >
            <option>Muscle gain</option>
            <option>Weight loss</option>
            <option>General fitness</option>
          </Select>
          <Select
            label="Experience level"
            defaultValue={profile.level}
            onChange={(e) =>
              setProfile((prev) => ({ ...prev, level: e.target.value }))
            }
          >
            <option>Intermediate</option>
            <option>Beginner</option>
            <option>Advanced</option>
          </Select>
        </div>
      </Card>

      <Card>
        <SectionTitle title="Account information" />
        <div className="account-row">
          <div>
            <b>Member since</b>
            <span>{profile.memberSince}</span>
          </div>
          <div>
            <b>Plan</b>
            <span>{profile.plan}</span>
          </div>
          <div>
            <b>Profile visibility</b>
            <span>{profile.visibility}</span>
          </div>
        </div>
        <div className="form-actions">
          <Button secondary>Cancel</Button>
          <Button icon={<Check size={16} />} onClick={handleSave}>
            {savedNotification ? "Saved!" : "Save changes"}
          </Button>
        </div>
      </Card>
    </div>
  )
}
