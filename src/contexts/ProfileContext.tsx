import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
} from 'react'
import { api } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import type { Profile } from '../types'

interface ProfileContextData {
  profiles: Profile[]
  activeProfile: Profile | null
  isLoading: boolean
  maxProfiles: number
  selectProfile: (profileId: string) => void
  loadProfiles: () => Promise<void>
  createProfile: (data: {
    name: string
    isKid: boolean
  }) => Promise<{ success: boolean; error?: string }>
  updateProfile: (
    id: string,
    data: { name?: string; isKid?: boolean },
  ) => Promise<{ success: boolean; error?: string }>
  deleteProfile: (
    id: string,
  ) => Promise<{ success: boolean; error?: string }>
}

export const ProfileContext = createContext<ProfileContextData>(
  {} as ProfileContextData,
)

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [maxProfiles, setMaxProfiles] = useState(1)

  const loadProfiles = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await api.get<{
        profiles: Profile[]
        maxProfiles: number
      }>('/profiles')

      if (response.success) {
        setProfiles(response.data.profiles)
        setMaxProfiles(response.data.maxProfiles)
      }
    } catch {
      // silently fail
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user) {
      loadProfiles()
    } else {
      setProfiles([])
      setActiveProfile(null)
      setMaxProfiles(1)
      setIsLoading(false)
    }
  }, [user, loadProfiles])

  const selectProfile = useCallback(
    (profileId: string) => {
      const profile = profiles.find((p) => p.id === profileId)
      if (profile) {
        setActiveProfile(profile)
      }
    },
    [profiles],
  )

  const createProfile = useCallback(
    async (data: {
      name: string
      isKid: boolean
    }): Promise<{ success: boolean; error?: string }> => {
      const response = await api.post<{ profile: Profile }>('/profiles', data)

      if (response.success) {
        await loadProfiles()
        return { success: true }
      }

      const message = response.error?.[0]?.message ?? 'Erro ao criar perfil'
      return { success: false, error: message }
    },
    [loadProfiles],
  )

  const updateProfile = useCallback(
    async (
      id: string,
      data: { name?: string; isKid?: boolean },
    ): Promise<{ success: boolean; error?: string }> => {
      const response = await api.patch<{ profile: Profile }>(
        `/profiles/${id}`,
        data,
      )

      if (response.success) {
        await loadProfiles()
        if (activeProfile?.id === id) {
          setActiveProfile(response.data.profile)
        }
        return { success: true }
      }

      const message = response.error?.[0]?.message ?? 'Erro ao atualizar perfil'
      return { success: false, error: message }
    },
    [loadProfiles, activeProfile],
  )

  const deleteProfile = useCallback(
    async (id: string): Promise<{ success: boolean; error?: string }> => {
      const response = await api.delete<null>(`/profiles/${id}`)

      if (response.success) {
        if (activeProfile?.id === id) {
          setActiveProfile(null)
        }
        await loadProfiles()
        return { success: true }
      }

      const message = response.error?.[0]?.message ?? 'Erro ao excluir perfil'
      return { success: false, error: message }
    },
    [loadProfiles, activeProfile],
  )

  return (
    <ProfileContext.Provider
      value={{
        profiles,
        activeProfile,
        isLoading,
        maxProfiles,
        selectProfile,
        loadProfiles,
        createProfile,
        updateProfile,
        deleteProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  )
}
