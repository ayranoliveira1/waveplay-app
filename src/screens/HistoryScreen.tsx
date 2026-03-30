import React from 'react'
import { View, Text, FlatList, Pressable, Alert } from 'react-native'
import { Image } from 'expo-image'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Ionicons } from '@expo/vector-icons'
import { BackButton } from '../components'
import { EmptyState } from '../components/ui'
import { useHistory } from '../hooks'
import { TMDB_IMAGE_SIZES } from '../constants/api'
import type { RootStackParamList, HistoryItem } from '../types'

type NavigationProp = NativeStackNavigationProp<RootStackParamList>

function formatRelativeDate(isoDate: string): string {
  const now = Date.now()
  const then = new Date(isoDate).getTime()
  const diffMs = now - then
  const diffMin = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return 'Agora'
  if (diffMin < 60) return `${diffMin}min atrás`
  if (diffHours < 24) return `${diffHours}h atrás`
  if (diffDays < 7) return `${diffDays}d atrás`
  return new Date(isoDate).toLocaleDateString('pt-BR')
}

export function HistoryScreen() {
  const navigation = useNavigation<NavigationProp>()
  const insets = useSafeAreaInsets()
  const { history, clearHistory, removeFromHistory } = useHistory()

  function handlePress(item: HistoryItem) {
    if (item.type === 'movie') {
      navigation.navigate('MovieDetail', { id: item.id })
    } else {
      navigation.navigate('SeriesDetail', { id: item.id })
    }
  }

  function handleClear() {
    Alert.alert(
      'Limpar histórico',
      'Tem certeza que deseja limpar todo o histórico?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Limpar', style: 'destructive', onPress: clearHistory },
      ],
    )
  }

  function renderItem({ item }: { item: HistoryItem }) {
    const imageUri = item.posterPath
      ? `${TMDB_IMAGE_SIZES.poster.small}${item.posterPath}`
      : null

    return (
      <Pressable
        onPress={() => handlePress(item)}
        className="mb-3 flex-row overflow-hidden rounded-card bg-background-secondary"
      >
        <View className="h-25 w-17">
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={{ width: 68, height: 100 }}
              contentFit="cover"
            />
          ) : (
            <View className="h-full w-full items-center justify-center bg-background-tertiary">
              <Text className="text-text-muted">?</Text>
            </View>
          )}
        </View>
        <View className="flex-1 justify-center px-3">
          <Text className="text-sm font-semibold text-white" numberOfLines={2}>
            {item.title}
          </Text>
          <Text className="mt-1 text-xs text-text-muted">
            {item.type === 'movie' ? 'Filme' : 'Série'}
            {item.lastSeason != null &&
              item.lastEpisode != null &&
              ` • T${item.lastSeason} E${item.lastEpisode}`}
            {' • '}{formatRelativeDate(item.watchedAt)}
          </Text>
          {item.progressSeconds != null &&
            item.durationSeconds != null &&
            item.durationSeconds > 0 && (
              <View className="mt-1.5 h-1 overflow-hidden rounded-full bg-background-tertiary">
                <View
                  className="h-full rounded-full bg-accent"
                  style={{
                    width: `${Math.min((item.progressSeconds / item.durationSeconds) * 100, 100)}%`,
                  }}
                />
              </View>
            )}
        </View>
        <Pressable
          onPress={() => removeFromHistory(item.id, item.type)}
          className="items-center justify-center px-3"
        >
          <Ionicons name="close-circle-outline" size={20} color="#5A5A72" />
        </Pressable>
      </Pressable>
    )
  }

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="px-4 pt-2">
        <BackButton variant="inline" />
      </View>
      <Text className="px-4 pb-3 text-xl font-bold text-white">
        Histórico
      </Text>

      {history.length > 0 ? (
        <FlatList
          data={history}
          renderItem={renderItem}
          keyExtractor={(item) => `hist-${item.type}-${item.id}`}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            <Pressable
              onPress={handleClear}
              className="mt-2 flex-row items-center justify-center rounded-card bg-background-secondary py-3"
            >
              <Ionicons
                name="trash-outline"
                size={16}
                color="#F44336"
                style={{ marginRight: 8 }}
              />
              <Text className="text-sm font-medium text-error">
                Limpar Histórico
              </Text>
            </Pressable>
          }
        />
      ) : (
        <EmptyState
          title="Nenhum histórico"
          message="Os filmes e séries que você assistir aparecerão aqui"
        />
      )}
    </View>
  )
}
