import React, { createContext, useState, useEffect, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const AUTH_STORAGE_KEY = '@streams_app:auth'

const MOCK_CREDENTIALS = {
  email: 'teste@gmail.com',
  password: 'teste123',
}

interface User {
  email: string
  name: string
}

interface AuthContextData {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<boolean>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadStoredAuth() {
      try {
        const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY)
        if (stored) {
          setUser(JSON.parse(stored))
        }
      } catch {
        await AsyncStorage.removeItem(AUTH_STORAGE_KEY)
      } finally {
        setIsLoading(false)
      }
    }
    loadStoredAuth()
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    if (
      email.toLowerCase() === MOCK_CREDENTIALS.email &&
      password === MOCK_CREDENTIALS.password
    ) {
      const userData: User = { email, name: 'Usuário Teste' }
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData))
      setUser(userData)
      return true
    }
    return false
  }, [])

  const signOut = useCallback(async () => {
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY)
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
