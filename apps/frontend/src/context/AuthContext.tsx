"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getToken, getUser, saveAuth, clearAuth, AuthUser } from '@/lib/auth'

interface AuthContextType {
  user: AuthUser | null
  token: string | null
  login: (token: string, user: AuthUser) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setUser(getUser())
    setToken(getToken())
    setIsLoading(false)
  }, [])

  const login = (tok: string, usr: AuthUser) => {
    saveAuth(tok, usr)
    setToken(tok)
    setUser(usr)
  }

  const logout = () => {
    clearAuth()
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
