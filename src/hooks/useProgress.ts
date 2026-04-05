import { useCallback, useMemo, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useProfile } from './useProfile'
import { saveProgress, getHistory } from '../services/playback'
import type { ProgressEntry } from '../types'

type ProgressMap = Record<string, ProgressEntry>

interface PendingEntry {
  tmdbId: number
  type: 'movie' | 'series'
  progressSeconds: number
  durationSeconds: number
  season?: number
  episode?: number
}

function makeKey(
  id: number,
  type: 'movie' | 'series',
  season?: number,
  episode?: number,
): string {
  if (type === 'series' && season != null && episode != null) {
    return `series-${id}-${season}-${episode}`
  }
  return `movie-${id}`
}

export function useProgress() {
  const { activeProfile } = useProfile()
  const profileId = activeProfile?.id
  const queryClient = useQueryClient()

  const progressMapRef = useRef<ProgressMap>({})
  const pendingRef = useRef<PendingEntry | null>(null)

  // Carregar progresso da API via history (tem progressSeconds/durationSeconds)
  const { data, isLoading } = useQuery({
    queryKey: ['history', profileId],
    queryFn: () => getHistory(profileId!, 1, 50),
    enabled: !!profileId,
  })

  // Mapa de progresso construido a partir dos items da API
  const apiProgressMap: ProgressMap = useMemo(() => {
    const map: ProgressMap = {}
    for (const item of data?.items ?? []) {
      if (item.progressSeconds != null && item.durationSeconds != null) {
        const key = makeKey(
          item.tmdbId,
          item.type as 'movie' | 'series',
          item.season,
          item.episode,
        )
        map[key] = {
          progressSeconds: item.progressSeconds,
          durationSeconds: item.durationSeconds,
          updatedAt: item.watchedAt,
        }
      }
    }
    return map
  }, [data])

  const updateProgress = useCallback(
    (
      id: number,
      type: 'movie' | 'series',
      progressSeconds: number,
      durationSeconds: number,
      season?: number,
      episode?: number,
    ) => {
      const key = makeKey(id, type, season, episode)
      progressMapRef.current[key] = {
        progressSeconds,
        durationSeconds,
        updatedAt: new Date().toISOString(),
      }
      pendingRef.current = {
        tmdbId: id,
        type,
        progressSeconds,
        durationSeconds,
        season,
        episode,
      }
    },
    [],
  )

  const syncToApi = useCallback(async () => {
    if (!profileId || !pendingRef.current) return
    try {
      await saveProgress(profileId, pendingRef.current)
      queryClient.invalidateQueries({
        queryKey: ['history', profileId],
      })
    } catch {
      // silently fail — retry no proximo ciclo
    }
  }, [profileId, queryClient])

  const saveNow = useCallback(async () => {
    await syncToApi()
    pendingRef.current = null
  }, [syncToApi])

  // Ref (dados ao vivo durante playback) > API (dados persistidos)
  const getProgress = useCallback(
    (
      id: number,
      type: 'movie' | 'series',
      season?: number,
      episode?: number,
    ): ProgressEntry | null => {
      const key = makeKey(id, type, season, episode)
      return progressMapRef.current[key] ?? apiProgressMap[key] ?? null
    },
    [apiProgressMap],
  )

  // Merge API + ref (ref sobrescreve dados mais recentes)
  const getAllProgressForSeries = useCallback(
    (seriesId: number): Record<string, ProgressEntry> => {
      const prefix = `series-${seriesId}-`
      const result: Record<string, ProgressEntry> = {}
      for (const [key, entry] of Object.entries(apiProgressMap)) {
        if (key.startsWith(prefix)) {
          result[key] = entry
        }
      }
      for (const [key, entry] of Object.entries(progressMapRef.current)) {
        if (key.startsWith(prefix)) {
          result[key] = entry
        }
      }
      return result
    },
    [apiProgressMap],
  )

  return {
    isLoading,
    updateProgress,
    syncToApi,
    saveNow,
    getProgress,
    getAllProgressForSeries,
  }
}

export function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  if (h > 0)
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}
