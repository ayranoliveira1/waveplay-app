import { useState, useEffect, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { HistoryItem } from '../types'

const HISTORY_KEY = '@streams_app:history'
const MAX_HISTORY = 50

export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadHistory = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(HISTORY_KEY)
      setHistory(stored ? JSON.parse(stored) : [])
    } catch {
      // silently fail
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  const saveHistory = useCallback(async (items: HistoryItem[]) => {
    const trimmed = items.slice(0, MAX_HISTORY)
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed))
    setHistory(trimmed)
  }, [])

  const addToHistory = useCallback(
    async (item: HistoryItem) => {
      const filtered = history.filter(
        (h) => !(h.id === item.id && h.type === item.type),
      )
      await saveHistory([item, ...filtered])
    },
    [history, saveHistory],
  )

  const removeFromHistory = useCallback(
    async (id: number, type: 'movie' | 'series') => {
      await saveHistory(
        history.filter((h) => !(h.id === id && h.type === type)),
      )
    },
    [history, saveHistory],
  )

  const clearHistory = useCallback(async () => {
    await AsyncStorage.removeItem(HISTORY_KEY)
    setHistory([])
  }, [])

  return {
    history,
    isLoading,
    addToHistory,
    removeFromHistory,
    clearHistory,
    reload: loadHistory,
  }
}
