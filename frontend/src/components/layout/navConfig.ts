import {
  Activity,
  Award,
  BarChart3,
  CalendarDays,
  CircleUserRound,
  Dumbbell,
  LayoutDashboard,
  Target,
  Zap,
} from "lucide-react"
import type { NavItem, Page } from "../../types"

export const navItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "profile", label: "My Profile", icon: CircleUserRound },
  { id: "measurements", label: "Measurements", icon: Activity },
  { id: "workouts", label: "Workouts", icon: Dumbbell },
  { id: "exercises", label: "Exercise Library", icon: Zap },
  { id: "statistics", label: "Statistics", icon: BarChart3 },
  { id: "programs", label: "Programs", icon: Target },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "achievements", label: "Achievements", icon: Award },
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
