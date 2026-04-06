import React, { createContext, useState, useEffect, useCallback } from 'react'
import { api, setOnUnauthorized } from '../services/api'
import {
  getAccessToken,
  setAccessToken,
  setRefreshToken,
  clearTokens,
} from '../services/token-storage'
import type { UserData } from '../types'

interface AuthContextData {
  user: UserData | null
  isAuthenticated: boolean
  isLoading: boolean
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function restoreSession() {
      try {
        const token = await getAccessToken()
        if (!token) return

        const response = await api.get<{ user: UserData }>('/account')
        if (response.success) {
          setUser(response.data.user)
        } else {
          await clearTokens()
        }
      } catch {
        await clearTokens()
      } finally {
        setIsLoading(false)
      }
    }

    setOnUnauthorized(() => {
      clearTokens()
      setUser(null)
    })

    restoreSession()
  }, [])

  const signIn = useCallback(
    async (
      email: string,
      password: string,
    ): Promise<{ success: boolean; error?: string }> => {
      const response = await api.post<{
        user: UserData
        accessToken: string
        refreshToken: string
      }>('/auth/login', { email, password })

      if (response.success) {
        await setAccessToken(response.data.accessToken)
        await setRefreshToken(response.data.refreshToken)

        const accountResponse = await api.get<{ user: UserData }>('/account')
        if (accountResponse.success) {
          setUser(accountResponse.data.user)
        } else {
          setUser(response.data.user)
        }

        return { success: true }
      }

      const message = response.error?.[0]?.message ?? ''

      if (message.toLowerCase().includes('bloqueada') || message.includes('429')) {
        return {
          success: false,
          error: 'Conta temporariamente bloqueada. Tente novamente mais tarde',
        }
      }

      return { success: false, error: 'Credenciais inválidas' }
    },
    [],
  )

  const signOut = useCallback(async () => {
    api.post('/auth/logout').catch(() => {})
    await clearTokens()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
