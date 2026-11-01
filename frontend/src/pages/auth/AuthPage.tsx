import { useState } from "react"
import { Eye, EyeOff, ChevronRight, Sparkles } from "lucide-react"
import { Brand, Button, IconButton, Input } from "../../components/common"
import type { Page } from "../../types"

const AUTH_HERO_IMAGE =
  "https://images.unsplash.com/photo-1754475118668-64ac3f3b2559?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=85&w=1600"

interface AuthPageProps {
  mode: "login" | "register"
  setPage: (p: Page) => void
}

export function AuthPage({ mode, setPage }: AuthPageProps) {
  const [showPassword, setShowPassword] = useState(false)
  const isLogin = mode === "login"

  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <Brand />
        <div className="auth-form">
          <span className="eyebrow">
            {isLogin ? "WELCOME BACK" : "START YOUR JOURNEY"}
          </span>
          <h1>{isLogin ? "Stronger starts here." : "Build your best self."}</h1>
          <p>
            {isLogin
              ? "Sign in to continue tracking your performance."
              : "Create your account and turn intention into progress."}
          </p>

          {!isLogin && <Input label="Full name" placeholder="Alex Morgan" />}

          <Input
            label="Email address"
            placeholder="you@example.com"
            type="email"
          />

          <Input
            label="Password"
            placeholder="At least 8 characters"
            type={showPassword ? "text" : "password"}
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
                {["Weight loss", "Muscle gain", "General fitness"].map(
                  (goal, idx) => (
                    <label key={goal}>
                      <input
                        name="goal"
                        type="radio"
                        defaultChecked={idx === 1}
                      />
                      <span>{goal}</span>
                    </label>
                  ),
                )}
              </div>
            </div>
          )}

          <Button className="full" onClick={() => setPage("dashboard")}>
            {isLogin ? "Sign in" : "Create account"}
            <ChevronRight size={17} />
          </Button>

          <p className="auth-switch">
            {isLogin ? "New to FitTrack?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => setPage(isLogin ? "register" : "login")}
            >
              {isLogin ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>

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
