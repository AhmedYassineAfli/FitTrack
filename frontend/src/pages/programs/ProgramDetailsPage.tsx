import { ChevronLeft, Pencil, Check, ChevronRight, Clock3 } from "lucide-react"
import {
  Card,
  SectionTitle,
  Tag,
  Button,
  Progress,
} from "../../components/common"
import { programScheduleDays } from "../../data/mockData"
import type { Page } from "../../types"

interface ProgramDetailsPageProps {
  setPage: (p: Page) => void
}

export function ProgramDetailsPage({ setPage }: ProgramDetailsPageProps) {
  return (
    <div className="page-stack">
      <button
        type="button"
        className="back"
        onClick={() => setPage("programs")}
      >
        <ChevronLeft size={17} /> Back to programs
      </button>

      <Card className="program-hero">
        <div>
          <Tag>ACTIVE PROGRAM</Tag>
          <h1>Strength Foundation</h1>
          <p>
            An 8-week progression built to develop confident technique and
            total-body strength.
          </p>
        </div>
        <Button secondary icon={<Pencil size={16} />}>
          Edit program
        </Button>

        <div className="program-hero-stats">
          <div>
            <span>Objective</span>
            <b>Build strength</b>
          </div>
          <div>
            <span>Duration</span>
            <b>8 weeks</b>
          </div>
          <div>
            <span>Schedule</span>
            <b>4 days / week</b>
          </div>
          <div>
            <span>Current week</span>
            <b>6 of 8</b>
          </div>
        </div>
        <Progress value={72} />
      </Card>

      <div className="details-grid">
        <Card className="span-2">
          <SectionTitle
            title="Weekly training schedule"
            detail="Week 6 · June 16—22"
          />
          <div className="schedule-list">
            {programScheduleDays.map((schedule) => (
              <div className="schedule-row" key={schedule.day}>
                <div className="day-box">
                  <span>{schedule.day}</span>
                  <b>{schedule.date}</b>
                </div>
                <span
                  className={`status-dot ${
                    schedule.status === "COMPLETED" ? "done" : ""
                  }`}
                >
                  {schedule.status === "COMPLETED" && <Check size={13} />}
                </span>
                <div>
                  <h3>{schedule.title}</h3>
                  <p>{schedule.detail}</p>
                </div>
                <Tag muted>{schedule.status}</Tag>
                <ChevronRight size={18} />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle title="Progression" />
          <div className="ring">
            <div>
              <b>72%</b>
              <span>complete</span>
            </div>
          </div>
          <div className="milestones">
            <span>
              <Check size={14} />
              24 workouts completed
            </span>
            <span>
              <Check size={14} />3 personal records
            </span>
            <span>
              <Clock3 size={14} />8 sessions remaining
            </span>
          </div>
        </Card>
      </div>
    </div>
  )
}
