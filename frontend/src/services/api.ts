/**
 * Service API pour communiquer avec le Backend Symfony FitTrack.
 * URL du backend : http://127.0.0.1:8000/api
 */

const API_BASE_URL = "http://127.0.0.1:8000/api"
const TOKEN_KEY = "fittrack_jwt_token"

export type UserRole = "athlete" | "admin"

export interface UserResponse {
  id: number
  firstName: string
  lastName: string
  fullName: string
  email: string
  age: number | null
  height: number | null
  fitnessGoal: string | null
  experienceLevel: string | null
  role: UserRole
  roles: string[]
  createdAt: string
  updatedAt?: string
}

export interface RegisterPayload {
  firstName: string
  lastName: string
  email: string
  password: string
  fitnessGoal?: string
}

// =================== TYPES SPRINT 2 ===================

export interface ProgramItem {
  id: number
  name: string
  description: string | null
  durationWeeks: number | null
  frequency: string | null
  status: "active" | "draft" | string
  startDate: string | null
  progress: number
  createdAt: string
  updatedAt: string
}

export interface SessionExerciseItem {
  id: number
  exercise: {
    id: number
    name: string
    muscle: string
    level: string
  }
  sets: number
  reps: number | null
  weight: number | null
  restTime: number | null
  orderIndex: number
  notes: string | null
}

export interface WorkoutSessionItem {
  id: number
  name: string
  type: string | null
  duration: number | null
  intensity: "high" | "medium" | "low" | string | null
  scheduledAt: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  exerciseCount: number
  exercises?: SessionExerciseItem[]
}

export interface MeasurementItem {
  id: number
  date: string
  weight: number | null
  bodyFat: number | null
  waist: number | null
  chest: number | null
  arms: number | null
  hips: number | null
  thighs: number | null
  bmi: number | null
  createdAt: string
}

