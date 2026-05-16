"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useAuth } from "@/context/AuthContext"
import { registerUser } from "@/lib/api"

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.022 35.026 44 30.038 44 24c0-1.341-.138-2.65-.389-3.917z" />
  </svg>
)

const GlassInputWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm transition-colors focus-within:border-violet-400/70 focus-within:bg-violet-500/10">
    {children}
  </div>
)

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const username = form.get('username') as string
    const email = form.get('email') as string
    const password = form.get('password') as string

    try {
      const { token, user } = await registerUser(username, email, password)
      login(token, user)
      router.push('/accueil')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Inscription échouée')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-[100dvh] flex flex-col md:flex-row font-geist w-[100dvw] bg-black text-white">
      <section className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex flex-col gap-6">
            <h1 className="animate-element animate-delay-100 text-4xl md:text-5xl font-semibold leading-tight">
              {loading ? 'Inscription...' : 'Create Account'}
            </h1>
            <p className="animate-element animate-delay-200 text-gray-400">
              Join our platform to explore the universe with us.
            </p>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="animate-element animate-delay-300">
                <label className="text-sm font-medium text-gray-400">Username</label>
                <GlassInputWrapper>
                  <input
                    name="username"
                    type="text"
                    required
                    placeholder="Choose a username"
                    className="w-full bg-transparent text-sm text-white p-4 placeholder-gray-500 rounded-2xl focus:outline-none"
                  />
                </GlassInputWrapper>
              </div>

              <div className="animate-element animate-delay-400">
                <label className="text-sm font-medium text-gray-400">Email Address</label>
                <GlassInputWrapper>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="Enter your email"
                    className="w-full bg-transparent text-sm text-white p-4 placeholder-gray-500 rounded-2xl focus:outline-none"
                  />
                </GlassInputWrapper>
              </div>

              <div className="animate-element animate-delay-500">
                <label className="text-sm font-medium text-gray-400">Password</label>
                <GlassInputWrapper>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      placeholder="Create a password"
                      className="w-full bg-transparent text-sm text-white p-4 pr-12 placeholder-gray-500 rounded-2xl focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
                      )}
                    </button>
                  </div>
                </GlassInputWrapper>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="animate-element animate-delay-600 w-full rounded-2xl bg-primary py-4 font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                Sign Up
              </button>
            </form>

            <div className="animate-element animate-delay-700 relative flex items-center justify-center">
              <span className="w-full border-t border-white/10"></span>
              <span className="px-4 text-sm text-gray-400 bg-black absolute">Or continue with</span>
            </div>

            <button
              type="button"
              className="animate-element animate-delay-800 w-full flex items-center justify-center gap-3 border border-white/20 rounded-2xl py-4 hover:bg-white/10 transition-colors"
            >
              <GoogleIcon />
              Continue with Google
            </button>

            <p className="animate-element animate-delay-900 text-center text-sm text-gray-400">
              Already have an account?{" "}
              <a href="/login" className="text-violet-400 hover:underline transition-colors">
                Sign In
              </a>
            </p>
          </div>
        </div>
      </section>

      <Image
        src="/espacee.jpg"
        alt="Astronaut"
        width={900}
        height={900}
        className="rounded-2xl shadow-lg object-cover"
      />

      {error && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-red-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-2xl text-sm shadow-lg z-50 whitespace-nowrap">
          {error}
        </div>
      )}
    </div>
  )
}
