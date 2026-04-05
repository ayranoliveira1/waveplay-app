import { useCallback, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useProfile } from './useProfile'
import { getFavorites, toggleFavorite } from '../services/library'
import type { MediaItem } from '../types'

export function useFavorites() {
  const { activeProfile } = useProfile()
  const profileId = activeProfile?.id
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['favorites', profileId],
    queryFn: () => getFavorites(profileId!),
    enabled: !!profileId,
  })

  const favorites: MediaItem[] = useMemo(
    () =>
      (data?.favorites ?? []).map((item) => ({
        id: item.tmdbId,
        title: item.title,
        posterPath: item.posterPath,
        backdropPath: item.backdropPath,
        rating: item.rating,
        type: item.type,
      })),
    [data],
  )

  const addFavorite = useCallback(
    async (item: MediaItem) => {
      if (!profileId) return
      await toggleFavorite(profileId, item)
      queryClient.invalidateQueries({ queryKey: ['favorites', profileId] })
    },
    [profileId, queryClient],
  )

  const removeFavorite = useCallback(
    async (id: number, type: 'movie' | 'series') => {
      if (!profileId) return
      const item = favorites.find((f) => f.id === id && f.type === type)
      if (!item) return
      await toggleFavorite(profileId, item)
      queryClient.invalidateQueries({ queryKey: ['favorites', profileId] })
    },
    [profileId, queryClient, favorites],
  )

  const isFavorite = useCallback(
    (id: number, type: 'movie' | 'series') => {
      return favorites.some((f) => f.id === id && f.type === type)
    },
    [favorites],
  )

  return {
    favorites,
    isLoading,
    addFavorite,
    removeFavorite,
    isFavorite,
  }
}
