import { Plus, Clock3, Dumbbell, CalendarDays } from "lucide-react"
import { Card, Tag, Button, Progress } from "../../components/common"
import { initialPrograms } from "../../data/mockData"
import type { Page } from "../../types"

interface ProgramsPageProps {
  setPage: (p: Page) => void
}

export function ProgramsPage({ setPage }: ProgramsPageProps) {
  return (
    <div className="page-stack">
      <div className="page-actions">
        <div>
          <h1>My programs</h1>
          <p>Structured plans built for meaningful progress.</p>
        </div>
        <Button icon={<Plus size={17} />}>Create program</Button>
      </div>

      <div className="program-grid">
        {initialPrograms.map((program, index) => (
          <Card className="program-card" key={program.id}>
            <div className="program-number">{`0${index + 1}`}</div>
            <div>
              <Tag>{program.status}</Tag>
              <h2>{program.name}</h2>
              <p>{program.description}</p>
            </div>

            <div className="program-meta">
              <span>
                <Clock3 size={15} />
                {program.duration}
              </span>
              <span>
                <Dumbbell size={15} />
                {program.frequency}
              </span>
              <span>
                <CalendarDays size={15} />
                Started {program.startDate}
              </span>
            </div>

            <div className="program-progress">
              <div>
                <span>Program progress</span>
                <b>{`${program.progress}%`}</b>
              </div>
              <Progress value={program.progress} />
            </div>

            <div className="card-actions">
              <Button onClick={() => setPage("program-details")}>
                View details
              </Button>
              <Button secondary>Edit</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
