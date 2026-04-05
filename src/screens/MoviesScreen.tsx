import React, { useState } from 'react'
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
} from 'react-native'
import { Image } from 'expo-image'
import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { GenreChips, RatingBadge, ScreenHeader } from '../components'
import { ErrorState } from '../components/ui'
import {
  getMovieGenres,
  getPopularMovies,
  getMoviesByGenre,
} from '../services/catalog'
import { TMDB_IMAGE_SIZES } from '../constants/api'
import { useResponsive } from '../hooks/useResponsive'
import type { RootStackParamList, CatalogItem } from '../types'

type NavigationProp = NativeStackNavigationProp<RootStackParamList>

export function MoviesScreen() {
  const navigation = useNavigation<NavigationProp>()
  const { numColumns } = useResponsive()
  const [selectedGenreId, setSelectedGenreId] = useState<number | null>(null)

  const { data: genres } = useQuery({
    queryKey: ['genres', 'movie'],
    queryFn: getMovieGenres,
  })

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['movies', 'list', selectedGenreId],
    queryFn: ({ pageParam }) =>
      selectedGenreId
        ? getMoviesByGenre(selectedGenreId, pageParam)
        : getPopularMovies(pageParam),
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
  })

  const movies = data?.pages.flatMap((page) => page.results) ?? []

  function renderMovie({ item }: { item: CatalogItem }) {
    const imageUri = item.posterPath
      ? `${TMDB_IMAGE_SIZES.poster.medium}${item.posterPath}`
      : null

    return (
      <Pressable
        onPress={() => navigation.navigate('MovieDetail', { id: item.id })}
        style={{ width: `${Math.floor(100 / numColumns) - 2}%` }}
        className="mb-4"
      >
        <View className="overflow-hidden rounded-poster">
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={{ width: '100%', aspectRatio: 2 / 3 }}
              contentFit="cover"
              transition={300}
            />
          ) : (
            <View
              className="items-center justify-center bg-background-secondary"
              style={{ width: '100%', aspectRatio: 2 / 3 }}
            >
              <Text className="text-text-muted">Sem imagem</Text>
            </View>
          )}
          <View className="absolute right-2 top-2">
            <RatingBadge rating={item.rating} />
          </View>
        </View>
        <Text className="mt-2 text-sm font-medium text-white" numberOfLines={2}>
          {item.title}
        </Text>
        <Text className="text-xs text-text-muted">
          {item.releaseDate?.split('-')[0]}
        </Text>
      </Pressable>
    )
  }

  return (
    <View className="flex-1 bg-background">
      <ScreenHeader title="Filmes" />

      {genres && (
        <GenreChips
          genres={genres.genres}
          selectedGenreId={selectedGenreId}
          onSelect={setSelectedGenreId}
        />
      )}

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#7B2FBE" />
        </View>
      ) : (
        <FlatList
          data={movies}
          renderItem={renderMovie}
          keyExtractor={(item) => `movie-${item.id}`}
          numColumns={numColumns}
          key={`movies-${numColumns}`}
          columnWrapperStyle={{
            justifyContent: 'space-between',
            paddingHorizontal: 16,
          }}
          contentContainerStyle={{ paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
          onEndReached={() => {
            if (hasNextPage) fetchNextPage()
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator
                size="small"
                color="#7B2FBE"
                style={{ padding: 16 }}
              />
            ) : null
          }
        />
      )}
    </View>
  )
}
