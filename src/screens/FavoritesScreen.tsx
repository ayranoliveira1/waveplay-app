import React, { useState } from 'react'
import { View, Text, FlatList, Pressable } from 'react-native'
import { Image } from 'expo-image'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { BackButton } from '../components'
import { EmptyState } from '../components/ui'
import { useFavorites } from '../hooks'
import { TMDB_IMAGE_SIZES } from '../constants/api'
import type { RootStackParamList, MediaItem } from '../types'

type NavigationProp = NativeStackNavigationProp<RootStackParamList>

type TabType = 'all' | 'movie' | 'series'

export function FavoritesScreen() {
  const navigation = useNavigation<NavigationProp>()
  const insets = useSafeAreaInsets()
  const { favorites } = useFavorites()
  const [activeTab, setActiveTab] = useState<TabType>('all')

  const filtered =
    activeTab === 'all'
      ? favorites
      : favorites.filter((f) => f.type === activeTab)

  function handlePress(item: MediaItem) {
    if (item.type === 'movie') {
      navigation.navigate('MovieDetail', { id: item.id })
    } else {
      navigation.navigate('SeriesDetail', { id: item.id })
    }
  }

  function renderItem({ item }: { item: MediaItem }) {
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
          </Text>
          {item.rating > 0 && (
            <View className="mt-1 flex-row items-center">
              <Text className="text-xs text-rating">★</Text>
              <Text className="ml-1 text-xs text-text-secondary">
                {item.rating.toFixed(1)}
              </Text>
            </View>
          )}
        </View>
      </Pressable>
    )
  }

  const tabs: { key: TabType; label: string }[] = [
    { key: 'all', label: 'Todos' },
    { key: 'movie', label: 'Filmes' },
    { key: 'series', label: 'Séries' },
  ]

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="px-4 pt-2">
        <BackButton variant="inline" />
      </View>
      <Text className="px-4 pb-2 text-xl font-bold text-white">
        Favoritos
      </Text>

      <View className="flex-row px-4 pb-3">
        {tabs.map((tab) => (
          <Pressable
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            className={`mr-2 rounded-chip px-4 py-2 ${
              activeTab === tab.key ? 'bg-accent' : 'bg-background-tertiary'
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                activeTab === tab.key ? 'text-white' : 'text-text-secondary'
              }`}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {filtered.length > 0 ? (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={(item) => `fav-${item.type}-${item.id}`}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <EmptyState
          title="Nenhum favorito"
          message="Seus filmes e séries favoritos aparecerão aqui"
        />
      )}
    </View>
  )
}
