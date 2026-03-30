import { useState, useEffect, useCallback, useRef } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { ProgressEntry } from '../types'

const PROGRESS_KEY = '@streams_app:progress'
const DEBOUNCE_MS = 5000

type ProgressMap = Record<string, ProgressEntry>

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
  const [progressMap, setProgressMap] = useState<ProgressMap>({})
  const [isLoading, setIsLoading] = useState(true)
  const pendingRef = useRef<ProgressMap>({})
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const stored = await AsyncStorage.getItem(PROGRESS_KEY)
        if (stored) {
          const parsed = JSON.parse(stored)
          setProgressMap(parsed)
          pendingRef.current = parsed
        }
      } catch {
        // silently fail
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const flush = useCallback(async () => {
    try {
      await AsyncStorage.setItem(
        PROGRESS_KEY,
        JSON.stringify(pendingRef.current),
      )
      setProgressMap({ ...pendingRef.current })
    } catch {
      // silently fail
    }
  }, [])

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
      pendingRef.current = {
        ...pendingRef.current,
        [key]: {
          progressSeconds,
          durationSeconds,
          updatedAt: new Date().toISOString(),
        },
      }

      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(flush, DEBOUNCE_MS)
    },
    [flush],
  )

  const saveNow = useCallback(async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    await flush()
  }, [flush])

  const getProgress = useCallback(
    (
      id: number,
      type: 'movie' | 'series',
      season?: number,
      episode?: number,
    ): ProgressEntry | null => {
      const key = makeKey(id, type, season, episode)
      return pendingRef.current[key] ?? progressMap[key] ?? null
    },
    [progressMap],
  )

  const getAllProgressForSeries = useCallback(
    (seriesId: number): Record<string, ProgressEntry> => {
      const prefix = `series-${seriesId}-`
      const result: Record<string, ProgressEntry> = {}
      const source = { ...progressMap, ...pendingRef.current }
      for (const [key, entry] of Object.entries(source)) {
        if (key.startsWith(prefix)) {
          result[key] = entry
        }
      }
      return result
    },
    [progressMap],
  )

  const reload = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(PROGRESS_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setProgressMap(parsed)
        pendingRef.current = parsed
      }
    } catch {
      // silently fail
    }
  }, [])

  return {
    isLoading,
    updateProgress,
    saveNow,
    getProgress,
    getAllProgressForSeries,
    reload,
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
