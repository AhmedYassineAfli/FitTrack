import { useState, type ReactNode } from "react"
import { Shell } from "./components/layout"
import {
  AuthPage,
  DashboardPage,
  ProfilePage,
  MeasurementsPage,
  WorkoutsPage,
  CreateWorkoutPage,
  ExercisesPage,
  StatisticsPage,
  ProgramsPage,
  ProgramDetailsPage,
  CalendarPage,
  AchievementsPage,
  SettingsPage,
} from "./pages"
import type { Page } from "./types"

export default function App() {
  const [page, setPage] = useState<Page>("dashboard")

  if (page === "login" || page === "register") {
    return <AuthPage mode={page} setPage={setPage} />
  }

  const renderContent = (): ReactNode => {
    switch (page) {
      case "dashboard":
        return <DashboardPage setPage={setPage} />
      case "profile":
        return <ProfilePage />
      case "measurements":
        return <MeasurementsPage />
      case "workouts":
        return <WorkoutsPage setPage={setPage} />
      case "create-workout":
        return <CreateWorkoutPage setPage={setPage} />
      case "exercises":
        return <ExercisesPage />
      case "statistics":
        return <StatisticsPage />
      case "programs":
        return <ProgramsPage setPage={setPage} />
      case "program-details":
        return <ProgramDetailsPage setPage={setPage} />
      case "calendar":
        return <CalendarPage />
      case "achievements":
        return <AchievementsPage />
      case "settings":
        return <SettingsPage />
      default:
        return <DashboardPage setPage={setPage} />
    }
  }

  return (
    <Shell page={page} setPage={setPage}>
      {renderContent()}
    </Shell>
  )
}