export const api = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
  },

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token)
  },

  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY)
  },

  /**
   * Wrapper générique pour fetch avec gestion automatique du token JWT.
   */
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken()
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      const message =
        data.error ||
        data.message ||
        (data.errors ? Object.values(data.errors).join(", ") : "Une erreur est survenue")
      throw new Error(message)
    }

    return data as T
  },

  // =========================================================================
  // SPRINT 1 : AUTHENTIFICATION & PROFIL
  // =========================================================================

  async login(email: string, password: string): Promise<{ token: string }> {
    const data = await this.request<{ token: string }>("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
    this.setToken(data.token)
    return data
  },

  async register(payload: RegisterPayload): Promise<{ message: string; user: UserResponse }> {
    return this.request<{ message: string; user: UserResponse }>("/register", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },

  async getCurrentUser(): Promise<UserResponse> {
    return this.request<UserResponse>("/me")
  },

  async updateProfile(
    payload: Partial<UserResponse>
  ): Promise<{ message: string; user: UserResponse }> {
    return this.request<{ message: string; user: UserResponse }>("/me", {
      method: "PUT",
      body: JSON.stringify(payload),
    })
  },

  async updatePreferences(
    preferences: Record<string, unknown>
  ): Promise<{ message: string; preferences: Record<string, unknown> }> {
    return this.request<{ message: string; preferences: Record<string, unknown> }>(
      "/me/preferences",
      {
        method: "PUT",
        body: JSON.stringify(preferences),
      }
    )
  },

  async updatePassword(
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<{ message: string }> {
    return this.request<{ message: string }>("/me/password", {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
    })
  },

  // =========================================================================
  // SPRINT 1 : EXERCICES ET CATÉGORIES
  // =========================================================================

  async getCategories(): Promise<
    Array<{ id: number; name: string; description: string | null; count: number }>
  > {
    return this.request("/categories")
  },

  async getExercises(params?: {
    q?: string
    category?: string
    level?: string
  }): Promise<
    Array<{
      id: number
      name: string
      muscle: string
      level: "Beginner" | "Intermediate" | "Advanced"
      description: string | null
      category: { id: number; name: string } | null
      createdAt: string
    }>
  > {
    const searchParams = new URLSearchParams()
    if (params?.q) searchParams.append("q", params.q)
    if (params?.category && params.category !== "All")
      searchParams.append("category", params.category)
    if (params?.level && params.level !== "All")
      searchParams.append("level", params.level)

    const queryStr = searchParams.toString()
    return this.request(`/exercises${queryStr ? `?${queryStr}` : ""}`)
  },

  async createExercise(payload: {
    name: string
    muscle: string
    level: "Beginner" | "Intermediate" | "Advanced"
    description?: string
    categoryName?: string
  }): Promise<{ message: string; exercise: unknown }> {
    return this.request("/exercises", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },

  async deleteExercise(id: number): Promise<{ message: string }> {
    return this.request(`/exercises/${id}`, {
      method: "DELETE",
    })
  },

  // =========================================================================
  // SPRINT 2 : PROGRAMMES D'ENTRAÎNEMENT
  // =========================================================================

  async getPrograms(): Promise<{ programs: ProgramItem[]; total: number }> {
    return this.request<{ programs: ProgramItem[]; total: number }>("/programs")
  },

  async getProgram(id: number): Promise<{ program: ProgramItem }> {
    return this.request<{ program: ProgramItem }>(`/programs/${id}`)
  },

  async createProgram(payload: {
    name: string
    description?: string
    durationWeeks?: number
    frequency?: string
    status?: "active" | "draft"
    startDate?: string
    progress?: number
  }): Promise<{ message: string; program: ProgramItem }> {
    return this.request<{ message: string; program: ProgramItem }>("/programs", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },

  async updateProgram(
    id: number,
    payload: Partial<ProgramItem>
  ): Promise<{ message: string; program: ProgramItem }> {
    return this.request<{ message: string; program: ProgramItem }>(`/programs/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    })
  },

  async deleteProgram(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/programs/${id}`, {
      method: "DELETE",
    })
  },

  // =========================================================================
  // SPRINT 2 : SÉANCES (WORKOUTS)
  // =========================================================================

  async getWorkouts(): Promise<{ workouts: WorkoutSessionItem[]; total: number }> {
    return this.request<{ workouts: WorkoutSessionItem[]; total: number }>("/workouts")
  },

  async getWorkout(id: number): Promise<{ workout: WorkoutSessionItem }> {
    return this.request<{ workout: WorkoutSessionItem }>(`/workouts/${id}`)
  },

  async createWorkout(payload: {
    name: string
    type?: string
    duration?: number
    intensity?: string
    scheduledAt?: string
    notes?: string
    exercises?: Array<{
      exerciseId: number
      sets?: number
      reps?: number
      weight?: number
      restTime?: number
      notes?: string
    }>
  }): Promise<{ message: string; workout: WorkoutSessionItem }> {
    return this.request<{ message: string; workout: WorkoutSessionItem }>("/workouts", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },

  async updateWorkout(
    id: number,
    payload: Partial<WorkoutSessionItem>
  ): Promise<{ message: string; workout: WorkoutSessionItem }> {
    return this.request<{ message: string; workout: WorkoutSessionItem }>(`/workouts/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    })
  },

  async deleteWorkout(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/workouts/${id}`, {
      method: "DELETE",
    })
  },

  async addExerciseToWorkout(
    workoutId: number,
    payload: {
      exerciseId: number
      sets?: number
      reps?: number
      weight?: number
      restTime?: number
      notes?: string
    }
  ): Promise<{ message: string; workout: WorkoutSessionItem }> {
    return this.request<{ message: string; workout: WorkoutSessionItem }>(
      `/workouts/${workoutId}/exercises`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    )
  },

  // =========================================================================
  // SPRINT 2 : MESURES CORPORELLES
  // =========================================================================

  async getMeasurements(): Promise<{
    measurements: MeasurementItem[]
    total: number
    latest?: MeasurementItem
  }> {
    return this.request<{
      measurements: MeasurementItem[]
      total: number
      latest?: MeasurementItem
    }>("/measurements")
  },

  async createMeasurement(payload: {
    date?: string
    weight?: number
    bodyFat?: number
    waist?: number
    chest?: number
    arms?: number
    hips?: number
    thighs?: number
  }): Promise<{ message: string; measurement: MeasurementItem }> {
    return this.request<{ message: string; measurement: MeasurementItem }>("/measurements", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },

  async deleteMeasurement(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/measurements/${id}`, {
      method: "DELETE",
    })
  },

  // =========================================================================
  // LOGOUT
  // =========================================================================

  async logout(): Promise<void> {
    try {
      await this.request("/logout", { method: "POST" })
    } catch {
      // Ignorer toute erreur serveur lors du logout
    } finally {
      this.removeToken()
    }
  },
}
