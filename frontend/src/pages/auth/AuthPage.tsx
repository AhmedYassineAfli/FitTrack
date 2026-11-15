import { useState, type FormEvent } from "react"
import { Eye, EyeOff, ChevronRight, Sparkles, AlertCircle } from "lucide-react"
import { Brand, Button, IconButton, Input } from "../../components/common"
import { useAuth } from "../../context/AuthContext"
import type { Page } from "../../types"

const AUTH_HERO_IMAGE =
  "https://images.unsplash.com/photo-1754475118668-64ac3f3b2559?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=85&w=1600"

interface AuthPageProps {
  mode: "login" | "register"
  setPage: (p: Page) => void
}

export function AuthPage({ mode, setPage }: AuthPageProps) {
  const { login, register } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const isLogin = mode === "login"

  // Champs de formulaire
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [goal, setGoal] = useState("muscle_gain")

  // États de validation et chargement
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    // 1. Validation de base côté client
    if (!email.trim() || !password.trim()) {
      setErrorMessage("Veuillez remplir l'adresse email et le mot de passe.")
      return
    }

    if (!isLogin) {
      if (!fullName.trim()) {
        setErrorMessage("Veuillez renseigner votre nom complet.")
        return
      }
      if (password !== confirmPassword) {
        setErrorMessage("Les mots de passe ne correspondent pas.")
        return
      }
      if (password.length < 6) {
        setErrorMessage("Le mot de passe doit comporter au moins 6 caractères.")
        return
      }
    }

    setIsSubmitting(true)

    try {
      if (isLogin) {
        // Appel POST /api/login via Symfony
        await login(email.trim(), password)
      } else {
        // Séparer prénom et nom
        const nameParts = fullName.trim().split(" ")
        const firstName = nameParts[0] || "Athlète"
        const lastName = nameParts.slice(1).join(" ") || "FitTrack"

        // Appel POST /api/register via Symfony
        await register({
          firstName,
          lastName,
          email: email.trim(),
          password,
          fitnessGoal: goal,
        })
      }

      // Connexion réussie -> redirection vers le dashboard
      setPage("dashboard")
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message)
      } else {
        setErrorMessage("Identifiants incorrects ou problème serveur.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <Brand />
        <form className="auth-form" onSubmit={handleSubmit}>
          <span className="eyebrow">
            {isLogin ? "WELCOME BACK" : "START YOUR JOURNEY"}
          </span>
          <h1>{isLogin ? "Stronger starts here." : "Build your best self."}</h1>
          <p>
            {isLogin
              ? "Sign in to continue tracking your performance."
              : "Create your account and turn intention into progress."}
          </p>

          {/* Affichage d'erreur en cas de problème */}
          {errorMessage && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 14px",
                borderRadius: "8px",
                backgroundColor: "rgba(239, 68, 68, 0.15)",
                border: "1px solid rgba(239, 68, 68, 0.4)",
                color: "#ef4444",
                fontSize: "14px",
                marginBottom: "12px",
              }}
            >
              <AlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          {!isLogin && (
            <Input
              label="Full name"
              placeholder="Alex Morgan"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          )}

          <Input
            label="Email address"
            placeholder="you@example.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Password"
            placeholder="At least 6 characters"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            suffix={
              <IconButton
                label="Toggle password visibility"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </IconButton>
            }
          />

          {!isLogin && (
            <Input
              label="Confirm password"
              placeholder="Repeat your password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          )}

          {isLogin ? (
            <div className="auth-options">
              <label>
                <input type="checkbox" />
                Remember me
              </label>
              <button type="button">Forgot password?</button>
            </div>
          ) : (
            <div className="goal-select">
              <span>Primary fitness goal</span>
              <div>
                {[
                  { label: "Weight loss", val: "weight_loss" },
                  { label: "Muscle gain", val: "muscle_gain" },
                  { label: "General fitness", val: "general_fitness" },
                ].map(({ label, val }) => (
                  <label key={val}>
                    <input
                      name="goal"
                      type="radio"
                      checked={goal === val}
                      onChange={() => setGoal(val)}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <Button
            className="full"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Connecting..."
              : isLogin
              ? "Sign in"
              : "Create account"}
            <ChevronRight size={17} />
          </Button>

          <p className="auth-switch">
            {isLogin ? "New to FitTrack?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setErrorMessage(null)
                setPage(isLogin ? "register" : "login")
              }}
            >
              {isLogin ? "Create an account" : "Sign in"}
            </button>
          </p>
        </form>

        <small className="copyright">
          © 2025 FitTrack. Built for progress.
        </small>
      </section>

      <section
        className="auth-visual"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(8,8,8,.05), rgba(8,8,8,.88)), url(${AUTH_HERO_IMAGE})`,
        }}
      >
        <div className="visual-stat">
          <Sparkles size={20} />
          <span>THIS MONTH</span>
          <b>12 workouts</b>
          <small>You're in the top 14% of athletes</small>
        </div>
        <div className="visual-quote">
          <q>
            Discipline is choosing between what you want now and what you want
            most.
          </q>
          <span>FITTRACK MINDSET</span>
        </div>
      </section>
    </main>
  )
}
