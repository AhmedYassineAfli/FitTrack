import type { ComponentType } from "react"

export type Page = "login" | "register" | "dashboard" | "profile" | "measurements" | "workouts" | "create-workout" | "exercises" | "statistics" | "programs" | "program-details" | "calendar" | "achievements" | "settings"

export interface IconProps {
  size?: number
  strokeWidth?: number
  className?: string
}

export interface NavItem {
  id: Page
  label: string
  icon: ComponentType<IconProps>
}

export interface KpiItem {
  label: string
  value: string
  unit?: string
  trend: string
  iconName?: string
}

export interface WorkoutSession {
  id: string
  name: string
  type: string
  duration: string
  intensity: "High" | "Medium" | "Low"
  date: string
  exercisesCount: string
}

export interface ExerciseItem {
  name: string
  muscle: string
  level: "Beginner" | "Intermediate" | "Advanced"
}

export interface ProgramItem {
  id: string
  name: string
  description: string
  duration: string
  frequency: string
  progress: number
  status: "ACTIVE" | "DRAFT"
  startDate: string
}

export interface ScheduleDay {
  day: string
  date: number
  title: string
  detail: string
  status: "COMPLETED" | "UP NEXT" | "PLANNED"
}

export interface MeasurementRecord {
  id: string
  date: string
  weight: string
  bodyFat: string
  waist: string
  chest: string
  arms: string
}

export interface BadgeItem {
  id: string
  title: string
  description: string
  category: "Consistency" | "Strength" | "Endurance" | "Progression"
  unlocked: boolean
  progress?: number
}

export interface UserProfile {
  name: string
  email: string
  age: string
  height: string
  goal: string
  level: string
  memberSince: string
  plan: string
  visibility: string
}
