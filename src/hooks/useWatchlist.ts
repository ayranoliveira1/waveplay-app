import { useCallback, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useProfile } from './useProfile'
import { getWatchlist, toggleWatchlistItem } from '../services/library'
import type { MediaItem } from '../types'

export function useWatchlist() {
  const { activeProfile } = useProfile()
  const profileId = activeProfile?.id
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['watchlist', profileId],
    queryFn: () => getWatchlist(profileId!),
    enabled: !!profileId,
  })

  const watchlist: MediaItem[] = useMemo(
    () =>
      (data?.items ?? []).map((item) => ({
        id: item.tmdbId,
        title: item.title,
        posterPath: item.posterPath,
        backdropPath: item.backdropPath,
        rating: item.rating,
        type: item.type,
      })),
    [data],
  )

  const addToWatchlist = useCallback(
    async (item: MediaItem) => {
      if (!profileId) return
      await toggleWatchlistItem(profileId, item)
      queryClient.invalidateQueries({ queryKey: ['watchlist', profileId] })
    },
    [profileId, queryClient],
  )

  const removeFromWatchlist = useCallback(
    async (id: number, type: 'movie' | 'series') => {
      if (!profileId) return
      const item = watchlist.find((w) => w.id === id && w.type === type)
      if (!item) return
      await toggleWatchlistItem(profileId, item)
      queryClient.invalidateQueries({ queryKey: ['watchlist', profileId] })
    },
    [profileId, queryClient, watchlist],
  )

  const isInWatchlist = useCallback(
    (id: number, type: 'movie' | 'series') => {
      return watchlist.some((w) => w.id === id && w.type === type)
    },
    [watchlist],
  )

  return {
    watchlist,
    isLoading,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
  }
}
