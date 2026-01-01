"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303..." />
    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819..." />
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86..." />
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8..." />
  </svg>
)

const GlassInputWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm transition-colors focus-within:border-violet-400/70 focus-within:bg-violet-500/10">
    {children}
  </div>
)

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  return (
    <div className="h-[100dvh] flex flex-col md:flex-row font-geist w-[100dvw] bg-black text-white">
      <section className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex flex-col gap-6">
            <h1 className="animate-element animate-delay-100 text-4xl md:text-5xl font-semibold leading-tight">
              Create Account
            </h1>
            <p className="animate-element animate-delay-200 text-gray-400">
              Join our platform to explore the universe with us.
            </p>

            <form
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault()
                router.push("/accueil")
              }}
            >
              <div className="animate-element animate-delay-300">
                <label className="text-sm font-medium text-gray-400">Username</label>
                <GlassInputWrapper>
                  <input
                    name="username"
                    type="text"
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
                className="animate-element animate-delay-600 w-full rounded-2xl bg-primary py-4 font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Sign Up
              </button>
            </form>

            <div className="animate-element animate-delay-700 relative flex items-center justify-center">
              <span className="w-full border-t border-white/10"></span>
              <span className="px-4 text-sm text-gray-400 bg-black absolute">Or continue with</span>
            </div>

            <button className="animate-element animate-delay-800 w-full flex items-center justify-center gap-3 border border-white/20 rounded-2xl py-4 hover:bg-white/10 transition-colors">
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
    </div>
  )
}
