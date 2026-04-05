import React, { useState, useRef, useEffect, useCallback } from 'react'
import { View, Text, ActivityIndicator } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { WebView } from 'react-native-webview'
import { useRoute, useNavigation } from '@react-navigation/native'
import type { RouteProp } from '@react-navigation/native'
import { BackButton } from '../components'
import { StreamConflictModal } from '../components/StreamConflictModal'
import { SessionKilledOverlay } from '../components/SessionKilledOverlay'
import { getMovieEmbedUrl, getSeriesEmbedUrl } from '../services/embedplay'
import { useHistory, useProgress, useProfile } from '../hooks'
import { useStream } from '../hooks/useStream'
import type { RootStackParamList, StreamConflictError } from '../types'

type PlayerRoute = RouteProp<RootStackParamList, 'Player'>

export function PlayerScreen() {
  const navigation = useNavigation()
  const route = useRoute<PlayerRoute>()
  const { id, type, title, posterPath, runtimeSeconds, season, episode } =
    route.params
  const insets = useSafeAreaInsets()
  const [isLoading, setIsLoading] = useState(true)
  const [streamReady, setStreamReady] = useState(false)
  const [streamConflict, setStreamConflict] =
    useState<StreamConflictError | null>(null)
  const { addToHistory } = useHistory()
  const { updateProgress, syncToApi, saveNow, getProgress } = useProgress()
  const { activeProfile } = useProfile()
  const { startStream, stopStream, killRemoteStream, sessionKilled } =
    useStream()
  const hasRecorded = useRef(false)
  const startTimeRef = useRef<number>(0)
  const previousProgressRef = useRef(getProgress(id, type, season, episode))

  const embedUrl =
    type === 'movie'
      ? getMovieEmbedUrl(id)
      : getSeriesEmbedUrl(id, season ?? 1, episode ?? 1)

  const tryStartStream = useCallback(async () => {
    if (!activeProfile) return
    try {
      const result = await startStream(activeProfile.id, id, type, title)
      if (result.ok) {
        setStreamReady(true)
        setStreamConflict(null)
      } else {
        setStreamConflict(result.conflict)
      }
    } catch {
      navigation.goBack()
    }
  }, [activeProfile, startStream, id, type, title, navigation])

  // Iniciar stream ao montar
  useEffect(() => {
    tryStartStream()
  }, [tryStartStream])

  // Sync periodico de 5 minutos — backup contra crash
  useEffect(() => {
    const interval = setInterval(() => {
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
        syncToApi()
      }
    }, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [
    id,
    type,
    title,
    posterPath,
    runtimeSeconds,
    season,
    episode,
    addToHistory,
    updateProgress,
    syncToApi,
  ])

  // Salvar progresso + encerrar stream ao sair
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
      stopStream()
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
    stopStream,
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

  async function handleKillStream(streamId: string) {
    await killRemoteStream(streamId)
    await tryStartStream()
  }

  function handleConflictCancel() {
    setStreamConflict(null)
    navigation.goBack()
  }

  return (
    <View className="flex-1 bg-black">
      <View style={{ top: insets.top + 8 }} className="absolute left-4 z-10">
        <BackButton />
      </View>

      {!streamReady && !streamConflict && (
        <View className="absolute inset-0 z-0 items-center justify-center">
          <ActivityIndicator size="large" color="#7B2FBE" />
          <Text className="mt-3 text-sm text-text-secondary">
            Iniciando stream...
          </Text>
        </View>
      )}

      {streamReady && (
        <>
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
        </>
      )}

      {sessionKilled && (
        <SessionKilledOverlay onGoBack={() => navigation.goBack()} />
      )}

      <StreamConflictModal
        visible={streamConflict !== null}
        conflict={streamConflict}
        onKillStream={handleKillStream}
        onCancel={handleConflictCancel}
      />
    </View>
  )
}
