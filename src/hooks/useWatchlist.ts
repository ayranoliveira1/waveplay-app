import { useState, useEffect, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { MediaItem } from '../types'

const WATCHLIST_KEY = '@streams_app:watchlist'

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<MediaItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadWatchlist() {
      try {
        const stored = await AsyncStorage.getItem(WATCHLIST_KEY)
        if (stored) {
          setWatchlist(JSON.parse(stored))
        }
      } catch {
        // silently fail
      } finally {
        setIsLoading(false)
      }
    }
    loadWatchlist()
  }, [])

  const saveWatchlist = useCallback(async (items: MediaItem[]) => {
    await AsyncStorage.setItem(WATCHLIST_KEY, JSON.stringify(items))
    setWatchlist(items)
  }, [])

  const addToWatchlist = useCallback(
    async (item: MediaItem) => {
      const exists = watchlist.some(
        (w) => w.id === item.id && w.type === item.type,
      )
      if (!exists) {
        await saveWatchlist([...watchlist, item])
      }
    },
    [watchlist, saveWatchlist],
  )

  const removeFromWatchlist = useCallback(
    async (id: number, type: 'movie' | 'series') => {
      await saveWatchlist(
        watchlist.filter((w) => !(w.id === id && w.type === type)),
      )
    },
    [watchlist, saveWatchlist],
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
