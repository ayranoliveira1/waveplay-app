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
import { BackButton } from '../components'
import { Chip, EmptyState, ErrorState } from '../components/ui'
import { useSearchHistory } from '../hooks'
import { searchCatalog } from '../services/catalog'
import { TMDB_IMAGE_SIZES } from '../constants/api'
import type { RootStackParamList, CatalogItem } from '../types'

type NavigationProp = NativeStackNavigationProp<RootStackParamList>

export function SearchScreen() {
  const navigation = useNavigation<NavigationProp>()
  const insets = useSafeAreaInsets()
  const { searchHistory, addSearch, removeSearch, clearSearchHistory } = useSearchHistory()
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
    queryFn: () => searchCatalog(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
  })

  React.useEffect(() => {
    if (debouncedQuery.length >= 2 && data && data.results.length > 0) {
      addSearch(debouncedQuery)
    }
  }, [debouncedQuery, data])

  const handleChipPress = useCallback((term: string) => {
    setQuery(term)
    setDebouncedQuery(term)
    if (debounceRef.current) clearTimeout(debounceRef.current)
  }, [])

  const results = data?.results ?? []

  function handlePress(item: CatalogItem) {
    if (item.type === 'movie') {
      navigation.navigate('MovieDetail', { id: item.id })
    } else {
      navigation.navigate('SeriesDetail', { id: item.id })
    }
  }

  function renderItem({ item }: { item: CatalogItem }) {
    const imageUri = item.posterPath
      ? `${TMDB_IMAGE_SIZES.poster.small}${item.posterPath}`
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
            {item.title}
          </Text>
          <Text className="mt-1 text-xs text-text-muted">
            {item.type === 'movie' ? 'Filme' : 'Série'} •{' '}
            {item.releaseDate?.split('-')[0]}
          </Text>
          {item.overview && (
            <Text className="mt-1 text-xs text-text-secondary" numberOfLines={2}>
              {item.overview}
            </Text>
          )}
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

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="px-4 pb-3 pt-4">
        <View className="mb-2">
          <BackButton variant="inline" />
        </View>
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
          keyExtractor={(item) => `search-${item.id}-${item.type}`}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
        />
      ) : debouncedQuery.length >= 2 ? (
        <EmptyState
          title="Nenhum resultado"
          message={`Não encontramos resultados para "${debouncedQuery}"`}
        />
      ) : searchHistory.length > 0 ? (
        <View className="px-4 pt-4">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-base font-semibold text-white">Buscas recentes</Text>
            <Pressable onPress={clearSearchHistory}>
              <Text className="text-sm text-accent">Limpar tudo</Text>
            </Pressable>
          </View>
          <View className="flex-row flex-wrap" style={{ gap: 8 }}>
            {searchHistory.map((term) => (
              <Chip
                key={term}
                label={term}
                onPress={() => handleChipPress(term)}
                onRemove={() => removeSearch(term)}
              />
            ))}
          </View>
        </View>
      ) : (
        <EmptyState
          title="O que você quer assistir?"
          message="Busque por filmes, séries e mais"
        />
      )}
    </View>
  )
}
