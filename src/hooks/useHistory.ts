import { useCallback, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useProfile } from './useProfile'
import {
  getHistory,
  addHistoryItem,
  clearAllHistory,
} from '../services/playback'
import type { HistoryItem } from '../types'

export function useHistory() {
  const { activeProfile } = useProfile()
  const profileId = activeProfile?.id
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['history', profileId],
    queryFn: () => getHistory(profileId!, 1, 50),
    enabled: !!profileId,
  })

  const history: HistoryItem[] = useMemo(() => {
    const items = (data?.items ?? []).map((item) => ({
      id: item.tmdbId,
      title: item.title,
      posterPath: item.posterPath,
      type: item.type,
      watchedAt: item.watchedAt,
      lastSeason: item.season,
      lastEpisode: item.episode,
      progressSeconds: item.progressSeconds,
      durationSeconds: item.durationSeconds,
    }))

    const seen = new Map<string, HistoryItem>()
    for (const item of items) {
      const key = `${item.id}-${item.type}`
      const existing = seen.get(key)
      if (!existing || item.watchedAt > existing.watchedAt) {
        seen.set(key, item)
      }
    }

    return Array.from(seen.values())
  }, [data])

  const addToHistory = useCallback(
    async (item: HistoryItem) => {
      if (!profileId) return
      await addHistoryItem(profileId, {
        tmdbId: item.id,
        type: item.type,
        title: item.title,
        posterPath: item.posterPath,
        progressSeconds: item.progressSeconds,
        durationSeconds: item.durationSeconds,
        season: item.lastSeason,
        episode: item.lastEpisode,
      })
      queryClient.invalidateQueries({ queryKey: ['history', profileId] })
    },
    [profileId, queryClient],
  )

  const removeFromHistory = useCallback(
    async (_id: number, _type: 'movie' | 'series') => {
      // API nao tem delete individual — no-op
    },
    [],
  )

  const clearHistory = useCallback(async () => {
    if (!profileId) return
    await clearAllHistory(profileId)
    queryClient.invalidateQueries({ queryKey: ['history', profileId] })
  }, [profileId, queryClient])

  const reload = useCallback(() => {
    if (!profileId) return
    queryClient.invalidateQueries({ queryKey: ['history', profileId] })
  }, [profileId, queryClient])

  return {
    history,
    isLoading,
    addToHistory,
    removeFromHistory,
    clearHistory,
    reload,
  }
}
