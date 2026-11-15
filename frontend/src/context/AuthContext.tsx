import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react"
import { api, type UserResponse, type RegisterPayload } from "../services/api"

interface AuthContextType {
  user: UserResponse | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null)
  const [token, setToken] = useState<string | null>(api.getToken())
  const [loading, setLoading] = useState<boolean>(true)

  const refreshUser = async () => {
    try {
      const currentUser = await api.getCurrentUser()
      setUser(currentUser)
    } catch {
      api.removeToken()
      setToken(null)
      setUser(null)
    }
  }

  // Au chargement de React, si un token existe, on charge le profil réel
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = api.getToken()
      if (savedToken) {
        await refreshUser()
      }
      setLoading(false)
    }
    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password)
    setToken(res.token)
    await refreshUser()
  }

  const register = async (payload: RegisterPayload) => {
    await api.register(payload)
    // Connecter directement après inscription
    await login(payload.email, payload.password)
  }

  const logout = async () => {
    try {
      await api.logout()
    } catch {
      // Ignorer toute erreur
    }
    api.removeToken()
    setUser(null)
    setToken(null)
  }

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
