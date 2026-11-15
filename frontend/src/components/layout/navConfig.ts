import {
  Activity,
  CircleUserRound,
  Dumbbell,
  LayoutDashboard,
  Target,
  Zap,
} from "lucide-react"
import type { NavItem, Page } from "../../types"

/**
 * Navigation FitTrack — Uniquement les fonctionnalités réelles (Sprints 1 & 2)
 * Les pages du Sprint 3 (Calendar, Statistics, Achievements) sont réservées à la prochaine phase.
 */
export const navItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "profile", label: "My Profile", icon: CircleUserRound },
  { id: "measurements", label: "Measurements", icon: Activity },
  { id: "workouts", label: "Workouts", icon: Dumbbell },
  { id: "exercises", label: "Exercise Library", icon: Zap },
  { id: "programs", label: "Programs", icon: Target },
]

export const pageTitles: Record<Page, string> = {
  login: "Login",
  register: "Register",
  dashboard: "Performance overview",
  profile: "My profile",
  measurements: "Body measurements",
  workouts: "My workouts",
  "create-workout": "Create workout",
  exercises: "Exercise library",
  statistics: "Performance analytics",
  programs: "Training programs",
  "program-details": "Program details",
  calendar: "Training calendar",
  achievements: "Achievements",
  settings: "Settings",
}
