import React, { useState, useRef, useEffect } from 'react'
import { View, Text, ActivityIndicator } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { WebView } from 'react-native-webview'
import { useRoute, useNavigation } from '@react-navigation/native'
import type { RouteProp } from '@react-navigation/native'
import { BackButton } from '../components'
import { getMovieEmbedUrl, getSeriesEmbedUrl } from '../services/embedplay'
import { useHistory, useProgress } from '../hooks'
import type { RootStackParamList } from '../types'

type PlayerRoute = RouteProp<RootStackParamList, 'Player'>

export function PlayerScreen() {
  const navigation = useNavigation()
  const route = useRoute<PlayerRoute>()
  const { id, type, title, posterPath, runtimeSeconds, season, episode } =
    route.params
  const insets = useSafeAreaInsets()
  const [isLoading, setIsLoading] = useState(true)
  const { addToHistory } = useHistory()
  const { updateProgress, saveNow, getProgress } = useProgress()
  const hasRecorded = useRef(false)
  const startTimeRef = useRef<number>(0)
  const previousProgressRef = useRef(getProgress(id, type, season, episode))

  const embedUrl =
    type === 'movie'
      ? getMovieEmbedUrl(id)
      : getSeriesEmbedUrl(id, season ?? 1, episode ?? 1)

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      if (startTimeRef.current > 0) {
        const elapsedSeconds = Math.floor(
          (Date.now() - startTimeRef.current) / 1000,
        )
        const base = previousProgressRef.current?.progressSeconds ?? 0
        const progress = Math.min(base + elapsedSeconds, runtimeSeconds)

        addToHistory({
          id,
          title,
          posterPath,
          type,
          watchedAt: new Date().toISOString(),
          lastSeason: season,
          lastEpisode: episode,
          progressSeconds: progress,
          durationSeconds: runtimeSeconds,
        })
        updateProgress(id, type, progress, runtimeSeconds, season, episode)
        saveNow()
      }
    })
    return unsubscribe
  }, [
    navigation,
    id,
    type,
    title,
    posterPath,
    runtimeSeconds,
    season,
    episode,
    addToHistory,
    updateProgress,
    saveNow,
  ])

  function handleLoadEnd() {
    setIsLoading(false)
    startTimeRef.current = Date.now()
    if (!hasRecorded.current) {
      hasRecorded.current = true
      addToHistory({
        id,
        title,
        posterPath,
        type,
        watchedAt: new Date().toISOString(),
        lastSeason: season,
        lastEpisode: episode,
      })
    }
  }

  return (
    <View className="flex-1 bg-black">
      <View style={{ top: insets.top + 8 }} className="absolute left-4 z-10">
        <BackButton />
      </View>

      {isLoading && (
        <View className="absolute inset-0 z-0 items-center justify-center">
          <ActivityIndicator size="large" color="#7B2FBE" />
          <Text className="mt-3 text-sm text-text-secondary">
            Carregando player...
          </Text>
        </View>
      )}

      <WebView
        source={{ uri: embedUrl }}
        style={{ flex: 1, backgroundColor: '#000000' }}
        allowsFullscreenVideo
        javaScriptEnabled
        domStorageEnabled
        mediaPlaybackRequiresUserAction={false}
        onLoadEnd={handleLoadEnd}
        onError={() => setIsLoading(false)}
      />
    </View>
  )
}
