import { useState } from "react"
import { Plus, ChevronLeft, ChevronRight } from "lucide-react"
import {
  Card,
  SectionTitle,
  Tag,
  Button,
  IconButton,
} from "../../components/common"
import { calendarMonthWorkouts } from "../../data/mockData"

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

const weekDays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]

const upcomingSessions = [
  {
    tag: "TODAY",
    title: "Push strength",
    detail: "18:30 · 60 min",
    isNext: true,
  },
  {
    tag: "THU 19",
    title: "Upper body",
    detail: "07:00 · 65 min",
    isNext: false,
  },
  {
    tag: "SAT 21",
    title: "Conditioning",
    detail: "09:30 · 45 min",
    isNext: false,
  },
]

export function CalendarPage() {
  const [monthIndex, setMonthIndex] = useState(5) // June (default)

  const handlePrevMonth = () => {
    setMonthIndex((prev) => Math.max(0, prev - 1))
  }

  const handleNextMonth = () => {
    setMonthIndex((prev) => Math.min(months.length - 1, prev + 1))
  }

  const handleToday = () => {
    setMonthIndex(5)
  }

  return (
    <div className="page-stack">
      <div className="page-actions">
        <div>
          <h1>Training calendar</h1>
          <p>Plan your work. Protect your consistency.</p>
        </div>
        <Button icon={<Plus size={17} />}>Schedule workout</Button>
      </div>

      <div className="calendar-layout">
        <Card className="calendar-card">
          <div className="calendar-head">
            <h2>{months[monthIndex]} 2025</h2>
            <div>
              <IconButton label="Previous month" onClick={handlePrevMonth}>
                <ChevronLeft size={18} />
              </IconButton>
              <button type="button" className="today-btn" onClick={handleToday}>
                Today
              </button>
              <IconButton label="Next month" onClick={handleNextMonth}>
                <ChevronRight size={18} />
              </IconButton>
            </div>
          </div>

          <div className="weekdays">
            {weekDays.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          <div className="calendar-grid">
            {Array.from({ length: 35 }, (_, index) => {
              const day = index - 5
              const isToday = day === 16 && monthIndex === 5
              const isOutside = day < 1 || day > 30

              return (
                <div
                  key={index}
                  className={`${isToday ? "today" : ""} ${
                    isOutside ? "outside" : ""
                  }`}
                >
                  <b>{day > 0 && day <= 30 ? day : ""}</b>
                  {calendarMonthWorkouts[day] && !isOutside && (
                    <span className={day < 18 ? "completed" : ""}>
                      {calendarMonthWorkouts[day]}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </Card>

        <Card className="calendar-side">
          <SectionTitle title="Upcoming sessions" detail="This week" />

          {upcomingSessions.map((session) => (
            <div className="session" key={session.tag}>
              <div>
                <span>{session.tag}</span>
                <b>{session.title}</b>
                <small>{session.detail}</small>
              </div>
              {session.isNext && <Tag>UP NEXT</Tag>}
            </div>
          ))}

          <div className="calendar-legend">
            <span>
              <i className="completed" />
              Completed
            </span>
            <span>
              <i />
              Planned
            </span>
            <span>
              <i className="missed" />
              Missed
            </span>
          </div>
        </Card>
      </div>
    </div>
  )
}
