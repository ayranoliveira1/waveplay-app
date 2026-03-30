import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  ActivityIndicator,
} from 'react-native'
import { Image } from 'expo-image'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { EmptyState, ErrorState } from '../components/ui'
import { searchMulti } from '../services/tmdb'
import { TMDB_IMAGE_SIZES } from '../constants/api'
import type { RootStackParamList, TMDBMultiSearchResult } from '../types'

type NavigationProp = NativeStackNavigationProp<RootStackParamList>

export function SearchScreen() {
  const navigation = useNavigation<NavigationProp>()
  const insets = useSafeAreaInsets()
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleSearch = useCallback((text: string) => {
    setQuery(text)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(text.trim())
    }, 500)
  }, [])

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => searchMulti(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
  })

  const results =
    data?.results.filter(
      (item) => item.media_type === 'movie' || item.media_type === 'tv',
    ) ?? []

  function handlePress(item: TMDBMultiSearchResult) {
    if (item.media_type === 'movie') {
      navigation.navigate('MovieDetail', { id: item.id })
    } else {
      navigation.navigate('SeriesDetail', { id: item.id })
    }
  }

  function renderItem({ item }: { item: TMDBMultiSearchResult }) {
    const imageUri = item.poster_path
      ? `${TMDB_IMAGE_SIZES.poster.small}${item.poster_path}`
      : null

    return (
      <Pressable
        onPress={() => handlePress(item)}
        className="mb-3 flex-row overflow-hidden rounded-card bg-background-secondary"
      >
        <View className="h-30 w-20">
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={{ width: 80, height: 120 }}
              contentFit="cover"
              transition={300}
            />
          ) : (
            <View className="h-full w-full items-center justify-center bg-background-tertiary">
              <Text className="text-text-muted">?</Text>
            </View>
          )}
        </View>
        <View className="flex-1 justify-center px-3 py-2">
          <Text className="text-sm font-semibold text-white" numberOfLines={2}>
            {item.title || item.name}
          </Text>
          <Text className="mt-1 text-xs text-text-muted">
            {item.media_type === 'movie' ? 'Filme' : 'Série'} •{' '}
            {(item.release_date || item.first_air_date)?.split('-')[0]}
          </Text>
          <Text className="mt-1 text-xs text-text-secondary" numberOfLines={2}>
            {item.overview}
          </Text>
          {item.vote_average > 0 && (
            <View className="mt-1 flex-row items-center">
              <Text className="text-xs text-rating">★</Text>
              <Text className="ml-1 text-xs text-text-secondary">
                {item.vote_average.toFixed(1)}
              </Text>
            </View>
          )}
        </View>
      </Pressable>
    )
  }

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="px-4 pb-3 pt-4">
        <View className="flex-row items-center rounded-card bg-background-tertiary px-4">
          <Ionicons name="search" size={18} color="#5A5A72" style={{ marginRight: 12 }} />
          <TextInput
            className="flex-1 py-3.5 text-base text-white"
            placeholder="Buscar filmes e séries..."
            placeholderTextColor="#5A5A72"
            value={query}
            onChangeText={handleSearch}
            autoCorrect={false}
          />
        </View>
      </View>

      {isError && debouncedQuery.length >= 2 ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isLoading && debouncedQuery.length >= 2 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#7B2FBE" />
        </View>
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          renderItem={renderItem}
          keyExtractor={(item) => `search-${item.id}-${item.media_type}`}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
        />
      ) : debouncedQuery.length >= 2 ? (
        <EmptyState
          title="Nenhum resultado"
          message={`Não encontramos resultados para "${debouncedQuery}"`}
        />
      ) : (
        <EmptyState
          title="O que você quer assistir?"
          message="Busque por filmes, séries e mais"
        />
      )}
    </View>
  )
}
