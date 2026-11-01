import { useState } from "react"
import { ChevronLeft, Plus, X, Check } from "lucide-react"
import {
  Card,
  SectionTitle,
  Button,
  IconButton,
  Input,
  Select,
} from "../../components/common"
import type { Page } from "../../types"

interface CreateWorkoutPageProps {
  setPage: (p: Page) => void
}

export function CreateWorkoutPage({ setPage }: CreateWorkoutPageProps) {
  const [exercises, setExercises] = useState([1, 2])

  const handleAddExercise = () => {
    setExercises((prev) => [...prev, Date.now()])
  }

  const handleRemoveExercise = (id: number) => {
    setExercises((prev) => prev.filter((item) => item !== id))
  }

  return (
    <div className="content-narrow page-stack">
      <div className="page-actions">
        <div>
          <button
            type="button"
            className="back"
            onClick={() => setPage("workouts")}
          >
            <ChevronLeft size={17} /> Back to workouts
          </button>
          <h1>Create workout</h1>
          <p>Design a focused session around your training objective.</p>
        </div>
      </div>

      <Card>
        <SectionTitle title="Workout details" />
        <div className="form-grid">
          <Input label="Workout name" placeholder="e.g. Upper Body Strength" />
          <Select label="Workout type">
            <option>Strength</option>
            <option>Hypertrophy</option>
            <option>Conditioning</option>
          </Select>
          <Input label="Date & time" type="datetime-local" />
          <Input label="Duration" placeholder="60 minutes" />
          <Select label="Intensity">
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </Select>
        </div>
      </Card>

      <Card>
        <SectionTitle
          title="Exercises"
          detail={`${exercises.length} exercises in this session`}
          action={
            <Button
              onClick={handleAddExercise}
              secondary
              icon={<Plus size={16} />}
            >
              Add exercise
            </Button>
          }
        />
        <div className="exercise-builder">
          {exercises.map((id, index) => (
            <div className="exercise-row" key={id}>
              <div className="drag-index">{`0${index + 1}`}</div>
              <Select label="Exercise">
                <option>
                  {index % 2 === 0
                    ? "Barbell bench press"
                    : "Incline dumbbell press"}
                </option>
                <option>Overhead press</option>
                <option>Romanian deadlift</option>
                <option>Barbell back squat</option>
              </Select>
              <Input label="Sets" placeholder="4" />
              <Input label="Reps" placeholder={index % 2 === 0 ? "6" : "10"} />
              <Input
                label="Weight"
                placeholder={index % 2 === 0 ? "85 kg" : "28 kg"}
              />
              <Input label="Rest" placeholder="90 sec" />
              <IconButton
                label="Remove"
                onClick={() => handleRemoveExercise(id)}
              >
                <X size={18} />
              </IconButton>
            </div>
          ))}
        </div>
      </Card>

      <div className="form-actions">
        <Button secondary onClick={() => setPage("workouts")}>
          Cancel
        </Button>
        <Button onClick={() => setPage("workouts")} icon={<Check size={16} />}>
          Save workout
        </Button>
      </div>
    </div>
  )
}
