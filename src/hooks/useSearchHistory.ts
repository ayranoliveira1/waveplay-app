import { useState, useEffect, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const SEARCH_HISTORY_KEY = '@streams_app:search_history'
const MAX_SEARCH_HISTORY = 10

export function useSearchHistory() {
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadHistory = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(SEARCH_HISTORY_KEY)
      setSearchHistory(stored ? JSON.parse(stored) : [])
    } catch {
      // silently fail
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  const saveHistory = useCallback(async (items: string[]) => {
    const trimmed = items.slice(0, MAX_SEARCH_HISTORY)
    await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(trimmed))
    setSearchHistory(trimmed)
  }, [])

  const addSearch = useCallback(
    async (term: string) => {
      const normalized = term.trim().toLowerCase()
      if (!normalized) return
      const filtered = searchHistory.filter((t) => t.toLowerCase() !== normalized)
      await saveHistory([term.trim(), ...filtered])
    },
    [searchHistory, saveHistory],
  )

  const removeSearch = useCallback(
    async (term: string) => {
      await saveHistory(searchHistory.filter((t) => t !== term))
    },
    [searchHistory, saveHistory],
  )

  const clearSearchHistory = useCallback(async () => {
    await AsyncStorage.removeItem(SEARCH_HISTORY_KEY)
    setSearchHistory([])
  }, [])

  return {
    searchHistory,
    isLoading,
    addSearch,
    removeSearch,
    clearSearchHistory,
    reload: loadHistory,
  }
}
