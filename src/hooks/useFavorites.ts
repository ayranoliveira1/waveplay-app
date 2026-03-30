import { useState, useEffect, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { MediaItem } from '../types'

const FAVORITES_KEY = '@streams_app:favorites'

export function useFavorites() {
  const [favorites, setFavorites] = useState<MediaItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadFavorites() {
      try {
        const stored = await AsyncStorage.getItem(FAVORITES_KEY)
        if (stored) {
          setFavorites(JSON.parse(stored))
        }
      } catch {
        // silently fail
      } finally {
        setIsLoading(false)
      }
    }
    loadFavorites()
  }, [])

  const saveFavorites = useCallback(async (items: MediaItem[]) => {
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(items))
    setFavorites(items)
  }, [])

  const addFavorite = useCallback(
    async (item: MediaItem) => {
      const exists = favorites.some(
        (f) => f.id === item.id && f.type === item.type,
      )
      if (!exists) {
        await saveFavorites([...favorites, item])
      }
    },
    [favorites, saveFavorites],
  )

  const removeFavorite = useCallback(
    async (id: number, type: 'movie' | 'series') => {
      await saveFavorites(
        favorites.filter((f) => !(f.id === id && f.type === type)),
      )
    },
    [favorites, saveFavorites],
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
