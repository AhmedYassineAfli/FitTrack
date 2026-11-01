import { useState } from "react"
import { Trophy, Award, Target, Check } from "lucide-react"
import { Card, Tag, Progress } from "../../components/common"
import { achievementsBadges } from "../../data/mockData"

const badgeCategories = [
  "All",
  "Consistency",
  "Strength",
  "Endurance",
  "Progression",
]

export function AchievementsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")

  const filteredBadges = achievementsBadges.filter(
    (badge) =>
      selectedCategory === "All" || badge.category === selectedCategory,
  )

  const unlockedCount = achievementsBadges.filter((b) => b.unlocked).length
  const totalCount = achievementsBadges.length
  const completionPercentage = Math.round((unlockedCount / totalCount) * 100)

  return (
    <div className="page-stack">
      <div className="achievement-summary">
        <div>
          <span className="eyebrow">YOUR TROPHY ROOM</span>
          <h1>{`${unlockedCount} badges earned`}</h1>
          <p>Every milestone tells the story of your discipline.</p>
        </div>

        <div className="big-trophy">
          <Trophy size={48} />
        </div>

        <div>
          <b>{`${completionPercentage}%`}</b>
          <span>Overall completion</span>
          <Progress value={completionPercentage} />
        </div>
      </div>

      <div className="filter-chips">
        {badgeCategories.map((category) => (
          <button
            key={category}
            type="button"
            className={selectedCategory === category ? "active" : ""}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="badge-grid">
        {filteredBadges.map((badge, index) => (
          <Card
            className={`badge-card ${!badge.unlocked ? "locked" : ""}`}
            key={badge.id}
          >
            <div className="badge-emblem">
              {badge.unlocked ? <Award size={34} /> : <Target size={34} />}
              <span>{`0${index + 1}`}</span>
            </div>
            <Tag muted>{badge.category}</Tag>
            <h3>{badge.title}</h3>
            <p>{badge.description}</p>
            <div className="unlock-state">
              {badge.unlocked ? (
                <>
                  <Check size={15} /> Unlocked
                </>
              ) : (
                <>{`${badge.progress || 62}% complete`}</>
              )}
            </div>
            {!badge.unlocked && <Progress value={badge.progress || 62} />}
          </Card>
        ))}
      </div>
    </div>
  )
}
