import React, { useState } from 'react'
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
} from 'react-native'
import { Image } from 'expo-image'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { GenreChips, RatingBadge } from '../components'
import { ErrorState } from '../components/ui'
import {
  getSeriesGenres,
  getPopularSeries,
  getSeriesByGenre,
} from '../services/tmdb'
import { TMDB_IMAGE_SIZES } from '../constants/api'
import { useResponsive } from '../hooks/useResponsive'
import type { RootStackParamList, TMDBSeries } from '../types'

type NavigationProp = NativeStackNavigationProp<RootStackParamList>

export function SeriesScreen() {
  const navigation = useNavigation<NavigationProp>()
  const insets = useSafeAreaInsets()
  const { numColumns } = useResponsive()
  const [selectedGenreId, setSelectedGenreId] = useState<number | null>(null)

  const { data: genres } = useQuery({
    queryKey: ['genres', 'series'],
    queryFn: getSeriesGenres,
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
    queryKey: ['series', 'list', selectedGenreId],
    queryFn: ({ pageParam }) =>
      selectedGenreId
        ? getSeriesByGenre(selectedGenreId, pageParam)
        : getPopularSeries(pageParam),
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
  })

  const series = data?.pages.flatMap((page) => page.results) ?? []

  function renderSeries({ item }: { item: TMDBSeries }) {
    const imageUri = item.poster_path
      ? `${TMDB_IMAGE_SIZES.poster.medium}${item.poster_path}`
      : null

    return (
      <Pressable
        onPress={() => navigation.navigate('SeriesDetail', { id: item.id })}
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
            <RatingBadge rating={item.vote_average} />
          </View>
        </View>
        <Text className="mt-2 text-sm font-medium text-white" numberOfLines={2}>
          {item.name}
        </Text>
        <Text className="text-xs text-text-muted">
          {item.first_air_date?.split('-')[0]}
        </Text>
      </Pressable>
    )
  }

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <Text className="px-4 pb-2 pt-4 text-xl font-bold text-white">
        Séries
      </Text>

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
          data={series}
          renderItem={renderSeries}
          keyExtractor={(item) => `series-${item.id}`}
          numColumns={numColumns}
          key={`series-${numColumns}`}
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
