
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { adminApi } from '@/lib/api'
import Cookies from 'js-cookie'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  emailVerified: boolean
  lastLoginAt: string | null
  createdAt: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const refreshUser = async () => {
    try {
      const token = Cookies.get('adminToken')
      if (!token) {
        setUser(null)
        return
      }

      const response = await adminApi.get('/auth/me')
      setUser(response.data.data)
    } catch (error) {
      console.error('Failed to refresh user:', error)
      setUser(null)
      Cookies.remove('adminToken')
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await adminApi.post('/auth/login', { email, password })
      const { user: userData, token } = response.data.data
      
      Cookies.set('adminToken', token, { expires: 1 }) // 1 day
      setUser(userData)
      
      router.push('/dashboard')
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed')
    }
  }

  const logout = async () => {
    try {
      await adminApi.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      Cookies.remove('adminToken')
      setUser(null)
      router.push('/auth/login')
    }
  }

  useEffect(() => {
    const initAuth = async () => {
      await refreshUser()
      setIsLoading(false)
    }

    initAuth()
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
