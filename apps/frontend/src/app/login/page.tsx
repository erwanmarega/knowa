"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { SignInPage, Testimonial } from "@/components/ui/sign-in"
import { useAuth } from "@/context/AuthContext"
import { loginUser } from "@/lib/api"

const testimonials: Testimonial[] = [
  {
    avatarSrc: "https://randomuser.me/api/portraits/women/57.jpg",
    name: "Sarah Chen",
    handle: "@sarahdigital",
    text: "Amazing platform! The user experience is seamless and the features are exactly what I needed."
  },
  {
    avatarSrc: "https://randomuser.me/api/portraits/men/64.jpg",
    name: "Marcus Johnson",
    handle: "@marcustech",
    text: "This service has transformed how I work. Clean design, powerful features, and excellent support."
  },
  {
    avatarSrc: "https://randomuser.me/api/portraits/men/32.jpg",
    name: "David Martinez",
    handle: "@davidcreates",
    text: "I've tried many platforms, but this one stands out. Intuitive, reliable, and genuinely helpful."
  },
]

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setLoading(true)
    const form = new FormData(event.currentTarget)
    const email = form.get('email') as string
    const password = form.get('password') as string

    try {
      const { token, user } = await loginUser(email, password)
      login(token, user)
      router.push('/accueil')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connexion échouée')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative bg-background text-foreground">
      <SignInPage
        heroImageSrc="https://images.unsplash.com/photo-1642615835477-d303d7dc9ee9?w=2160&q=80"
        testimonials={testimonials}
        onSignIn={handleSignIn}
        onGoogleSignIn={() => {}}
        onResetPassword={() => {}}
        onCreateAccount={() => router.push('/signup')}
        title={loading ? <span className="font-light tracking-tighter text-white">Connexion...</span> : undefined}
      />
      {error && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-red-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-2xl text-sm shadow-lg z-50 whitespace-nowrap">
          {error}
        </div>
      )}
    </div>
  )
}
