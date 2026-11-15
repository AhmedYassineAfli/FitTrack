import { useState, useEffect, type ReactNode } from "react"
import { Shell } from "./components/layout"
import { useAuth } from "./context/AuthContext"
import {
  AuthPage,
  DashboardPage,
  ProfilePage,
  MeasurementsPage,
  WorkoutsPage,
  CreateWorkoutPage,
  ExercisesPage,
  ProgramsPage,
  SettingsPage,
} from "./pages"
import type { Page } from "./types"

export default function App() {
  const { user, token, loading } = useAuth()
  // Par défaut : page de connexion
  const [page, setPage] = useState<Page>("login")

  const isAuthenticated = Boolean(token && user)

  // Si l'utilisateur est connecté et arrive sur login, on bascule sur dashboard
  useEffect(() => {
    if (isAuthenticated && (page === "login" || page === "register")) {
      setPage("dashboard")
    }
  }, [isAuthenticated, page])

  // Pendant la vérification du token au démarrage
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#080808",
          color: "#22c55e",
          fontFamily: "sans-serif",
          fontSize: "18px",
          fontWeight: 600,
        }}
      >
        FitTrack...
      </div>
    )
  }

  // Si l'utilisateur n'est PAS connecté -> forcer la page login ou register
  if (!isAuthenticated) {
    return (
      <AuthPage
        mode={page === "register" ? "register" : "login"}
        setPage={setPage}
      />
    )
  }

  // Si connecté mais que page = login/register
  if (page === "login" || page === "register") {
    return (
      <AuthPage
        mode={page}
        setPage={setPage}
      />
    )
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
      case "programs":
        return <ProgramsPage setPage={setPage} />
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
