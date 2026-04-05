import React from 'react'
import { ScrollView, View, Text, ActivityIndicator, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { useQuery } from '@tanstack/react-query'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { Button, ErrorState } from '../components/ui'
import { MediaCard, Carousel, BackButton, SubscriptionBanner } from '../components'
import { getMovieDetail, getSimilarMovies } from '../services/catalog'
import { TMDB_IMAGE_SIZES } from '../constants/api'
import { useFavorites, useWatchlist, useProgress, useSubscription, formatTime } from '../hooks'
import type { RootStackParamList, CatalogItem } from '../types'

type NavigationProp = NativeStackNavigationProp<RootStackParamList>
type MovieDetailRoute = RouteProp<RootStackParamList, 'MovieDetail'>

export function MovieDetailScreen() {
  const navigation = useNavigation<NavigationProp>()
  const route = useRoute<MovieDetailRoute>()
  const { id } = route.params
  const insets = useSafeAreaInsets()
  const { isFavorite, addFavorite, removeFavorite } = useFavorites()
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist()
  const { getProgress } = useProgress()
  const { canWatch, isExpired } = useSubscription()

  const { data: movieData, isLoading, isError, refetch } = useQuery({
    queryKey: ['movie', id],
    queryFn: () => getMovieDetail(id),
  })

  const movie = movieData?.movie

  const { data: similarData } = useQuery({
    queryKey: ['movie', id, 'similar'],
    queryFn: () => getSimilarMovies(id),
    enabled: !!movie,
  })

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#7B2FBE" />
      </View>
    )
  }

  if (isError || !movie) {
    return (
      <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
        <View className="px-4 pt-2">
          <BackButton variant="inline" />
        </View>
        <ErrorState onRetry={() => refetch()} />
      </View>
    )
  }

  const isFav = isFavorite(id, 'movie')
  const inWatchlist = isInWatchlist(id, 'movie')
  const backdropUri = movie.backdropPath
    ? `${TMDB_IMAGE_SIZES.backdrop.large}${movie.backdropPath}`
    : null

  function handleToggleFavorite() {
    if (isFav) {
      removeFavorite(id, 'movie')
    } else {
      addFavorite({
        id: movie!.id,
        title: movie!.title,
        posterPath: movie!.posterPath,
        backdropPath: movie!.backdropPath,
        rating: movie!.rating,
        type: 'movie',
      })
    }
  }

  function handleToggleWatchlist() {
    if (inWatchlist) {
      removeFromWatchlist(id, 'movie')
    } else {
      addToWatchlist({
        id: movie!.id,
        title: movie!.title,
        posterPath: movie!.posterPath,
        backdropPath: movie!.backdropPath,
        rating: movie!.rating,
        type: 'movie',
      })
    }
  }

  const movieProgress = getProgress(id, 'movie')
  const hasProgress =
    movieProgress &&
    movieProgress.progressSeconds > 0 &&
    movieProgress.durationSeconds > 0 &&
    movieProgress.progressSeconds / movieProgress.durationSeconds < 0.9

  function handleWatch() {
    navigation.navigate('Player', {
      id,
      type: 'movie',
      title: movie!.title,
      posterPath: movie!.posterPath,
      runtimeSeconds: (movie!.runtime || 120) * 60,
    })
  }

  function handleMediaPress(mediaId: number, type: 'movie' | 'series') {
    if (type === 'movie') {
      navigation.push('MovieDetail', { id: mediaId })
    } else {
      navigation.navigate('SeriesDetail', { id: mediaId })
    }
  }

  return (
    <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false}>
      <View style={{ height: 300 }}>
        {backdropUri && (
          <Image
            source={{ uri: backdropUri }}
            style={{ width: '100%', height: 300 }}
            contentFit="cover"
            transition={500}
          />
        )}
        <LinearGradient
          colors={['transparent', '#0A0A0F']}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 150,
          }}
        />
        <View style={{ top: insets.top + 8 }} className="absolute left-4">
          <BackButton />
        </View>
        {!canWatch && <SubscriptionBanner isExpired={isExpired} />}
      </View>

      <View className="px-4">
        <Text className="text-2xl font-bold text-white">{movie.title}</Text>

        <View className="mt-2 flex-row flex-wrap items-center">
          <View className="mr-3 flex-row items-center">
            <Text className="text-xs text-rating">★</Text>
            <Text className="ml-1 text-sm font-bold text-white">
              {movie.rating.toFixed(1)}
            </Text>
          </View>
          <Text className="mr-3 text-sm text-text-secondary">
            {movie.releaseDate?.split('-')[0]}
          </Text>
          {movie.runtime > 0 && (
            <Text className="mr-3 text-sm text-text-secondary">
              {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}min
            </Text>
          )}
        </View>

        {movie.genres.length > 0 && (
          <View className="mt-2 flex-row flex-wrap">
            {movie.genres.map((genre) => (
              <View
                key={genre.id}
                className="mb-1 mr-2 rounded-chip bg-background-tertiary px-3 py-1"
              >
                <Text className="text-xs text-text-secondary">
                  {genre.name}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View className="mt-4 flex-row gap-3">
          <View className="flex-1">
            <Button
              title={
                !canWatch
                  ? '🔒 Assistir'
                  : hasProgress
                    ? `▶ Continuar em ${formatTime(movieProgress!.progressSeconds)}`
                    : '▶ Assistir'
              }
              onPress={handleWatch}
              disabled={!canWatch}
            />
            {hasProgress && (
              <View className="mt-2 h-1 overflow-hidden rounded-full bg-background-tertiary">
                <View
                  className="h-full rounded-full bg-accent"
                  style={{
                    width: `${(movieProgress!.progressSeconds / movieProgress!.durationSeconds) * 100}%`,
                  }}
                />
              </View>
            )}
          </View>
          <Pressable
            onPress={handleToggleFavorite}
            className="items-center justify-center rounded-button bg-background-secondary px-4"
          >
            <Text className="text-xl">{isFav ? '❤️' : '🤍'}</Text>
          </Pressable>
          <Pressable
            onPress={handleToggleWatchlist}
            className="items-center justify-center rounded-button bg-background-secondary px-4"
          >
            <Ionicons
              name={inWatchlist ? 'bookmark' : 'bookmark-outline'}
              size={22}
              color="#FFFFFF"
            />
          </Pressable>
        </View>

        {movie.tagline ? (
          <Text className="mt-4 text-sm italic text-text-muted">
            "{movie.tagline}"
          </Text>
        ) : null}

        <Text className="mt-3 text-base leading-6 text-text-secondary">
          {movie.overview}
        </Text>
      </View>

      {similarData && similarData.results.length > 0 && (
        <View className="mt-6">
          <Carousel
            title="Filmes Similares"
            data={similarData.results.slice(0, 15)}
            keyExtractor={(item: CatalogItem) => `similar-${item.id}`}
            renderItem={(item: CatalogItem) => (
              <MediaCard
                id={item.id}
                title={item.title}
                posterPath={item.posterPath}
                rating={item.rating}
                type="movie"
                onPress={handleMediaPress}
              />
            )}
          />
        </View>
      )}

      <View style={{ height: insets.bottom + 16 }} />
    </ScrollView>
  )
}
